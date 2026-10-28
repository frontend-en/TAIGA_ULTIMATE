import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLeadPostHandler, type LeadPostHandlerDependencies } from '../../lib/leads/handler';
import { createLeadRequestAdmission } from '../../lib/leads/admission';
import type { LeadClassification, LeadSecurityStore } from '../../lib/leads/security-types';
import { createLeadSecurityState, createLeadSecurityStore } from '../../lib/leads/security-store';
import { testSecurityConfig } from '../fixtures/lead-security-config';

const validLead = {
  name: 'Анна', contact: '@anna', messenger: 'Мой мессенджер',
  botPurpose: 'Автоматизировать ответы клиентам в мессенджере.',
  consent: true,
};
const normal: LeadClassification = {
  route: 'normal', reason: 'AI_NORMAL', model: 'jev-1.14.0', rubricVersion: 'leads-v2', spam: 0.01, manipulation: 0.01,
};
const invalidHeaders: Record<string, string>[] = [
  { 'content-type': 'text/plain' }, { origin: 'https://attacker.example' }, { origin: 'bad-origin' },
  { 'content-type': 'application/jsonevil' }, { 'sec-fetch-site': 'cross-site' },
];
function setup(overrides: LeadPostHandlerDependencies = {}) {
  const settings = testSecurityConfig();
  const store = {
    checkRateLimit: vi.fn<LeadSecurityStore['checkRateLimit']>().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 }),
    acquireSubmission: vi.fn<LeadSecurityStore['acquireSubmission']>().mockResolvedValue({ status: 'acquired' }),
    completeSubmission: vi.fn<LeadSecurityStore['completeSubmission']>().mockResolvedValue(true),
    releaseSubmission: vi.fn<LeadSecurityStore['releaseSubmission']>().mockResolvedValue(undefined),
    reserveAiAttempt: vi.fn<LeadSecurityStore['reserveAiAttempt']>().mockResolvedValue({ allowed: true, used: 1, limit: 500 }),
  };
  const sendMail = vi.fn().mockResolvedValue({ accepted: ['sales@example.com'], rejected: [] });
  const close = vi.fn();
  const classify = vi.fn().mockResolvedValue(normal);
  const logger = vi.fn();
  const dependencies: LeadPostHandlerDependencies = {
    admitRequest: createLeadRequestAdmission(),
    createTransport: () => ({ sendMail, close }), getConfig: () => settings, createStore: () => store,
    classify, logger, ...overrides,
  };
  return { post: createLeadPostHandler(dependencies), dependencies, settings, store, sendMail, close, classify, logger };
}
function leadRequest(body: unknown = validLead, ip = '203.0.113.10', headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/leads', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': ip, ...headers }, body: JSON.stringify(body),
  });
}
function streamRequest(stream: ReadableStream<Uint8Array>) {
  return new Request('http://localhost/api/leads', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': '203.0.113.10' }, body: stream, duplex: 'half',
  } as RequestInit);
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    vi.stubEnv('SMTP_FROM', 'site@example.com');
    vi.stubEnv('LEAD_RECIPIENT', 'sales@example.com');
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

  it('delivers a valid lead and exposes only the success contract', async () => {
    const { post, sendMail, store } = setup();
    const result = await post(leadRequest());
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toEqual({ ok: true });
    expect(sendMail).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      from: 'site@example.com', to: 'sales@example.com', text: expect.stringContaining(validLead.botPurpose),
    }));
    expect(store.completeSubmission).toHaveBeenCalledOnce();
  });
  it.each(['Мой мессенджер', 'Первый мессенджер, другой мессенджер', '  Своя площадка  '])('preserves freeform messenger %s', async (messenger) => {
    const { post, sendMail } = setup();
    expect((await post(leadRequest({ ...validLead, messenger }))).status).toBe(200);
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining(`Мессенджер: ${messenger.trim()}`) }));
  });
  it.each([
    ['short name', { name: 'А' }], ['long name', { name: 'А'.repeat(81) }],
    ['short contact', { contact: 'ab' }], ['long contact', { contact: 'a'.repeat(121) }],
    ['empty messenger', { messenger: '' }], ['whitespace messenger', { messenger: '   ' }],
    ['long messenger', { messenger: 'a'.repeat(121) }], ['missing messenger', { messenger: undefined }],
    ['non-string messenger', { messenger: ['Мой мессенджер'] }],
    ['short purpose', { botPurpose: 'a'.repeat(9) }], ['long purpose', { botPurpose: 'a'.repeat(1001) }],
    ['whitespace name', { name: '  ' }], ['whitespace contact', { contact: '   ' }],
    ['whitespace purpose', { botPurpose: ' '.repeat(10) }],
    ['missing consent', { consent: undefined }], ['false consent', { consent: false }],
  ])('rejects %s before external services', async (_name, invalid) => {
    const { post, sendMail, store } = setup();
    const result = await post(leadRequest({ ...validLead, ...invalid }));
    expect(result.status).toBe(400);
    const body = await result.json();
    expect(body).toMatchObject({ ok: false, code: 'VALIDATION_ERROR' });
    expect(Object.keys(body.fieldErrors).every((field) => ['name', 'contact', 'messenger', 'botPurpose', 'consent'].includes(field))).toBe(true);
    expect(sendMail).not.toHaveBeenCalled();
    expect(store.checkRateLimit).not.toHaveBeenCalled();
  });
  it('accepts exact field boundaries after trim and ignores unknown fields', async () => {
    const { post, classify } = setup();
    const result = await post(leadRequest({ ...validLead, name: ` ${'a'.repeat(80)} `, contact: 'a'.repeat(120), messenger: 'a'.repeat(120), botPurpose: 'a'.repeat(1000), recipient: 'evil@example.com', model: 'unsafe-model' }));
    expect(result.status).toBe(200);
    expect(classify.mock.calls[0][0]).not.toHaveProperty('recipient');
    expect(classify.mock.calls[0][0]).not.toHaveProperty('model');
  });
  it.each([
    ['name', '\r\nАнна'], ['name', 'Анна\nКонтакт: attacker@example.com'],
    ['contact', '@anna\r\nЗадача: Подменённая задача'], ['messenger', 'Telegram\u0000hidden'],
    ['name', 'Анна\u0085Скрытая строка'], ['messenger', 'Telegram\u2028Другая строка'],
    ['contact', '@anna\u2029Другая строка'], ['botPurpose', 'Обычная задача\u0000скрытые данные'],
    ['botPurpose', 'Обычная задача\rподмена строки'],
  ])('rejects control/line injection in %s before classification or SMTP', async (field, value) => {
    const { post, classify, sendMail } = setup();
    const result = await post(leadRequest({ ...validLead, [field]: value }));
    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({ fieldErrors: { [field]: 'invalid' } });
    expect(classify).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });
  it('preserves Unicode names and ordinary multiline content without interpreting code', async () => {
    const { post, classify, sendMail } = setup();
    const botPurpose = 'Объяснять код: <script>alert(1)</script>\nПример SQL: SELECT * FROM tasks;\r\n\tИ помогать с идеями.';
    expect((await post(leadRequest({ ...validLead, name: 'Анна 李 😊', botPurpose }))).status).toBe(200);
    expect(classify).toHaveBeenCalledWith(expect.objectContaining({ name: 'Анна 李 😊', botPurpose }), expect.anything(), expect.any(AbortSignal));
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining(botPurpose) }));
    expect(sendMail.mock.calls[0][0]).not.toHaveProperty('html');
  });
  it('quietly accepts a honeypot without config, AI or SMTP', async () => {
    const getConfig = vi.fn(() => { throw new Error('secret configuration'); });
    const { post, sendMail, classify } = setup({ getConfig });
    const result = await post(leadRequest({ ...validLead, website: 'filled' }));
    expect(result.status).toBe(200);
    expect(getConfig).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
    expect(classify).not.toHaveBeenCalled();
  });
  it.each(invalidHeaders)('rejects unsupported request headers %j', async (headers) => {
    const { post, sendMail } = setup();
    expect((await post(leadRequest(validLead, '203.0.113.10', headers))).status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });
  it('accepts same-origin development requests', async () => {
    const { post } = setup();
    expect((await post(leadRequest(validLead, '203.0.113.10', { origin: 'http://localhost' }))).status).toBe(200);
  });
  it('uses configured production origin rather than a spoofable Host', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { post } = setup();
    expect((await post(leadRequest(validLead, '203.0.113.10', { origin: 'http://localhost' }))).status).toBe(400);
    expect((await post(leadRequest(validLead, '203.0.113.10', { origin: 'https://sigmabots.ru' }))).status).toBe(200);
  });
  it('rejects malformed JSON', async () => {
    const { post } = setup();
    const request = new Request('http://localhost/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
    expect((await post(request)).status).toBe(400);
  });
  it('rejects oversized streamed bodies without relying on Content-Length', async () => {
    const { post, sendMail } = setup();
    const bytes = new TextEncoder().encode(JSON.stringify({ ...validLead, botPurpose: 'a'.repeat(17 * 1024) }));
    const request = streamRequest(new ReadableStream({ start(c) { c.enqueue(bytes.subarray(0, 8192)); c.enqueue(bytes.subarray(8192)); c.close(); } }));
    expect((await post(request)).status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });
  it('rejects an oversized declared body', async () => {
    const { post } = setup();
    expect((await post(leadRequest(validLead, '203.0.113.10', { 'content-length': '17000' }))).status).toBe(400);
  });
  it('cancels stalled bodies at the read deadline', async () => {
    const { post, sendMail } = setup({ requestBodyTimeoutMs: 5 });
    expect((await post(streamRequest(new ReadableStream()))).status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });
  it('does not accept valid JSON buffered before a body timeout without EOF', async () => {
    const { post } = setup({ requestBodyTimeoutMs: 5 });
    const request = streamRequest(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(JSON.stringify(validLead))); } }));
    expect((await post(request)).status).toBe(400);
  });
  it('counts malformed and honeypot attempts before configuration or external services', async () => {
    const { post, classify, sendMail } = setup({ admitRequest: createLeadRequestAdmission({ maxPerMinute: 2 }) });
    const malformed = new Request('http://localhost/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
    expect((await post(malformed)).status).toBe(400);
    expect((await post(leadRequest({ website: 'bot' }))).status).toBe(200);
    const limited = await post(leadRequest());
    expect(limited.status).toBe(429);
    expect(limited.headers.get('Retry-After')).toMatch(/^[1-9]\d*$/);
    expect(classify).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });
  it('bounds stalled body reads across handler instances and reuses released slots', async () => {
    const { post, dependencies, classify, sendMail } = setup({ admitRequest: createLeadRequestAdmission({ maxInFlight: 1 }) });
    const secondHandler = createLeadPostHandler(dependencies);
    let bodyController!: ReadableStreamDefaultController<Uint8Array>;
    const pending = post(streamRequest(new ReadableStream({ start(controller) { bodyController = controller; } })));
    const pull = vi.fn();
    const cancel = vi.fn();
    const blocked = await secondHandler(streamRequest(new ReadableStream({ pull, cancel }, { highWaterMark: 0 })));
    expect(blocked.status).toBe(429);
    expect(pull).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledOnce();
    expect(classify).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
    bodyController.close();
    expect((await pending).status).toBe(400);
    expect((await secondHandler(leadRequest())).status).toBe(200);
  });
  it.each(['body', 'request'])('releases admission after a %s deadline', async (deadline) => {
    const { post, sendMail } = setup({
      admitRequest: createLeadRequestAdmission({ maxInFlight: 1 }),
      requestBodyTimeoutMs: deadline === 'body' ? 5 : 1000,
      requestTimeoutMs: deadline === 'request' ? 5 : 1000,
    });
    expect((await post(streamRequest(new ReadableStream()))).status).toBe(deadline === 'body' ? 400 : 503);
    expect(sendMail).not.toHaveBeenCalled();
    expect((await post(leadRequest())).status).toBe(200);
  });
  it('releases admission after a configuration failure', async () => {
    const getConfig = vi.fn().mockImplementationOnce(() => { throw new Error('unavailable'); }).mockImplementation(() => testSecurityConfig());
    const { post } = setup({ admitRequest: createLeadRequestAdmission({ maxInFlight: 1 }), getConfig });
    expect((await post(leadRequest())).status).toBe(503);
    expect((await post(leadRequest())).status).toBe(200);
  });
  it('fails safely for missing configuration', async () => {
    const { post, classify, sendMail, logger } = setup({ getConfig: () => { throw new Error('TYPESAFE_API_KEY secret'); } });
    const result = await post(leadRequest());
    expect(result.status).toBe(503);
    expect(await result.text()).not.toContain('secret');
    expect(classify).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
    expect(JSON.stringify(logger.mock.calls)).not.toContain('TYPESAFE_API_KEY');
  });
  it.each(['', 'not-an-ip', '198.51.100.1, 198.51.100.2'])('uses only global limits for missing or ambiguous IP %s', async (ip) => {
    const { post, settings, store, logger } = setup();
    settings.trustProxy = true;
    expect((await post(leadRequest(validLead, ip, { 'x-forwarded-for': '198.51.100.1' }))).status).toBe(200);
    expect(store.checkRateLimit).toHaveBeenCalledWith(undefined, expect.any(Number), expect.any(AbortSignal));
    expect(logger).toHaveBeenCalledWith(expect.objectContaining({ limitScope: 'global' }));
  });
  it('does not use forwarding headers when proxy trust is disabled', async () => {
    const { post, settings, store } = setup();
    settings.trustProxy = false;
    expect((await post(leadRequest())).status).toBe(200);
    expect(store.checkRateLimit).toHaveBeenCalledWith(undefined, expect.any(Number), expect.any(AbortSignal));
  });
  it('stores only an HMAC of trusted IP and preserves limiter Retry-After', async () => {
    const { post, settings, store, classify, sendMail } = setup();
    settings.trustProxy = true;
    store.checkRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 37 });
    const result = await post(leadRequest());
    expect(result.status).toBe(429);
    expect(result.headers.get('Retry-After')).toBe('37');
    expect(store.checkRateLimit.mock.calls[0][0]).toMatch(/^[a-f0-9]{64}$/);
    expect(store.checkRateLimit.mock.calls[0][0]).not.toContain('203.0.113.10');
    expect(classify).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });
  it('stops downstream services if local protection state cannot be checked', async () => {
    const { post, store, classify, sendMail } = setup();
    store.checkRateLimit.mockRejectedValue(new Error('internal state failure'));
    const result = await post(leadRequest());
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ ok: false, code: 'SERVICE_UNAVAILABLE' });
    expect(classify).not.toHaveBeenCalled(); expect(sendMail).not.toHaveBeenCalled();
  });
  it('returns completed duplicate success without AI or mail', async () => {
    const { post, store, classify, sendMail } = setup();
    store.acquireSubmission.mockResolvedValue({ status: 'complete' });
    expect((await post(leadRequest())).status).toBe(200);
    expect(classify).not.toHaveBeenCalled(); expect(sendMail).not.toHaveBeenCalled();
  });
  it('returns pending duplicate with Retry-After', async () => {
    const { post, store, sendMail } = setup();
    store.acquireSubmission.mockResolvedValue({ status: 'pending', retryAfterSeconds: 119 });
    const result = await post(leadRequest());
    expect(result.status).toBe(409);
    expect(result.headers.get('Retry-After')).toBe('119');
    expect(sendMail).not.toHaveBeenCalled(); expect(store.releaseSubmission).not.toHaveBeenCalled();
  });
  it('fingerprints normalized business fields without original data', async () => {
    const { post, store } = setup();
    await post(leadRequest());
    await post(leadRequest({ ...validLead, name: ' Анна ', website: '' }));
    expect(store.acquireSubmission.mock.calls[0][0]).toMatch(/^[a-f0-9]{64}$/);
    expect(store.acquireSubmission.mock.calls[0][0]).toBe(store.acquireSubmission.mock.calls[1][0]);
    expect(store.acquireSubmission.mock.calls[0][1]).not.toBe(store.acquireSubmission.mock.calls[1][1]);
  });
  it.each(['SPAM_HIGH', 'AI_MANIPULATION'])('sends %s to review during observation', async (reason) => {
    const { post, classify, sendMail } = setup();
    classify.mockResolvedValue({ ...normal, route: 'spam', reason, spam: reason === 'SPAM_HIGH' ? 0.999 : 0.01, manipulation: reason === 'AI_MANIPULATION' ? 0.999 : 0.01 });
    expect((await post(leadRequest())).status).toBe(200);
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'review@example.com', subject: expect.stringContaining('Проверить'), text: expect.stringContaining(reason) }));
  });
  it.each(['SPAM_HIGH', 'AI_MANIPULATION'])('rejects confident %s in enforce and releases its owned claim', async (reason) => {
    const { post, settings, classify, sendMail, store } = setup();
    settings.mode = 'enforce';
    classify.mockResolvedValue({ ...normal, route: 'spam', reason, spam: reason === 'SPAM_HIGH' ? 0.999 : 0.01, manipulation: reason === 'AI_MANIPULATION' ? 0.999 : 0.01 });
    const result = await post(leadRequest());
    expect(result.status).toBe(422);
    expect(await result.json()).toEqual({ ok: false, code: 'SUBMISSION_REJECTED' });
    expect(sendMail).not.toHaveBeenCalled();
    expect(store.completeSubmission).not.toHaveBeenCalled();
    expect(store.releaseSubmission).toHaveBeenCalledWith(...store.acquireSubmission.mock.calls[0]);
  });
  it.each(['uncertain', 'timeout', 'quota'])('routes %s AI results to the fixed review address', async (kind) => {
    const { post, classify, store, sendMail } = setup();
    if (kind === 'uncertain') classify.mockResolvedValue({ ...normal, route: 'review', reason: 'AI_UNCERTAIN', spam: 0.5 });
    if (kind === 'timeout') classify.mockRejectedValue(new Error('secret provider response'));
    if (kind === 'quota') store.reserveAiAttempt.mockResolvedValue({ allowed: false, used: 500, limit: 500 });
    const result = await post(leadRequest());
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ ok: true });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'review@example.com' }));
    if (kind === 'quota') expect(classify).not.toHaveBeenCalled();
  });
  it('does not fail accepted SMTP delivery if local completion fails', async () => {
    const { post, store, logger } = setup();
    store.completeSubmission.mockRejectedValue(new Error('internal state failure'));
    expect((await post(leadRequest())).status).toBe(200);
    expect(store.releaseSubmission).not.toHaveBeenCalled();
    expect(JSON.stringify(logger.mock.calls)).toContain('STATE_UNAVAILABLE_AFTER_SMTP');
    expect(JSON.stringify(logger.mock.calls)).not.toContain('internal state failure');
  });
  it('logs lost completion ownership without turning SMTP success into failure', async () => {
    const { post, store, logger } = setup();
    store.completeSubmission.mockResolvedValue(false);
    expect((await post(leadRequest())).status).toBe(200);
    expect(JSON.stringify(logger.mock.calls)).toContain('LOCK_OWNERSHIP_LOST');
  });
  it('sanitizes SMTP errors and releases the claim', async () => {
    const { post, sendMail, store, logger } = setup();
    sendMail.mockRejectedValue(new Error('SMTP password rejected'));
    const result = await post(leadRequest());
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ ok: false, code: 'SERVICE_UNAVAILABLE' });
    expect(store.releaseSubmission).toHaveBeenCalledOnce();
    expect(JSON.stringify(logger.mock.calls)).not.toContain('password');
  });
  it('requires confirmed SMTP recipient acceptance', async () => {
    const { post, sendMail } = setup();
    sendMail.mockResolvedValue({ accepted: [], rejected: ['sales@example.com'] });
    expect((await post(leadRequest())).status).toBe(503);
  });
  it('closes SMTP on timeout and reports its outcome as unconfirmed', async () => {
    const { post, sendMail, close, store } = setup({ deliveryTimeoutMs: 5 });
    sendMail.mockReturnValue(new Promise(() => undefined));
    const result = await post(leadRequest());
    expect(result.status).toBe(503);
    expect(close).toHaveBeenCalledOnce();
    expect(store.completeSubmission).not.toHaveBeenCalled();
  });
  it('aborts the overall deadline and never starts SMTP after a late classifier resolves', async () => {
    let finish: ((value: LeadClassification) => void) | undefined;
    const { post, classify, sendMail } = setup({ requestTimeoutMs: 5 });
    classify.mockReturnValue(new Promise<LeadClassification>((resolve) => { finish = resolve; }));
    expect((await post(leadRequest())).status).toBe(503);
    finish?.(normal);
    await new Promise((resolve) => setTimeout(resolve, 1));
    expect(sendMail).not.toHaveBeenCalled();
  });
  it('returns success if deadline expires after SMTP acceptance while completion hangs', async () => {
    const { post, store } = setup({ requestTimeoutMs: 5 });
    store.completeSubmission.mockReturnValue(new Promise(() => undefined));
    expect((await post(leadRequest())).status).toBe(200);
    expect(store.releaseSubmission).not.toHaveBeenCalled();
  });
  it('logs only structured operational metadata', async () => {
    const { post, logger } = setup();
    await post(leadRequest());
    const serialized = JSON.stringify(logger.mock.calls);
    for (const sensitive of [validLead.name, validLead.contact, validLead.botPurpose, '203.0.113.10', 'test-key']) {
      expect(serialized).not.toContain(sensitive);
    }
    expect(logger).toHaveBeenCalledWith(expect.objectContaining({ event: 'lead_submission', status: 200, model: 'jev-1.14.0', rubricVersion: 'leads-v2', aiAttempts: 1 }));
  });
  it('accepts a normal request without proxy headers or other service credentials', async () => {
    const { post, store, sendMail } = setup();
    const request = new Request('http://localhost/api/leads', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validLead),
    });
    expect((await post(request)).status).toBe(200);
    expect(store.checkRateLimit).toHaveBeenCalledWith(undefined, expect.any(Number), expect.any(AbortSignal));
    expect(sendMail).toHaveBeenCalledOnce();
  });
  it('applies the global 60/minute limit rather than the IP 5/minute limit without a trusted IP', async () => {
    const state = createLeadSecurityState();
    const { post, sendMail } = setup({ createStore: (settings) => createLeadSecurityStore(settings, { state }) });
    for (let index = 0; index < 60; index++) {
      expect((await post(leadRequest({ ...validLead, name: `Анна ${index}` }, ''))).status).toBe(200);
    }
    expect((await post(leadRequest({ ...validLead, name: 'Следующий клиент' }, ''))).status).toBe(429);
    expect(sendMail).toHaveBeenCalledTimes(60);
  });
  it('shares default local limits across handler instances without inventing an IP bucket', async () => {
    const { post, dependencies, settings, sendMail } = setup({ createStore: createLeadSecurityStore });
    settings.limits.globalMinute = 1;
    settings.limits.ipMinute = 5;
    const secondHandler = createLeadPostHandler(dependencies);
    expect((await post(leadRequest(validLead, ''))).status).toBe(200);
    expect((await secondHandler(leadRequest({ ...validLead, name: 'Виктория' }, ''))).status).toBe(429);
    expect(sendMail).toHaveBeenCalledOnce();
  });
});
