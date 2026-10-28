import { createConnection, type Socket } from 'node:net';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import { siteName } from '../site/business';
import type { Lead } from './validation';
import type { LeadClassification } from './security-types';

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

  const host = getRequiredEnvironment('SMTP_HOST');
  const sockets = new Set<Socket>();
  let closed = false;
  const options: SMTPTransport.Options = {
    host,
    port,
    secure,
    requireTLS: !secure,
    connectionTimeout: 5_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
    auth: {
      user: getRequiredEnvironment('SMTP_USER'),
      pass: getRequiredEnvironment('SMTP_PASS'),
    },
    // Nodemailer's non-pooled close() does not close active connections. Owning
    // the underlying sockets lets the request deadline actually cancel SMTP.
    // Supplied plain sockets still undergo Nodemailer's implicit TLS/STARTTLS.
    getSocket(_options, callback) {
      if (closed) {
        callback(new Error('SMTP transport closed'), false);
        return;
      }
      const socket = createConnection({ host, port });
      sockets.add(socket);
      let settled = false;
      const timer = setTimeout(() => socket.destroy(new Error('SMTP connection timed out')), 5_000);
      const finish = (error: Error | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        callback(error, error ? false : { connection: socket });
      };
      socket.once('error', (error) => finish(error));
      socket.once('close', () => {
        clearTimeout(timer);
        sockets.delete(socket);
        finish(new Error('SMTP connection closed'));
      });
      socket.once('connect', () => {
        if (closed) {
          socket.destroy();
          finish(new Error('SMTP transport closed'));
          return;
        }
        socket.setKeepAlive(true);
        finish(null);
      });
    },
  };
  const mailer = nodemailer.createTransport(options);
  return {
    sendMail: (message) => {
      if (closed) return Promise.reject(new Error('SMTP transport closed'));
      return mailer.sendMail(message);
    },
    close: () => {
      closed = true;
      for (const socket of sockets) socket.destroy();
      mailer.close();
    },
  };
}

export async function deliverLead(
  transport: LeadMailTransport,
  lead: Lead,
  review?: { recipient: string; classification: LeadClassification },
) {
  const result = await transport.sendMail({
    from: getRequiredEnvironment('SMTP_FROM'),
    to: review?.recipient ?? getRequiredEnvironment('LEAD_RECIPIENT'),
    subject: review
      ? `Проверить: заявка с сайта ${siteName}`
      : `Новая заявка с сайта ${siteName}`,
    text: [
      `Имя: ${lead.name}`,
      `Контакт: ${lead.contact}`,
      `Мессенджер: ${lead.messenger}`,
      `Задача: ${lead.botPurpose}`,
      ...(review ? [
        '',
        `Причина проверки: ${review.classification.reason}`,
        `Модель: ${review.classification.model}`,
        `Версия критериев: ${review.classification.rubricVersion}`,
        ...(review.classification.spam === undefined ? [] : [`Оценка спама: ${review.classification.spam}`]),
        ...(review.classification.manipulation === undefined ? [] : [`Оценка манипуляции: ${review.classification.manipulation}`]),
      ] : []),
    ].join('\n'),
  });

  // A resolved SMTP call is not necessarily an accepted recipient.
  if (
    typeof result !== 'object' || result === null ||
    !('accepted' in result) || !Array.isArray(result.accepted) ||
    result.accepted.length === 0 ||
    ('rejected' in result && Array.isArray(result.rejected) && result.rejected.length > 0)
  ) {
    throw new Error('SMTP did not confirm the recipient');
  }
}
