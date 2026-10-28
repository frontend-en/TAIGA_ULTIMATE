import { randomBytes } from 'node:crypto';
import { z } from 'zod';

import type { LeadSecurityConfig } from './security-types';

const processHmacSecret = randomBytes(32).toString('hex');

function required(env: Record<string, string | undefined>, key: string) {
  const value = env[key]?.trim();
  if (!value) throw new Error(`Missing lead security setting: ${key}`);
  return value;
}

function limit(env: Record<string, string | undefined>, key: string, fallback: number) {
  const raw = env[key];
  if (raw === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
    throw new Error(`Invalid lead security setting: ${key}`);
  }
  return Number(raw);
}

export function readLeadSecurityConfig(
  env: Record<string, string | undefined> = process.env,
): LeadSecurityConfig {
  const mode = env.LEAD_AI_MODE ?? 'observe';
  if (mode !== 'observe' && mode !== 'enforce') {
    throw new Error('Invalid lead security setting: LEAD_AI_MODE');
  }
  const model = env.LEAD_AI_MODEL ?? 'jev-1.14.0';
  if (!/^jev-\d+\.\d+\.\d+$/.test(model)) {
    throw new Error('LEAD_AI_MODEL must identify a fixed model version');
  }
  const trustProxy = env.LEAD_TRUST_PROXY ?? 'false';
  if (trustProxy !== 'true' && trustProxy !== 'false') {
    throw new Error('Invalid lead security setting: LEAD_TRUST_PROXY');
  }
  const hmacSecret = env.LEAD_HMAC_SECRET?.trim() || processHmacSecret;
  if (Buffer.byteLength(hmacSecret, 'utf8') < 32) {
    throw new Error('LEAD_HMAC_SECRET must contain at least 32 bytes');
  }
  const reviewRecipient = required(env, 'LEAD_REVIEW_RECIPIENT');
  if (!z.string().email().safeParse(reviewRecipient).success) {
    throw new Error('Invalid lead security setting: LEAD_REVIEW_RECIPIENT');
  }

  return {
    mode,
    model,
    apiKey: required(env, 'TYPESAFE_API_KEY'),
    reviewRecipient,
    hmacSecret,
    trustProxy: trustProxy === 'true',
    limits: {
      ipMinute: limit(env, 'LEAD_IP_MINUTE_LIMIT', 5),
      ipDay: limit(env, 'LEAD_IP_DAY_LIMIT', 30),
      globalMinute: limit(env, 'LEAD_GLOBAL_MINUTE_LIMIT', 60),
      globalDay: limit(env, 'LEAD_GLOBAL_DAY_LIMIT', 1000),
      aiDay: limit(env, 'LEAD_AI_DAY_LIMIT', 500),
    },
  };
}
