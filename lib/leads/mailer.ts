import nodemailer from 'nodemailer';

import type { Lead } from './validation';

export interface LeadMailTransport {
  sendMail(message: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
  close?(): void;
}

function getRequiredEnvironment(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseSmtpSecure(value: string) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error('SMTP_SECURE must be "true" or "false"');
}

export function createSmtpLeadTransport(): LeadMailTransport {
  const port = Number(getRequiredEnvironment('SMTP_PORT'));

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid port number');
  }

  const secure = parseSmtpSecure(getRequiredEnvironment('SMTP_SECURE'));

  return nodemailer.createTransport({
    host: getRequiredEnvironment('SMTP_HOST'),
    port,
    secure,
    requireTLS: !secure,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    auth: {
      user: getRequiredEnvironment('SMTP_USER'),
      pass: getRequiredEnvironment('SMTP_PASS'),
    },
  });
}

export async function deliverLead(
  transport: LeadMailTransport,
  lead: Lead,
) {
  await transport.sendMail({
    from: getRequiredEnvironment('SMTP_FROM'),
    to: getRequiredEnvironment('LEAD_RECIPIENT'),
    subject: 'Новая заявка с сайта TAIGA',
    text: [
      `Имя: ${lead.name}`,
      `Контакт: ${lead.contact}`,
      `Мессенджер: ${lead.messenger}`,
      `Задача: ${lead.botPurpose}`,
    ].join('\n'),
  });
}
