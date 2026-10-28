import type { LeadClassification, LeadClassifier, LeadSecurityConfig } from '../../lib/leads/security-types';
import type { LeadEvaluationCase } from '../fixtures/lead-evaluation-corpus';

export interface LeadEvaluationResult extends LeadClassification {
  id: string;
  expected: LeadEvaluationCase['kind'];
  expectedOutcome: 'normal' | 'rejected';
  outcome: 'normal' | 'review' | 'rejected';
  resultType: 'conclusive' | 'semantic-review' | 'provider-failure';
  durationMs: number;
}

const semanticReasons = new Set(['AI_NORMAL', 'AI_SPAM', 'AI_MANIPULATION', 'AI_UNCERTAIN']);

export function selectLeadEvaluationCases(cases: LeadEvaluationCase[], ids?: string): LeadEvaluationCase[] {
  if (new Set(cases.map((entry) => entry.id)).size !== cases.length) throw new Error('Evaluation case IDs must be unique.');
  if (ids === undefined) return cases;
  const requested = ids.split(',').map((id) => id.trim());
  if (requested.some((id) => !id) || new Set(requested).size !== requested.length) throw new Error('Provide distinct, nonempty evaluation case IDs.');
  const known = new Map(cases.map((entry) => [entry.id, entry]));
  return requested.map((id) => {
    const entry = known.get(id);
    if (!entry) throw new Error(`Unknown evaluation case: ${id}`);
    return entry;
  });
}

export async function evaluateLeadCases(
  cases: LeadEvaluationCase[],
  config: LeadSecurityConfig,
  classify: LeadClassifier,
  { concurrency = 2, maxCalls = cases.length }: { concurrency?: number; maxCalls?: number } = {},
): Promise<LeadEvaluationResult[]> {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 2) throw new Error('Evaluation concurrency must be 1 or 2.');
  if (!Number.isSafeInteger(maxCalls) || maxCalls < 1 || cases.length > maxCalls) throw new Error('Selected cases exceed the explicit evaluation call budget.');
  const results: LeadEvaluationResult[] = new Array(cases.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, cases.length) }, async () => {
    while (next < cases.length) {
      const index = next++;
      const entry = cases[index];
      const started = Date.now();
      let result: LeadClassification;
      try {
        result = await classify({ name: 'Synthetic evaluation user', contact: entry.contact ?? '@evaluation_user', messenger: 'Telegram', botPurpose: entry.text, consent: true }, config);
      } catch {
        result = { model: config.model, rubricVersion: 'unavailable', route: 'review', reason: 'AI_UNAVAILABLE' };
      }
      results[index] = {
        id: entry.id,
        expected: entry.kind,
        expectedOutcome: entry.kind === 'legitimate' ? 'normal' : 'rejected',
        ...result,
        outcome: result.route === 'spam' ? 'rejected' : result.route,
        resultType: !semanticReasons.has(result.reason) ? 'provider-failure' : result.reason === 'AI_UNCERTAIN' ? 'semantic-review' : 'conclusive',
        durationMs: Date.now() - started,
      };
    }
  }));
  return results;
}

export function summarizeLeadEvaluation(results: LeadEvaluationResult[]) {
  const labels = ['legitimate', 'spam', 'manipulation'] as const;
  const matrix = Object.fromEntries(labels.map((label) => [label, {
    normal: results.filter((entry) => entry.expected === label && entry.outcome === 'normal').length,
    review: results.filter((entry) => entry.expected === label && entry.outcome === 'review').length,
    rejected: results.filter((entry) => entry.expected === label && entry.outcome === 'rejected').length,
  }]));
  const metric = (matches: LeadEvaluationResult[], denominator: LeadEvaluationResult[]) => ({ count: matches.length, total: denominator.length, rate: denominator.length ? matches.length / denominator.length : null });
  const legitimate = results.filter((entry) => entry.expected === 'legitimate');
  const attacks = results.filter((entry) => entry.expected !== 'legitimate');
  const falseRejections = legitimate.filter((entry) => entry.outcome === 'rejected').map((entry) => entry.id);
  const providerFailures = results.filter((entry) => entry.resultType === 'provider-failure').map((entry) => entry.id);
  return {
    counts: { total: results.length, ...Object.fromEntries(labels.map((label) => [label, results.filter((entry) => entry.expected === label).length])) },
    matrix,
    strictCorrect: metric(results.filter((entry) => entry.resultType === 'conclusive' && entry.expectedOutcome === entry.outcome), results),
    legitimateNormal: metric(legitimate.filter((entry) => entry.outcome === 'normal'), legitimate),
    attackRejectionRecall: metric(attacks.filter((entry) => entry.outcome === 'rejected'), attacks),
    spamRejectionRecall: metric(results.filter((entry) => entry.expected === 'spam' && entry.outcome === 'rejected'), results.filter((entry) => entry.expected === 'spam')),
    manipulationRejectionRecall: metric(results.filter((entry) => entry.expected === 'manipulation' && entry.outcome === 'rejected'), results.filter((entry) => entry.expected === 'manipulation')),
    reviewRate: metric(results.filter((entry) => entry.outcome === 'review'), results),
    semanticReview: results.filter((entry) => entry.resultType === 'semantic-review').map((entry) => entry.id),
    falseRejections,
    missedSpam: results.filter((entry) => entry.expected === 'spam' && entry.outcome !== 'rejected').map((entry) => entry.id),
    missedManipulation: results.filter((entry) => entry.expected === 'manipulation' && entry.outcome !== 'rejected').map((entry) => entry.id),
    providerFailures,
  };
}
