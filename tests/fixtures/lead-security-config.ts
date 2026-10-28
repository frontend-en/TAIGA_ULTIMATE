import type { LeadSecurityConfig } from '../../lib/leads/security-types';

export function testSecurityConfig(overrides: Partial<LeadSecurityConfig> = {}): LeadSecurityConfig {
  return {
    mode: 'observe', model: 'jev-1.14.0', apiKey: 'test-key',
    reviewRecipient: 'review@example.com', hmacSecret: 'test-only-secret-at-least-32-bytes-long',
    trustProxy: false,
    limits: { ipMinute: 5, ipDay: 30, globalMinute: 60, globalDay: 1000, aiDay: 500 },
    ...overrides,
  };
}
