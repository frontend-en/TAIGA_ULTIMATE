export type LeadRequestAdmissionResult =
  | { allowed: true; release: () => void }
  | { allowed: false; retryAfterSeconds: number };

export type LeadRequestAdmission = (now: number) => LeadRequestAdmissionResult;

interface AdmissionLimits {
  maxPerMinute?: number;
  maxInFlight?: number;
}

/** A hard ceiling before body reads, independent of submission validation/configuration. */
export function createLeadRequestAdmission({
  maxPerMinute = 120,
  maxInFlight = 16,
}: AdmissionLimits = {}): LeadRequestAdmission {
  if (![maxPerMinute, maxInFlight].every((value) => Number.isSafeInteger(value) && value > 0)) {
    throw new Error('Invalid request admission capacity');
  }
  let attempts: number[] = [];
  let inFlight = 0;
  let lastTime = 0;

  return (now) => {
    if (!Number.isSafeInteger(now) || now < 0) throw new Error('Invalid request admission timestamp');
    lastTime = Math.max(lastTime, now);
    attempts = attempts.filter((createdAt) => createdAt > lastTime - 60_000);
    if (attempts.length >= maxPerMinute) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((attempts[0] + 60_000 - lastTime) / 1000)) };
    }
    attempts.push(lastTime);
    if (inFlight >= maxInFlight) return { allowed: false, retryAfterSeconds: 1 };
    inFlight++;
    let released = false;
    return {
      allowed: true,
      release() {
        if (released) return;
        released = true;
        inFlight--;
      },
    };
  };
}

// All handler instances in this process share this bound. Like the submission
// store, it resets on restart; a multi-process deployment also needs edge limits.
export const admitLeadRequest = createLeadRequestAdmission();
