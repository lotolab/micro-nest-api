import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';
import { ProxyAIError } from './interfaces';
import {
  fetch as globalFetch,
  SSERequestOptions,
} from './interfaces/fetch.interface';
import { asyncStreamIterable } from './async-stream-iterable';

/**
 * 暂不启用
 * @param url
 * @param options
 * @param fetch
 * @returns
 */
export async function wxaiFetchClient(
  url: string,
  options: SSERequestOptions,
  fetch: FetchFn = globalFetch,
) {
  const { onMessage, onError, method = 'POST', ...others } = options;

  const response = await fetch(url, { ...others, method });
  if (!response.ok) {
    let reason = '';
    try {
      reason = await response.text();
    } catch (err: any) {
      reason = err?.message ?? response.statusText;
    }

    const error = new ProxyAIError(
      `Proxy WXAI error ${response.status}:${reason}`,
      {
        errorCode: response.status,
      },
    );
    error.statusCode = response.status;
    error.statusText = response.statusText;

    throw error;
  }

  const parser = createParser((ev: ParsedEvent | ReconnectInterval) => {
    if (ev.type === 'event') {
      if (typeof onMessage === 'function') {
        onMessage(ev.data);
      } else {
        globalThis.console.warn(`Unhandle recived message:`, ev.data);
      }
    }
  });

  // handle sepial response errors
  const feed = (chunk: string) => {
    let respData = null;
    try {
      if (chunk.replaceAll(/\n|\s/g, '').trim().length) {
        let _chunk = chunk.toString();
        if (/^data: /.test(_chunk)) {
          _chunk = _chunk.replace(/^data: /, '');
        }
        respData = JSON.parse(_chunk);
      }
    } catch (_error) {
      /** ignore parse json */
    }

    // handle respose json error
    // @see https://console.bce.baidu.com/support/?_=1724032104228#/api?product=QIANFAN&project=%E5%8D%83%E5%B8%86%E5%A4%A7%E6%A8%A1%E5%9E%8B%E5%B9%B3%E5%8F%B0
    if (respData?.error_code) {
      // error
      const errMsg = `Proxy WXAI error ${respData.error_code} : ${respData?.error_msg} (${respData?.id})`;

      const err = new ProxyAIError(errMsg, {
        errorCode: Number(respData.error_code),
      });
      err.statusCode = Number(respData.error_code);
      err.statusText = respData?.error_msg ?? `Fetch ${url} failure.`;

      onError?.(err);

      return;
    }

    parser.feed(chunk);
  };

  if (!response.body.getReader) {
    // Vercel polyfills `fetch` with `node-fetch`, which doesn't conform to
    // web standards, so this is a workaround...

    const body: NodeJS.ReadWriteStream = response.body as any;
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
    for await (const chunk of asyncStreamIterable(response.body)) {
      const str = new TextDecoder().decode(chunk);
      feed(str);
    }
  }

  return response;
}
