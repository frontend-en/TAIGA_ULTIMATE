import type { LeadSecurityConfig, LeadSecurityStore } from './security-types';

const minuteMs = 60_000;
const dayMs = 86_400_000;
const pendingMs = 120_000;
const completedMs = 600_000;

interface StateOptions {
  maxIpEntries?: number;
  maxSubmissions?: number;
  maxRateEvents?: number;
}

interface Submission {
  status: 'pending' | 'complete';
  owner: string;
  expiresAt: number;
}

interface DailyCounter { day: number; used: number }

class LeadSecurityState {
  readonly ips = new Map<string, number[]>();
  readonly submissions = new Map<string, Submission>();
  globalMinute: number[] = [];
  globalDay: DailyCounter = { day: -1, used: 0 };
  aiDay: DailyCounter = { day: -1, used: 0 };
  rateEvents = 0;
  rateTime = 0;
  claimTime = 0;
  aiTime = 0;
  readonly caps: Required<StateOptions>;

  constructor(options: StateOptions) {
    this.caps = {
      maxIpEntries: options.maxIpEntries ?? 10_000,
      maxSubmissions: options.maxSubmissions ?? 10_000,
      maxRateEvents: options.maxRateEvents ?? 100_000,
    };
    if (!Object.values(this.caps).every((value) => Number.isSafeInteger(value) && value > 0)) {
      throw new Error('Invalid local security store capacity');
    }
  }
}

/** Isolated state for tests; production facades share the module's process-local state. */
export function createLeadSecurityState(options: StateOptions = {}) {
  return new LeadSecurityState(options);
}

// No timers or persistence: state expires on access and resets on a process restart.
// Multiple Node.js processes have independent limits, quotas and deduplication.
const processState = createLeadSecurityState();

interface StoreOptions {
  state?: LeadSecurityState;
  now?: () => number;
}

function timestamp(value: number) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 8_640_000_000_000_000) {
    throw new Error('Invalid local security store timestamp');
  }
  return value;
}

function digest(value: string) {
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error('A HMAC digest is required for security store keys');
  return value;
}

function ownerToken(value: string) {
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(value)) throw new Error('Invalid submission owner token');
  return value;
}

function checkSignal(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error('Local security store request aborted');
}

function pruneRates(state: LeadSecurityState, now: number) {
  const global = state.globalMinute.filter((createdAt) => createdAt > now - minuteMs);
  state.rateEvents -= state.globalMinute.length - global.length;
  state.globalMinute = global;
  for (const [ip, entries] of state.ips) {
    const active = entries.filter((createdAt) => createdAt > now - dayMs);
    state.rateEvents -= entries.length - active.length;
    if (active.length === 0) state.ips.delete(ip);
    else state.ips.set(ip, active);
  }
}

function pruneSubmissions(state: LeadSecurityState, now: number) {
  for (const [key, entry] of state.submissions) {
    if (entry.expiresAt <= now) state.submissions.delete(key);
  }
}

export function createLeadSecurityStore(config: LeadSecurityConfig, options: StoreOptions = {}): LeadSecurityStore {
  const state = options.state ?? processState;
  const clock = options.now ?? Date.now;
  const claimTime = () => {
    state.claimTime = Math.max(state.claimTime, timestamp(clock()));
    pruneSubmissions(state, state.claimTime);
    return state.claimTime;
  };

  // Every method mutates synchronously, before returning its promise. There are no
  // await boundaries that could let two requests acquire the same local slot.
  return {
    async checkRateLimit(ipHash, time, signal) {
      checkSignal(signal);
      const ip = ipHash === undefined ? undefined : digest(ipHash);
      const now = Math.max(state.rateTime, timestamp(time));
      state.rateTime = now;
      pruneRates(state, now);
      const day = Math.floor(now / dayMs);
      if (state.globalDay.day !== day) state.globalDay = { day, used: 0 };
      const entries = ip === undefined ? undefined : state.ips.get(ip);
      const ipMinute = entries?.filter((createdAt) => createdAt > now - minuteMs) ?? [];
      let retryMs = 0;
      if (state.globalMinute.length >= config.limits.globalMinute) {
        retryMs = Math.max(retryMs, state.globalMinute[0] + minuteMs - now);
      }
      if (state.globalDay.used >= config.limits.globalDay) {
        retryMs = Math.max(retryMs, (day + 1) * dayMs - now);
      }
      if (ip !== undefined && ipMinute.length >= config.limits.ipMinute) {
        retryMs = Math.max(retryMs, ipMinute[0] + minuteMs - now);
      }
      if (entries && entries.length >= config.limits.ipDay) {
        retryMs = Math.max(retryMs, entries[0] + dayMs - now);
      }
      if (retryMs > 0) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryMs / 1000)) };

      const newIp = ip !== undefined && !state.ips.has(ip);
      const addedEvents = ip === undefined ? 1 : 2;
      if ((newIp && state.ips.size >= state.caps.maxIpEntries) ||
          state.rateEvents + addedEvents > state.caps.maxRateEvents) {
        throw new Error('Local security store capacity exhausted');
      }
      state.globalMinute.push(now);
      state.globalDay.used += 1;
      if (ip !== undefined) {
        const bucket = entries ?? [];
        bucket.push(now);
        state.ips.set(ip, bucket);
      }
      state.rateEvents += addedEvents;
      return { allowed: true, retryAfterSeconds: 0 };
    },
    async acquireSubmission(fingerprint, owner, signal) {
      checkSignal(signal);
      const key = digest(fingerprint);
      const token = ownerToken(owner);
      const now = claimTime();
      const existing = state.submissions.get(key);
      if (existing?.status === 'complete') return { status: 'complete' };
      if (existing) return { status: 'pending', retryAfterSeconds: Math.max(1, Math.ceil((existing.expiresAt - now) / 1000)) };
      if (state.submissions.size >= state.caps.maxSubmissions) throw new Error('Local security store capacity exhausted');
      state.submissions.set(key, { status: 'pending', owner: token, expiresAt: now + pendingMs });
      return { status: 'acquired' };
    },
    async completeSubmission(fingerprint, owner, signal) {
      checkSignal(signal);
      const key = digest(fingerprint);
      const token = ownerToken(owner);
      const now = claimTime();
      const existing = state.submissions.get(key);
      if (!existing || existing.status !== 'pending' || existing.owner !== token) return false;
      state.submissions.set(key, { status: 'complete', owner: token, expiresAt: now + completedMs });
      return true;
    },
    async releaseSubmission(fingerprint, owner, signal) {
      checkSignal(signal);
      const key = digest(fingerprint);
      const token = ownerToken(owner);
      claimTime();
      const existing = state.submissions.get(key);
      if (existing?.status === 'pending' && existing.owner === token) state.submissions.delete(key);
    },
    async reserveAiAttempt(time, signal) {
      checkSignal(signal);
      const now = Math.max(state.aiTime, timestamp(time));
      state.aiTime = now;
      const day = Math.floor(now / dayMs);
      if (state.aiDay.day !== day) state.aiDay = { day, used: 0 };
      if (state.aiDay.used >= config.limits.aiDay) {
        return { allowed: false, used: state.aiDay.used, limit: config.limits.aiDay };
      }
      state.aiDay.used += 1;
      return { allowed: true, used: state.aiDay.used, limit: config.limits.aiDay };
    },
  };
}
