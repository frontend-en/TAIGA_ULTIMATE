import { describe, expect, it, vi } from 'vitest';

import type { LeadClassification, LeadClassifier } from '../../lib/leads/security-types';
import { curatedLeadCases, holdoutLeadCases, type LeadEvaluationCase } from '../fixtures/lead-evaluation-corpus';
import { testSecurityConfig } from '../fixtures/lead-security-config';
import { evaluateLeadCases, selectLeadEvaluationCases, summarizeLeadEvaluation } from '../helpers/lead-evaluation';

const config = testSecurityConfig();
const normal: LeadClassification = { model: config.model, rubricVersion: 'mock', route: 'normal', reason: 'AI_NORMAL', spam: 0, manipulation: 0 };

describe('explicit Jev evaluation harness without provider calls', () => {
  it('keeps the independent curated and holdout sets disjoint with the intended class balance', () => {
    for (const [cases, counts] of [[curatedLeadCases, [12, 6, 6]], [holdoutLeadCases, [6, 3, 3]]] as const) {
      expect(['legitimate', 'spam', 'manipulation'].map((kind) => cases.filter((entry) => entry.kind === kind).length)).toEqual(counts);
      expect(new Set(cases.map((entry) => entry.text)).size).toBe(cases.length);
    }
    expect(new Set([...curatedLeadCases, ...holdoutLeadCases].map((entry) => entry.id)).size).toBe(36);
  });

  it('selects only named IDs in explicit order and rejects unknown or duplicate selectors', () => {
    expect(selectLeadEvaluationCases(curatedLeadCases, 'curated-manip-04,curated-legit-01').map((entry) => entry.id))
      .toEqual(['curated-manip-04', 'curated-legit-01']);
    for (const ids of ['', 'unknown', 'curated-legit-01,curated-legit-01']) {
      expect(() => selectLeadEvaluationCases(curatedLeadCases, ids)).toThrow();
    }
  });

  it.each([
    { maxCalls: 0 }, { maxCalls: 1 }, { maxCalls: Number.NaN }, { concurrency: 0 }, { concurrency: 3 },
  ])('rejects an invalid or insufficient call budget before invoking a classifier %j', async (options) => {
    const classify = vi.fn<LeadClassifier>();
    await expect(evaluateLeadCases(curatedLeadCases.slice(0, 2), config, classify, options)).rejects.toThrow();
    expect(classify).not.toHaveBeenCalled();
  });

  it('bounds concurrency at two, preserves case order and passes an explicit contact override', async () => {
    let active = 0;
    let peak = 0;
    const cases = curatedLeadCases.filter((entry) => entry.kind === 'manipulation');
    const classify = vi.fn<LeadClassifier>().mockImplementation(async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active--;
      return normal;
    });
    const results = await evaluateLeadCases(cases, config, classify, { maxCalls: cases.length });
    expect(peak).toBe(2);
    expect(classify).toHaveBeenCalledTimes(cases.length);
    expect(results.map((entry) => entry.id)).toEqual(cases.map((entry) => entry.id));
    expect(classify.mock.calls[3][0].contact).toBe(cases[3].contact);
  });

  it('reports review as unsuccessful, separates provider failures and recognizes manipulation rejections', async () => {
    const kinds = ['legitimate', 'legitimate', 'spam', 'spam', 'manipulation', 'manipulation'] as const;
    const cases: LeadEvaluationCase[] = kinds.map((kind, index) => ({ id: `case-${index}`, kind, text: 'A synthetic test case.' }));
    const answers: LeadClassification[] = [
      normal,
      { ...normal, route: 'review', reason: 'AI_TIMEOUT' },
      { ...normal, route: 'spam', reason: 'AI_SPAM', spam: 1 },
      { ...normal, route: 'review', reason: 'AI_UNCERTAIN', spam: 0.5 },
      { ...normal, route: 'spam', reason: 'AI_MANIPULATION', manipulation: 1 },
      normal,
    ];
    const classify = vi.fn<LeadClassifier>().mockImplementation(async () => answers.shift()!);
    const results = await evaluateLeadCases(cases, config, classify);
    expect(summarizeLeadEvaluation(results)).toMatchObject({
      counts: { total: 6, legitimate: 2, spam: 2, manipulation: 2 },
      matrix: {
        legitimate: { normal: 1, review: 1, rejected: 0 },
        spam: { normal: 0, review: 1, rejected: 1 },
        manipulation: { normal: 1, review: 0, rejected: 1 },
      },
      strictCorrect: { count: 3, total: 6, rate: 0.5 },
      legitimateNormal: { count: 1, total: 2, rate: 0.5 },
      attackRejectionRecall: { count: 2, total: 4, rate: 0.5 },
      providerFailures: ['case-1'], semanticReview: ['case-3'],
      missedSpam: ['case-3'], missedManipulation: ['case-5'], falseRejections: [],
    });
    expect(results[4].resultType).toBe('conclusive');
  });

  it('does not retry unexpected classifier errors or leak their messages', async () => {
    const classify = vi.fn<LeadClassifier>().mockRejectedValue(new Error('private-key-and-provider-body'));
    const results = await evaluateLeadCases(curatedLeadCases.slice(0, 1), config, classify);
    expect(classify).toHaveBeenCalledOnce();
    expect(results[0]).toMatchObject({ outcome: 'review', reason: 'AI_UNAVAILABLE', resultType: 'provider-failure' });
    expect(JSON.stringify(results)).not.toContain('private-key');
  });
});
