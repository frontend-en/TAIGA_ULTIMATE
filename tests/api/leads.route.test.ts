import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLeadPostHandler } from '../../lib/leads/handler';

const validLead = {
  name: 'Анна',
  contact: '@anna',
  messenger: 'max',
  botPurpose: 'Автоматизировать ответы клиентам в мессенджере.',
  consent: true,
};

const smtpEnvironmentNames = ['SMTP_FROM', 'LEAD_RECIPIENT'] as const;
const originalSmtpEnvironment = Object.fromEntries(
  smtpEnvironmentNames.map((name) => [name, process.env[name]]),
) as Record<(typeof smtpEnvironmentNames)[number], string | undefined>;

function leadRequest(
  body: unknown,
  ip = '203.0.113.10',
  headers: Record<string, string> = {},
) {
  return new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-real-ip': ip,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function streamingLeadRequest(body: string, ip = '203.0.113.10') {
  const encoded = new TextEncoder().encode(body);

  return new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-real-ip': ip,
    },
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(encoded.subarray(0, 8 * 1024));
        controller.enqueue(encoded.subarray(8 * 1024));
        controller.close();
      },
    }),
    duplex: 'half',
  } as RequestInit);
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    process.env.SMTP_FROM = 'site@example.com';
    process.env.LEAD_RECIPIENT = 'sales@example.com';
  });

  afterEach(() => {
    for (const name of smtpEnvironmentNames) {
      const value = originalSmtpEnvironment[name];

      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  });

  it('delivers a valid lead and returns only the success contract', async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const post = createLeadPostHandler({
      createTransport: () => ({ sendMail }),
      rateLimit: { maxRequests: 5, windowMs: 60_000 },
    });

    const response = await post(leadRequest(validLead));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'site@example.com',
        to: 'sales@example.com',
        text: expect.stringContaining(validLead.botPurpose),
      }),
    );
  });

  it.each(['vk', 'other'] as const)('accepts the supported %s messenger value', async (messenger) => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const post = createLeadPostHandler({ createTransport: () => ({ sendMail }) });

    const response = await post(leadRequest({ ...validLead, messenger }));

    expect(response.status).toBe(200);
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it.each([
    ['a too-short name', { ...validLead, name: 'А' }],
    ['a too-long name', { ...validLead, name: 'А'.repeat(81) }],
    ['a too-short contact', { ...validLead, contact: 'ab' }],
    ['a too-long contact', { ...validLead, contact: 'a'.repeat(121) }],
    ['an unsupported named messenger', { ...validLead, messenger: 'unsupported-platform' }],
    ['a too-short purpose', { ...validLead, botPurpose: 'a'.repeat(9) }],
    ['a too-long purpose', { ...validLead, botPurpose: 'a'.repeat(1001) }],
    ['a whitespace-only name', { ...validLead, name: '  ' }],
    ['a whitespace-only contact', { ...validLead, contact: '   ' }],
    ['a whitespace-only purpose', { ...validLead, botPurpose: ' '.repeat(10) }],
    ['missing explicit consent', { ...validLead, consent: undefined }],
    ['non-true consent', { ...validLead, consent: false }],
  ])('rejects %s with a sanitized validation response', async (_caseName, body) => {
    const sendMail = vi.fn();
    const post = createLeadPostHandler({ createTransport: () => ({ sendMail }) });

    const response = await post(leadRequest(body));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: 'VALIDATION_ERROR',
    });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('quietly accepts a honeypot submission without delivering mail', async () => {
    const sendMail = vi.fn();
    const post = createLeadPostHandler({ createTransport: () => ({ sendMail }) });

    const response = await post(
      leadRequest({ ...validLead, website: 'leave this field filled' }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('rejects non-JSON requests before parsing or delivering them', async () => {
    const sendMail = vi.fn();
    const post = createLeadPostHandler({ createTransport: () => ({ sendMail }) });

    const response = await post(
      leadRequest(validLead, '203.0.113.10', {
        'content-type': 'text/plain',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: 'VALIDATION_ERROR',
    });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('rejects an explicit cross-origin browser request', async () => {
    const sendMail = vi.fn();
    const post = createLeadPostHandler({ createTransport: () => ({ sendMail }) });

    const response = await post(
      leadRequest(validLead, '203.0.113.10', {
        origin: 'https://attacker.example',
      }),
    );

    expect(response.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('accepts a same-origin browser request', async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const post = createLeadPostHandler({ createTransport: () => ({ sendMail }) });

    const response = await post(
      leadRequest(validLead, '203.0.113.10', {
        origin: 'http://localhost',
      }),
    );

    expect(response.status).toBe(200);
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('uses the configured site origin instead of a spoofable Host in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const post = createLeadPostHandler({ createTransport: () => ({ sendMail }) });

    try {
      const spoofedHostResponse = await post(
        leadRequest(validLead, '203.0.113.10', {
          origin: 'http://localhost',
        }),
      );
      const siteResponse = await post(
        leadRequest(validLead, '203.0.113.10', {
          origin: 'https://sigmabots.ru',
        }),
      );

      expect(spoofedHostResponse.status).toBe(400);
      expect(siteResponse.status).toBe(200);
      expect(sendMail).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('rejects a streaming body over 16 KiB with a sanitized response without delivering mail', async () => {
    const sendMail = vi.fn();
    const post = createLeadPostHandler({ createTransport: () => ({ sendMail }) });

    const response = await post(streamingLeadRequest(JSON.stringify({ ...validLead, botPurpose: 'a'.repeat(17 * 1024) })));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: 'VALIDATION_ERROR',
    });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('cancels a request body that exceeds the read deadline', async () => {
    const sendMail = vi.fn();
    const post = createLeadPostHandler({
      createTransport: () => ({ sendMail }),
      requestBodyTimeoutMs: 5,
    });
    const request = new Request('http://localhost/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: new ReadableStream(),
      duplex: 'half',
    } as RequestInit);

    const response = await post(request);

    expect(response.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('rejects an IP that exceeds the request limit with Retry-After', async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const post = createLeadPostHandler({
      createTransport: () => ({ sendMail }),
      rateLimit: { maxRequests: 1, windowMs: 60_000 },
      trustProxy: true,
    });

    await post(leadRequest(validLead, '198.51.100.24'));
    const response = await post(leadRequest(validLead, '198.51.100.24'));

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: 'RATE_LIMITED',
    });
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('bounds tracked IPs so spoofed addresses cannot grow limiter state forever', async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const post = createLeadPostHandler({
      createTransport: () => ({ sendMail }),
      rateLimit: { maxRequests: 1, windowMs: 60_000, maxTrackedIps: 1 },
      trustProxy: true,
    });

    await post(leadRequest(validLead, '198.51.100.1'));
    await post(leadRequest(validLead, '198.51.100.2'));
    const response = await post(leadRequest(validLead, '198.51.100.1'));

    expect(response.status).toBe(200);
    expect(sendMail).toHaveBeenCalledTimes(3);
  });

  it('ignores spoofable forwarding headers unless the proxy is explicitly trusted', async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const post = createLeadPostHandler({
      createTransport: () => ({ sendMail }),
      rateLimit: { maxRequests: 1, windowMs: 60_000 },
      trustProxy: false,
    });

    await post(leadRequest(validLead, '198.51.100.1'));
    const response = await post(leadRequest(validLead, '198.51.100.2'));

    expect(response.status).toBe(429);
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('never trusts a client-controlled X-Forwarded-For chain', async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const post = createLeadPostHandler({
      createTransport: () => ({ sendMail }),
      rateLimit: { maxRequests: 1, windowMs: 60_000 },
      trustProxy: true,
    });

    await post(
      leadRequest(validLead, '198.51.100.1', {
        'x-real-ip': '',
        'x-forwarded-for': '198.51.100.1',
      }),
    );
    const response = await post(
      leadRequest(validLead, '198.51.100.2', {
        'x-real-ip': '',
        'x-forwarded-for': '198.51.100.2',
      }),
    );

    expect(response.status).toBe(429);
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('returns a sanitized delivery error when SMTP fails', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('SMTP password rejected'));
    const post = createLeadPostHandler({ createTransport: () => ({ sendMail }) });

    const response = await post(leadRequest(validLead));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: 'DELIVERY_ERROR',
    });
  });

  it('returns a sanitized delivery error when SMTP exceeds the request deadline', async () => {
    const sendMail = vi.fn().mockReturnValue(new Promise(() => undefined));
    const close = vi.fn();
    const post = createLeadPostHandler({
      createTransport: () => ({ sendMail, close }),
      deliveryTimeoutMs: 5,
    });

    const response = await post(leadRequest(validLead));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: 'DELIVERY_ERROR',
    });
    expect(close).toHaveBeenCalledOnce();
  });
});
