import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, it } from 'vitest';
import { classifyLead, LEAD_RUBRIC_VERSION } from '../../lib/leads/classifier';
import { leadCorpus } from '../fixtures/lead-corpus';
import { curatedLeadCases, holdoutLeadCases } from '../fixtures/lead-evaluation-corpus';
import { testSecurityConfig } from '../fixtures/lead-security-config';
import { evaluateLeadCases, selectLeadEvaluationCases, summarizeLeadEvaluation } from '../helpers/lead-evaluation';

it.skipIf(process.env.RUN_LEAD_JEV_EVALUATION !== '1')('evaluates an explicitly selected corpus against live Jev (paid calls; no retries)', { retry: 0, timeout: 15 * 60_000 }, async () => {
  // Load local credentials only inside this explicit opt-in; normal tests never load them.
  const { loadEnvConfig } = await import('@next/env');
  loadEnvConfig(process.cwd());
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) throw new Error('Set TYPESAFE_API_KEY before explicitly running live Jev evaluation.');
  const model = process.env.LEAD_AI_MODEL ?? 'jev-1.14.0';
  if (!/^jev-\d+\.\d+\.\d+$/.test(model)) throw new Error('Use a fixed Jev model version for evaluation.');
  const suite = process.env.LEAD_JEV_SUITE ?? 'curated';
  if (!['curated', 'holdout', 'legacy'].includes(suite)) throw new Error('Select curated, holdout or legacy evaluation suite.');
  const sourceCases = suite === 'curated' ? curatedLeadCases : suite === 'holdout' ? holdoutLeadCases : leadCorpus;
  const cases = selectLeadEvaluationCases(sourceCases, process.env.LEAD_JEV_CASE_IDS);
  const rawBudget = process.env.LEAD_JEV_MAX_CALLS;
  if (!rawBudget || !/^[1-9]\d*$/.test(rawBudget)) throw new Error('Set LEAD_JEV_MAX_CALLS to an explicit positive call budget.');
  const maxCalls = Number(rawBudget);
  const phase = process.env.LEAD_JEV_PHASE ?? 'evaluation';
  if (!/^[a-z0-9-]{1,40}$/.test(phase)) throw new Error('Use a short lowercase evaluation phase name.');
  const config = testSecurityConfig({ apiKey, model });
  const results = await evaluateLeadCases(cases, config, classifyLead, { concurrency: 2, maxCalls });
  const summary = summarizeLeadEvaluation(results);
  const report = {
    createdAt: new Date().toISOString(), suite, phase, model, rubricVersion: LEAD_RUBRIC_VERSION,
    source: suite === 'legacy' ? 'Synthetic variants from related semantic families; not independent samples.' : 'Independent curated smoke scenarios, not a population accuracy estimate. Holdout is reserved until tuning is frozen.',
    concurrency: 2, attemptedCalls: results.length, retries: 0, ...summary, results,
  };
  const directory = path.join(process.cwd(), 'artifacts', 'lead-evaluation');
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, `jev-${suite}-${phase}-${LEAD_RUBRIC_VERSION}-${Date.now()}.json`);
  await writeFile(file, JSON.stringify(report, null, 2));
  console.info(`Jev evaluation report: ${file}`);
  console.info(JSON.stringify({ suite, phase, ...summary }));
  expect(summary.providerFailures, 'Provider errors are inconclusive, never successful protection.').toEqual([]);
  expect(summary.falseRejections, 'Known legitimate messages must never be automatically rejected.').toEqual([]);
  // False negatives/review counts are reported for human assessment, not hidden
  // behind a synthetic claim about population accuracy or injection immunity.
});
