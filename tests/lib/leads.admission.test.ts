import { describe, expect, it } from 'vitest';

import { createLeadRequestAdmission } from '../../lib/leads/admission';

describe('pre-body request admission', () => {
  it('bounds concurrent requests and makes release idempotent', () => {
    const admit = createLeadRequestAdmission({ maxInFlight: 1 });
    const first = admit(1000);
    expect(first.allowed).toBe(true);
    expect(admit(1000)).toEqual({ allowed: false, retryAfterSeconds: 1 });
    if (!first.allowed) throw new Error('Expected first admission');
    first.release();
    first.release();
    const next = admit(1000);
    expect(next.allowed).toBe(true);
    expect(admit(1000).allowed).toBe(false);
    if (next.allowed) next.release();
  });

  it('uses a rolling minute, includes concurrency rejections and cannot grow on denied floods', () => {
    const admit = createLeadRequestAdmission({ maxInFlight: 1, maxPerMinute: 2 });
    const first = admit(1000);
    expect(first.allowed).toBe(true);
    expect(admit(2000)).toEqual({ allowed: false, retryAfterSeconds: 1 });
    if (first.allowed) first.release();
    for (let index = 0; index < 1000; index++) {
      expect(admit(3000)).toEqual({ allowed: false, retryAfterSeconds: 58 });
    }
    const next = admit(61_000);
    expect(next.allowed).toBe(true);
    if (next.allowed) next.release();
    expect(admit(61_000)).toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(admit(62_000).allowed).toBe(true);
  });

  it('does not reset the rolling window if the clock moves backwards', () => {
    const admit = createLeadRequestAdmission({ maxPerMinute: 1 });
    const first = admit(60_000);
    if (first.allowed) first.release();
    expect(admit(0)).toEqual({ allowed: false, retryAfterSeconds: 60 });
  });

  it.each([{ maxPerMinute: 0 }, { maxInFlight: -1 }, { maxPerMinute: Infinity }, { maxInFlight: 1.5 }])('rejects invalid limits %j', (limits) => {
    expect(() => createLeadRequestAdmission(limits)).toThrow('capacity');
  });
});
