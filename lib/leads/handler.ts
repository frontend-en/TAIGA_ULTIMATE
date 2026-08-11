import { NextResponse } from 'next/server';

import {
  createSmtpLeadTransport,
  deliverLead,
  type LeadMailTransport,
} from './mailer';
import { isHoneypotSubmission, parseLead } from './validation';
import { siteOrigin } from '../site/business';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  maxTrackedIps?: number;
}

interface LeadPostHandlerDependencies {
  createTransport?: () => LeadMailTransport;
  rateLimit?: RateLimitConfig;
  now?: () => number;
  trustProxy?: boolean;
  deliveryTimeoutMs?: number;
  requestBodyTimeoutMs?: number;
}

const defaultRateLimit: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60_000,
  maxTrackedIps: 10_000,
};

const maxRequestBodyBytes = 16 * 1024;
const defaultDeliveryTimeoutMs = 20_000;
const defaultRequestBodyTimeoutMs = 5_000;

function getClientIp(request: Request, trustProxy: boolean) {
  if (!trustProxy) {
    return 'unknown';
  }

  return request.headers.get('x-real-ip')?.trim().slice(0, 128) || 'unknown';
}

function validationErrorResponse() {
  return NextResponse.json(
    { ok: false, code: 'VALIDATION_ERROR' },
    { status: 400 },
  );
}

function acceptsRequest(request: Request) {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase();

  if (contentType !== 'application/json') {
    return false;
  }

  const origin = request.headers.get('origin');

  if (!origin) {
    return true;
  }

  try {
    const requestOrigin = new URL(request.url).origin;
    const submittedOrigin = new URL(origin).origin;

    return (
      submittedOrigin === siteOrigin ||
      (process.env.NODE_ENV !== 'production' && submittedOrigin === requestOrigin)
    );
  } catch {
    return false;
  }
}

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { ok: false, code: 'RATE_LIMITED' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    },
  );
}

async function readJsonBody(
  request: Request,
  timeoutMs: number,
): Promise<unknown | undefined> {
  const contentLength = Number(request.headers.get('content-length'));

  if (Number.isFinite(contentLength) && contentLength > maxRequestBodyBytes) {
    return undefined;
  }

  if (!request.body) {
    return undefined;
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  const timeout = setTimeout(() => {
    void reader.cancel().catch(() => undefined);
  }, timeoutMs);

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > maxRequestBodyBytes) {
        await reader.cancel();
        return undefined;
      }

      chunks.push(value);
    }

    const body = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

async function deliverWithTimeout(
  transport: LeadMailTransport,
  lead: Parameters<typeof deliverLead>[1],
  timeoutMs: number,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      deliverLead(transport, lead),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => {
            try {
              transport.close?.();
            } catch {
              // The sanitized timeout response remains the source of truth.
            }

            reject(new Error('Lead delivery timed out'));
          },
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export function createLeadPostHandler({
  createTransport = createSmtpLeadTransport,
  rateLimit = defaultRateLimit,
  now = Date.now,
  trustProxy = process.env.LEAD_TRUST_PROXY === 'true',
  deliveryTimeoutMs = defaultDeliveryTimeoutMs,
  requestBodyTimeoutMs = defaultRequestBodyTimeoutMs,
}: LeadPostHandlerDependencies = {}) {
  const requestsByIp = new Map<string, number[]>();
  const maxTrackedIps =
    rateLimit.maxTrackedIps ?? defaultRateLimit.maxTrackedIps ?? 10_000;

  return async function POST(request: Request) {
    if (!acceptsRequest(request)) {
      return validationErrorResponse();
    }

    const timestamp = now();
    const clientIp = getClientIp(request, trustProxy);
    const requests = (requestsByIp.get(clientIp) ?? []).filter(
      (createdAt) => timestamp - createdAt < rateLimit.windowMs,
    );

    if (!requestsByIp.has(clientIp) && requestsByIp.size >= maxTrackedIps) {
      const oldestIp = requestsByIp.keys().next().value;

      if (oldestIp) {
        requestsByIp.delete(oldestIp);
      }
    }

    requestsByIp.delete(clientIp);
    requestsByIp.set(clientIp, requests);

    if (requests.length >= rateLimit.maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((requests[0] + rateLimit.windowMs - timestamp) / 1000),
      );

      return rateLimitedResponse(retryAfterSeconds);
    }

    requests.push(timestamp);
    requestsByIp.set(clientIp, requests);

    const body = await readJsonBody(request, requestBodyTimeoutMs);

    if (body === undefined) {
      return validationErrorResponse();
    }

    if (isHoneypotSubmission(body)) {
      return NextResponse.json({ ok: true });
    }

    const parsedLead = parseLead(body);

    if (!parsedLead.success) {
      return validationErrorResponse();
    }

    try {
      await deliverWithTimeout(
        createTransport(),
        parsedLead.data,
        deliveryTimeoutMs,
      );
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json(
        { ok: false, code: 'DELIVERY_ERROR' },
        { status: 503 },
      );
    }
  };
}
