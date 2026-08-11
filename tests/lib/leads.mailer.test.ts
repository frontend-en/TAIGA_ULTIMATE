import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createTransport } = vi.hoisted(() => ({ createTransport: vi.fn() }));

vi.mock('nodemailer', () => ({
  default: { createTransport },
}));

import { createSmtpLeadTransport } from '../../lib/leads/mailer';

const smtpEnvironmentNames = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
] as const;
const originalSmtpEnvironment = Object.fromEntries(
  smtpEnvironmentNames.map((name) => [name, process.env[name]]),
) as Record<(typeof smtpEnvironmentNames)[number], string | undefined>;

describe('createSmtpLeadTransport', () => {
  beforeEach(() => {
    createTransport.mockReset();
    Object.assign(process.env, {
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '465',
      SMTP_SECURE: 'not-a-boolean',
      SMTP_USER: 'mailer',
      SMTP_PASS: 'secret',
    });
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

  it('rejects an invalid SMTP_SECURE configuration rather than downgrading TLS', () => {
    expect(() => createSmtpLeadTransport()).toThrow(
      'SMTP_SECURE must be "true" or "false"',
    );
    expect(createTransport).not.toHaveBeenCalled();
  });

  it.each([
    ['true', true, false],
    ['false', false, true],
  ] as const)(
    'configures encrypted SMTP for SMTP_SECURE=%s',
    (value, secure, requireTLS) => {
      process.env.SMTP_SECURE = value;

      createSmtpLeadTransport();

      expect(createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          secure,
          requireTLS,
          connectionTimeout: 10_000,
          greetingTimeout: 10_000,
          socketTimeout: 20_000,
        }),
      );
    },
  );

  it('fails before creating a transport when an SMTP credential is missing', () => {
    process.env.SMTP_SECURE = 'true';
    delete process.env.SMTP_PASS;

    expect(() => createSmtpLeadTransport()).toThrow(
      'Missing required environment variable: SMTP_PASS',
    );
    expect(createTransport).not.toHaveBeenCalled();
  });
});
