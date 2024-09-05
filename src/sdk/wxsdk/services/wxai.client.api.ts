import { Logger, RequestMethod } from '@nestjs/common';
import {
  ClientAPIConstructOptions,
  ClientAPIRequestOptions,
} from '../interfaces';
import {
  fetchWxaiSSE,
  fetch as globalFetch,
  ProxyAIError,
  SSERequestOptions,
} from 'src/sdk/fetch';

export class WxaiClientAPI {
  protected readonly logger = new Logger(WxaiClientAPI.name);
  protected appid: string = '';
  protected debug: boolean = false;
  protected method = RequestMethod.POST;

  protected _headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  protected _handlePromptFn: HandlePromptFn<WXAI.AIMessage> | undefined;
  protected _loggedFn: FetchLoggedFn | undefined;
  protected _createMsgId: CreateAIMsgIdFn | undefined;
  protected _fetchFn: FetchFn;

  constructor(opts: ClientAPIConstructOptions) {
    const {
      appId,
      headers,
      debug = false,
      handlePrompt,
      logged,
      fetchFn = globalFetch,
    } = opts;
    this._headers = {
      ...this._headers,
      ...headers,
    };
    this.debug = debug;
    this.appid = appId;
    this._handlePromptFn = handlePrompt;
    this._loggedFn = logged;
    this._fetchFn = fetchFn;
  }

  /**
   *
   */
  async createChatStreamCompletions(options: ClientAPIRequestOptions) {
    const { method = 'POST', url, model, data, timeoutMs, onProcess } = options;

    const stream: boolean = true; // onProcess ? true : false;

    let { headers, abortSignal } = options;
    let abortController: AbortController = null;

    headers = {
      ...this._headers,
      ...headers,
    };
    if (timeoutMs && !abortSignal) {
      abortController = new AbortController();
      abortSignal = abortController.signal;
    }

    if (this.debug) {
      this.logger.log(`Wxai options [${model}]:`, options);
    }

    const responseP = new Promise<any>(async (resolve, reject) => {
      const body = JSON.stringify({ ...data, stream });

      if (stream) {
        const fetchOptions: SSERequestOptions = {
          method,
          headers,
          body: method !== 'GET' ? body : undefined,
          signal: abortSignal,
          onMessage: (data: string) => {
            // this.logger.log(`stream data log:\n ${data}`);
            if (!data) {
              return reject(ProxyAIError.createUnknownError());
            }
            try {
              const result: WXAI.WxaiReponseType = JSON.parse(data);
              if (result?.error_code) {
                const msg = `Wxai Proxy error: ${result.error_code} - ${result?.error_msg ?? 'Internal error'}`;
                return reject(
                  ProxyAIError.createError(msg, null, result.error_code),
                );
              }

              onProcess?.(result as WXAI.WxaiSuccessType);
            } catch (error: any) {
              return reject(ProxyAIError.createUnknownError(error));
            }
          },
          onError: (e: ProxyAIError) => {
            return reject(e);
          },
        };
        fetchWxaiSSE(url, fetchOptions, this._fetchFn).catch(reject);
      } else {
        try {
          const res: Response = await this._fetchFn(url, {
            method,
            headers,
            body: method !== 'GET' ? body : undefined,
            signal: abortSignal,
          });

          if (!res.ok) {
            const reason = await res.text();
            const errMsg = `Wxai API error : ${res.status} - ${reason ?? res.statusText}`;
            const error = ProxyAIError.createError(errMsg, res);

            return reject(error);
          }

          const resData = await res.json();
          if (resData?.error_code) {
            const errMsg = `Wxai API error: ${resData.error_code} - ${resData?.error_msg ?? res.statusText}`;
            return reject(
              ProxyAIError.createError(errMsg, res, resData.error_code),
            );
          }

          return resolve(resData as unknown as WXAI.WxaiSuccessType);

          // normal return
        } catch (ex: any) {
          this.logger.error(`error: ${url}`, ex);
          return reject(ProxyAIError.createUnknownError(ex));
        }
      }
    }).then(async (result: WXAI.WxaiSuccessType) => {
      // TODO handle result
      return result;
    });

    if (timeoutMs) {
      if (abortController) {
        // This will be called when a timeout occurs in order for us to forcibly
        // ensure that the underlying HTTP request is aborted.
        (responseP as any).cancel = () => {
          abortController.abort();
        };
      }

      return responseP;
    } else {
      return responseP;
    }
  }
}
