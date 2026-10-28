import { createServer, type Socket } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSmtpLeadTransport } from '../../lib/leads/mailer';

function within<T>(promise: Promise<T>, milliseconds = 1_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Socket did not close promptly')), milliseconds); }),
  ]).finally(() => clearTimeout(timer));
}

async function stalledServer() {
  const peers = new Set<Socket>();
  let accepted: (peer: Socket) => void = () => undefined;
  const connected = new Promise<Socket>((resolve) => { accepted = resolve; });
  const server = createServer((peer) => {
    peers.add(peer);
    peer.on('error', () => undefined);
    peer.on('data', () => undefined);
    peer.once('close', () => peers.delete(peer));
    accepted(peer);
    // Deliberately send neither SMTP greeting nor TLS handshake. An active
    // connection must be aborted by our close(), not greeting/socket timeout.
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test TCP port');
  return {
    port: address.port, peers, connected,
    close: async () => {
      for (const peer of peers) peer.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

function configure(port: number, secure: boolean) {
  vi.stubEnv('SMTP_HOST', '127.0.0.1');
  vi.stubEnv('SMTP_PORT', String(port));
  vi.stubEnv('SMTP_SECURE', String(secure));
  vi.stubEnv('SMTP_USER', 'local-test-user');
  vi.stubEnv('SMTP_PASS', 'local-test-password');
}

const message = { from: 'sender@example.test', to: 'recipient@example.test', subject: 'Local cancellation test', text: 'Local test only' };

describe('SMTP active cancellation with the installed Nodemailer', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([false, true])('destroys the actual peer connection for secure=%s before SMTP deadlines', async (secure) => {
    const server = await stalledServer();
    configure(server.port, secure);
    const transport = createSmtpLeadTransport();
    const outcome = transport.sendMail(message).then(() => 'accepted', () => 'rejected');
    try {
      const peer = await within(server.connected);
      const disconnected = new Promise<void>((resolve) => peer.once('close', () => resolve()));
      transport.close?.();
      await within(disconnected);
      expect(await within(outcome)).toBe('rejected');
      expect(server.peers.size).toBe(0);
      await expect(transport.sendMail(message)).rejects.toThrow('SMTP transport closed');
    } finally {
      transport.close?.();
      await server.close();
    }
  });

  it('prevents queued send work from opening a socket after cancellation', async () => {
    const server = await stalledServer();
    configure(server.port, false);
    const transport = createSmtpLeadTransport();
    const outcome = transport.sendMail(message).then(() => 'accepted', () => 'rejected');
    transport.close?.();
    try {
      expect(await within(outcome)).toBe('rejected');
      expect(server.peers.size).toBe(0);
    } finally {
      await server.close();
    }
  });
});
