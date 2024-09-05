import { asyncStreamIterable } from './async-stream-iterable';
import {
  fetch as globalFetch,
  SSERequestOptions,
} from './interfaces/fetch.interface';
import { ProxyAIError } from './interfaces/proxy.ai.error';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

export async function fetchWxaiSSE(
  url: string,
  options: SSERequestOptions,
  fetch: FetchFn = globalFetch,
) {
  const { onMessage, onError, ...fetchOptions } = options;

  const res = await fetch(url, fetchOptions);

  //
  if (!res.ok) {
    let reason = '';

    try {
      reason = await res.text();
    } catch (err: any) {
      reason = err?.message ?? res.statusText;
    }

    const errorMsg = `Proxy WXAI error ${res.status}:${reason}`;

    const error = new ProxyAIError(errorMsg, {
      errorCode: res.status,
    });
    error.statusCode = res.status;
    error.statusText = res.statusText;

    throw error;
  }

  const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
    if (event.type === 'event' && typeof onMessage === 'function') {
      onMessage(event.data);
    }
  });

  // handle sepial response errors
  const feed = (chunk: string) => {
    let response = null;
    // globalThis.console.log('chunk>>>>', chunk.toString());
    try {
      if (chunk.replaceAll(/\n|\s/g, '').trim().length) {
        let _chunk = chunk.toString();
        if (/^data: /.test(_chunk)) {
          _chunk = _chunk.replace(/^data: /, '');
        }
        response = JSON.parse(_chunk);
      }
    } catch (_error) {
      /** ignore parse json */
      globalThis.console.log(_error);
    }

    // handle respose json error
    // @see https://console.bce.baidu.com/support/?_=1724032104228#/api?product=QIANFAN&project=%E5%8D%83%E5%B8%86%E5%A4%A7%E6%A8%A1%E5%9E%8B%E5%B9%B3%E5%8F%B0
    if (response?.error_code) {
      const errMsg = `Proxy WXAI error ${response.error_code} : ${response?.error_msg} (${response?.id})`;

      const err = new ProxyAIError(errMsg, {
        errorCode: Number(response.error_code),
      });
      err.statusCode = 500;
      err.statusText = response?.error_msg ?? `Fetch ${url} failure.`;

      if (typeof onError === 'function') {
        onError(err);
      } else {
        globalThis.console.error(err);
        // TODO logged
      }

      return;
    }

    parser.feed(chunk);
  };

  if (!res.body.getReader) {
    // Vercel polyfills `fetch` with `node-fetch`, which doesn't conform to
    // web standards, so this is a workaround...

    const body: NodeJS.ReadWriteStream = res.body as any;
    if (!body.on || !body.read) {
      throw new ProxyAIError(`Unsupport 'fetch' implemention`);
    }
    body.on('readable', () => {
      let chunk: string | Buffer;
      while (null !== (chunk = body.read())) {
        feed(chunk.toString());
      }
    });
  } else {
    for await (const chunk of asyncStreamIterable(res.body)) {
      const str = new TextDecoder().decode(chunk);
      feed(str);
    }
  }

  return res;
}
