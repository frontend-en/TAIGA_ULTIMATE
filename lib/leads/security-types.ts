import type { Lead } from './validation';

export interface LeadSecurityConfig {
  mode: 'observe' | 'enforce';
  model: string;
  apiKey: string;
  reviewRecipient: string;
  hmacSecret: string;
  trustProxy: boolean;
  limits: {
    ipMinute: number;
    ipDay: number;
    globalMinute: number;
    globalDay: number;
    aiDay: number;
  };
}

export interface LimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export type SubmissionClaim =
  | { status: 'acquired' }
  | { status: 'complete' }
  | { status: 'pending'; retryAfterSeconds: number };

export interface LeadSecurityStore {
  checkRateLimit(ipHash: string | undefined, now: number, signal?: AbortSignal): Promise<LimitResult>;
  acquireSubmission(fingerprint: string, owner: string, signal?: AbortSignal): Promise<SubmissionClaim>;
  completeSubmission(fingerprint: string, owner: string, signal?: AbortSignal): Promise<boolean>;
  releaseSubmission(fingerprint: string, owner: string, signal?: AbortSignal): Promise<void>;
  reserveAiAttempt(now: number, signal?: AbortSignal): Promise<{ allowed: boolean; used: number; limit: number }>;
}

export interface LeadClassification {
  route: 'normal' | 'review' | 'spam';
  reason: string;
  model: string;
  rubricVersion: string;
  spam?: number;
  manipulation?: number;
}

export type LeadClassifier = (lead: Lead, config: LeadSecurityConfig, signal?: AbortSignal) => Promise<LeadClassification>;
