import { createHmac, randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import { NextResponse } from 'next/server';

import { siteOrigin } from '../site/business';
import { admitLeadRequest, type LeadRequestAdmission } from './admission';
import { classifyLead, LEAD_RUBRIC_VERSION } from './classifier';
import { createSmtpLeadTransport, deliverLead, type LeadMailTransport } from './mailer';
import { readLeadSecurityConfig } from './security-config';
import { createLeadSecurityStore } from './security-store';
import type { LeadClassification, LeadClassifier, LeadSecurityConfig, LeadSecurityStore } from './security-types';
import { isHoneypotSubmission, parseLeadSubmission, type Lead } from './validation';

type LogValue = string | number | undefined;
export type LeadLogger = (event: Record<string, LogValue>) => void;

export interface LeadPostHandlerDependencies {
  admitRequest?: LeadRequestAdmission;
  createTransport?: () => LeadMailTransport;
  getConfig?: () => LeadSecurityConfig;
  createStore?: (config: LeadSecurityConfig) => LeadSecurityStore;
  classify?: LeadClassifier;
  logger?: LeadLogger;
  now?: () => number;
  deliveryTimeoutMs?: number;
  requestBodyTimeoutMs?: number;
  requestTimeoutMs?: number;
}

const maxRequestBodyBytes = 16 * 1024;
const fields = ['name', 'contact', 'messenger', 'botPurpose', 'consent'] as const;

function response(status: number, code: string, retryAfterSeconds?: number) {
  return NextResponse.json({ ok: false, code }, {
    status,
    headers: retryAfterSeconds === undefined ? undefined : {
      'Retry-After': String(Math.max(1, Math.ceil(retryAfterSeconds))),
    },
  });
}

function successResponse() {
  return NextResponse.json({ ok: true });
}

function acceptsRequest(request: Request) {
  if (request.headers.get('sec-fetch-site')?.trim().toLowerCase() === 'cross-site') return false;
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') return false;
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const submittedOrigin = new URL(origin).origin;
    return submittedOrigin === siteOrigin ||
      (process.env.NODE_ENV !== 'production' && submittedOrigin === new URL(request.url).origin);
  } catch {
    return false;
  }
}

