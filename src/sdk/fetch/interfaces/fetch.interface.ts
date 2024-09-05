/// <reference types="node" />
/// <reference lib="dom" />

import { RequestOptions } from 'http';
// import { ProxyAIError } from './proxy.ai.error';

export interface RequestInit {
  /**
   * A BodyInit object or null to set request's body.
   */
  body?: BodyInit | null;
  /**
   * A Headers object, an object literal, or an array of two-item arrays to set request's headers.
   */
  headers?: HeadersInit;
  /**
   * A string to set request's method.
   */
  method?: SSEMethod | string;
  /**
   * A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect.
   */
  redirect?: RequestRedirect;
  /**
   * An AbortSignal to set request's signal.
   */
  signal?: AbortSignal | null;
  /**
   * A string whose value is a same-origin URL, "about:client", or the empty string, to set request’s referrer.
   */
  referrer?: string;
  /**
   * A referrer policy to set request’s referrerPolicy.
   */
  referrerPolicy?: ReferrerPolicy;

  // Node-fetch extensions to the whatwg/fetch spec
  agent?:
    | RequestOptions['agent']
    | ((parsedUrl: URL) => RequestOptions['agent']);
  compress?: boolean;
  counter?: number;
  follow?: number;
  hostname?: string;
  port?: number;
  protocol?: string;
  size?: number;
  highWaterMark?: number;
  insecureHTTPParser?: boolean;
}

export interface SSERequestOptions extends RequestInit {
  onMessage?: (data: string) => void;
  onError?: (err?: any) => void;
}

const fetch = globalThis.fetch;

export { fetch };
