import { describe, expect, it } from 'vitest';
import { leadCorpus } from '../fixtures/lead-corpus';
import { parseLead, parseLeadSubmission } from '../../lib/leads/validation';

describe('lead evaluation corpus and shared validation', () => {
  it('contains the documented labeled synthetic cases with unique IDs and texts', () => {
    expect(leadCorpus.filter((entry) => entry.kind === 'legitimate')).toHaveLength(100);
    expect(leadCorpus.filter((entry) => entry.kind === 'spam')).toHaveLength(100);
    expect(leadCorpus.filter((entry) => entry.kind === 'manipulation')).toHaveLength(30);
    expect(new Set(leadCorpus.map((entry) => entry.id)).size).toBe(230);
    expect(new Set(leadCorpus.map((entry) => entry.text)).size).toBe(230);
  });

  it('keeps every example within the actual form schema', () => {
    for (const entry of leadCorpus) {
      expect(parseLead({ name: 'Test user', contact: '@example', messenger: 'Telegram', botPurpose: entry.text, consent: true }).success, entry.id).toBe(true);
    }
  });

  it('accepts business fields without third-party tokens and strips unknown fields', () => {
    const lead = { name: 'Test user', contact: '@example', messenger: 'Telegram', botPurpose: 'Please build a booking bot.', consent: true };
    expect(parseLead(lead).success).toBe(true);
    expect(parseLeadSubmission(lead).success).toBe(true);
    const parsed = parseLeadSubmission({ ...lead, attackerField: 'not forwarded' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).not.toHaveProperty('attackerField');
  });
});