async function readJsonBody(request: Request, timeoutMs: number, signal: AbortSignal): Promise<unknown> {
  const contentLength = Number(request.headers.get('content-length'));
  if ((Number.isFinite(contentLength) && contentLength > maxRequestBodyBytes) || !request.body) {
    throw new Error('Invalid request body');
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  let expired = false;
  const cancel = () => {
    expired = true;
    void reader.cancel().catch(() => undefined);
  };
  const timer = setTimeout(cancel, timeoutMs);
  signal.addEventListener('abort', cancel, { once: true });
  try {
    signal.throwIfAborted();
    while (true) {
      const { done, value } = await reader.read();
      if (expired || signal.aborted) throw new Error('Request body timed out');
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxRequestBodyBytes) {
        cancel();
        throw new Error('Request body too large');
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', cancel);
    reader.releaseLock();
  }
}

function hash(secret: string, namespace: string, value: string) {
  return createHmac('sha256', secret).update(`${namespace}\0${value}`).digest('hex');
}

function fingerprint(lead: Lead, secret: string) {
  return hash(secret, 'submission', JSON.stringify({
    name: lead.name,
    contact: lead.contact,
    messenger: lead.messenger,
    botPurpose: lead.botPurpose,
    consent: lead.consent,
  }));
}

async function deliverWithTimeout(
  transport: LeadMailTransport,
  lead: Lead,
  review: Parameters<typeof deliverLead>[2],
  timeoutMs: number,
  signal: AbortSignal,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abort: (() => void) | undefined;
  const stopTransport = () => {
    try { transport.close?.(); } catch { /* Preserve the sanitized delivery result. */ }
  };
  try {
    signal.throwIfAborted();
    await Promise.race([
      deliverLead(transport, lead, review),
      new Promise<never>((_, reject) => {
        const stop = () => {
          stopTransport();
          reject(new Error('SMTP outcome unconfirmed'));
        };
        abort = stop;
        timer = setTimeout(stop, timeoutMs);
        signal.addEventListener('abort', stop, { once: true });
        if (signal.aborted) stop();
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
    if (abort) signal.removeEventListener('abort', abort);
  }
}

export function createLeadPostHandler({
  admitRequest = admitLeadRequest,
  createTransport = createSmtpLeadTransport,
  getConfig = readLeadSecurityConfig,
  createStore = createLeadSecurityStore,
  classify = classifyLead,
  logger = (event) => console.info(JSON.stringify(event)),
  now = Date.now,
  deliveryTimeoutMs = 20_000,
  requestBodyTimeoutMs = 5_000,
  requestTimeoutMs = 40_000,
}: LeadPostHandlerDependencies = {}) {
  return async function POST(request: Request) {
    const startedAt = now();
    const controller = new AbortController();
    const { signal } = controller;
    const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
    const abortFromRequest = () => controller.abort();
    request.signal.addEventListener('abort', abortFromRequest, { once: true });
    if (request.signal.aborted) controller.abort();
    const metadata: Record<string, LogValue> = {
      event: 'lead_submission', requestId: randomUUID(), reason: 'UNEXPECTED_ERROR', status: 503,
    };
    let delivered = false;
    let releaseAdmission: (() => void) | undefined;
    let store: LeadSecurityStore | undefined;
    let claim: { fingerprint: string; owner: string } | undefined;
    const log = (event: Record<string, LogValue>) => {
      try { logger(event); } catch { /* Logging must not affect delivery. */ }
    };
    const finish = (status: number, code: string, retryAfter?: number) => {
      metadata.status = status;
      metadata.reason = code;
      return response(status, code, retryAfter);
    };
    const run = async () => {
      const admission = admitRequest(now());
      if (!admission.allowed) {
        void request.body?.cancel().catch(() => undefined);
        return finish(429, 'RATE_LIMITED', admission.retryAfterSeconds);
      }
      releaseAdmission = admission.release;
      if (!acceptsRequest(request)) return finish(400, 'VALIDATION_ERROR');
      let body: unknown;
      try {
        body = await readJsonBody(request, requestBodyTimeoutMs, signal);
      } catch {
        return finish(400, 'VALIDATION_ERROR');
      }
      if (isHoneypotSubmission(body)) {
        metadata.status = 200;
        metadata.reason = 'HONEYPOT';
        return successResponse();
      }
      const parsed = parseLeadSubmission(body);
      if (!parsed.success) {
        metadata.status = 400;
        metadata.reason = 'VALIDATION_ERROR';
        const fieldErrors: Partial<Record<(typeof fields)[number], string>> = {};
        for (const issue of parsed.error.issues) {
          const field = issue.path[0];
          if (fields.includes(field as (typeof fields)[number])) {
            fieldErrors[field as (typeof fields)[number]] = issue.code === 'too_big' ? 'tooLong' : 'invalid';
          }
        }
        return NextResponse.json({ ok: false, code: 'VALIDATION_ERROR', fieldErrors }, { status: 400 });
      }
      signal.throwIfAborted();
      let config: LeadSecurityConfig;
      try {
        config = getConfig();
      } catch {
        metadata.reason = 'CONFIGURATION_ERROR';
        return response(503, 'SERVICE_UNAVAILABLE');
      }
      metadata.model = config.model;
      metadata.rubricVersion = LEAD_RUBRIC_VERSION;
      const forwardedIp = request.headers.get('x-real-ip')?.trim();
      const clientIp = config.trustProxy && forwardedIp && isIP(forwardedIp) ? forwardedIp : undefined;
      metadata.limitScope = clientIp ? 'ip-and-global' : 'global';
      store = createStore(config);
      const rate = await store.checkRateLimit(clientIp ? hash(config.hmacSecret, 'ip', clientIp) : undefined, now(), signal);
      signal.throwIfAborted();
      if (!rate.allowed) return finish(429, 'RATE_LIMITED', rate.retryAfterSeconds);

      const lead: Lead = {
        name: parsed.data.name,
        contact: parsed.data.contact,
        messenger: parsed.data.messenger,
        botPurpose: parsed.data.botPurpose,
        consent: parsed.data.consent,
      };
      const key = fingerprint(lead, config.hmacSecret);
      const owner = randomUUID();
      const acquired = await store.acquireSubmission(key, owner, signal);
      signal.throwIfAborted();
      if (acquired.status === 'complete') {
        metadata.status = 200;
        metadata.reason = 'DUPLICATE';
        return successResponse();
      }
      if (acquired.status === 'pending') return finish(409, 'SUBMISSION_IN_PROGRESS', acquired.retryAfterSeconds);
      claim = { fingerprint: key, owner };

      const quota = await store.reserveAiAttempt(now(), signal);
      signal.throwIfAborted();
      metadata.aiAttempts = quota.used;
      metadata.aiLimit = quota.limit;
      let classification: LeadClassification = {
        route: 'review', reason: 'AI_QUOTA_EXHAUSTED', model: config.model, rubricVersion: LEAD_RUBRIC_VERSION,
      };
      if (quota.allowed) {
        const classifiedAt = now();
        try {
          classification = await classify(lead, config, signal);
        } catch {
          classification = { ...classification, reason: 'AI_UNAVAILABLE' };
        }
        metadata.aiMs = now() - classifiedAt;
      }
      signal.throwIfAborted();
      metadata.classification = classification.route;
      metadata.route = classification.route === 'normal' ? 'normal' : 'review';
      metadata.reason = classification.reason;
      metadata.spam = classification.spam;
      metadata.manipulation = classification.manipulation;
      metadata.mode = config.mode;
      if (classification.route === 'spam' && config.mode === 'enforce') {
        metadata.route = 'rejected';
        metadata.status = 422;
        return response(422, 'SUBMISSION_REJECTED');
      }
      const review = classification.route === 'normal' ? undefined : {
        recipient: config.reviewRecipient, classification,
      };
      signal.throwIfAborted();
      const sentAt = now();
      try {
        await deliverWithTimeout(createTransport(), lead, review, deliveryTimeoutMs, signal);
      } catch {
        metadata.smtpMs = now() - sentAt;
        metadata.reason = 'SMTP_UNCONFIRMED';
        throw new Error('SMTP outcome unconfirmed');
      }
      delivered = true;
      metadata.smtpMs = now() - sentAt;
      metadata.status = 200;
      try {
        const completed = await store.completeSubmission(key, owner, signal);
        if (!completed) log({ event: 'lead_completion_unconfirmed', requestId: metadata.requestId, reason: 'LOCK_OWNERSHIP_LOST' });
      } catch {
        log({ event: 'lead_completion_unconfirmed', requestId: metadata.requestId, reason: 'STATE_UNAVAILABLE_AFTER_SMTP' });
      }
      return successResponse();
    };

    let abortListener: (() => void) | undefined;
    try {
      return await Promise.race([
        run(),
        new Promise<never>((_, reject) => {
          abortListener = () => reject(new Error('Request deadline exceeded'));
          signal.addEventListener('abort', abortListener, { once: true });
          if (signal.aborted) abortListener();
        }),
      ]);
    } catch {
      if (delivered) return successResponse();
      metadata.status = 503;
      metadata.reason = signal.aborted ? 'REQUEST_ABORTED' :
        metadata.reason === 'SMTP_UNCONFIRMED' ? 'SMTP_UNCONFIRMED' : 'SERVICE_UNAVAILABLE';
      return response(503, 'SERVICE_UNAVAILABLE');
    } finally {
      releaseAdmission?.();
      if (abortListener) signal.removeEventListener('abort', abortListener);
      request.signal.removeEventListener('abort', abortFromRequest);
      if (claim && store && !delivered) {
        try { await store.releaseSubmission(claim.fingerprint, claim.owner, signal); } catch {
          log({ event: 'lead_release_unconfirmed', requestId: metadata.requestId, reason: 'STATE_UNAVAILABLE' });
        }
      }
      clearTimeout(timer);
      metadata.durationMs = now() - startedAt;
      log(metadata);
    }
  };
}
