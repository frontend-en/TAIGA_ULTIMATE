export class SecurityRequestError extends Error {
  constructor(public readonly code: 'timeout' | 'aborted' | 'response_too_large' | 'invalid_response' | 'request_failed') {
    super(`Security provider request failed: ${code}`);
    this.name = 'SecurityRequestError';
  }
}

interface JsonRequestOptions {
  timeoutMs: number;
  maxBytes: number;
  signal?: AbortSignal;
  fetch?: typeof fetch;
}

export async function securityJsonRequest(
  url: string,
  init: RequestInit,
  options: JsonRequestOptions,
): Promise<{ status: number; body: unknown }> {
  const controller = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let abortReason: SecurityRequestError | undefined;
  let rejectAborted: (reason: SecurityRequestError) => void = () => undefined;
  const aborted = new Promise<never>((_, reject) => { rejectAborted = reject; });
  const abort = (code: 'timeout' | 'aborted') => {
    if (abortReason) return;
    abortReason = new SecurityRequestError(code);
    controller.abort();
    void reader?.cancel().catch(() => undefined);
    rejectAborted(abortReason);
  };
  const onAbort = () => abort('aborted');
  const timer = setTimeout(() => abort('timeout'), options.timeoutMs);
  options.signal?.addEventListener('abort', onAbort, { once: true });

  const request = async () => {
    if (options.signal?.aborted) throw new SecurityRequestError('aborted');
    const response = await (options.fetch ?? fetch)(url, {
      ...init,
      cache: 'no-store',
      redirect: 'error',
      signal: controller.signal,
    });
    if (abortReason) throw abortReason;
    if (Number(response.headers.get('content-length')) > options.maxBytes || !response.body) {
      void response.body?.cancel().catch(() => undefined);
      throw new SecurityRequestError(response.body ? 'response_too_large' : 'invalid_response');
    }
    reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const part = await reader.read();
      if (abortReason) throw abortReason;
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > options.maxBytes) {
        void reader.cancel().catch(() => undefined);
        throw new SecurityRequestError('response_too_large');
      }
      chunks.push(part.value);
    }
    const data = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.byteLength;
    }
    try {
      return { status: response.status, body: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(data)) as unknown };
    } catch {
      throw new SecurityRequestError('invalid_response');
    }
  };

  try {
    return await Promise.race([request(), aborted]);
  } catch (error) {
    if (abortReason) throw abortReason;
    if (error instanceof SecurityRequestError) throw error;
    throw new SecurityRequestError('request_failed');
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}
