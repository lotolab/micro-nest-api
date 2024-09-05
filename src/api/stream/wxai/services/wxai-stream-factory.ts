import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';

import { catchError, lastValueFrom, Observable } from 'rxjs';
import { RedisKeyHelper, RedisService } from 'src/core/cache';
import { BizCodeEnum, BizException } from 'src/exception';
import { fetchWxaiSSE, ProxyAIError } from 'src/sdk/fetch';
import {
  ClientAPIRequestOptions,
  WxaiChatProcessReqDto,
} from 'src/sdk/wxsdk/interfaces';
import { getTokenUrl, getWxaiUrl } from 'src/sdk/wxsdk/utils';
import { createSseErrorMessage, createTaskQueueCache } from '../wxai-utils';
import { Response } from 'express';

const fetchHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
};

const TimeoutMs = 20 * 60 * 1000;
/**
 * @author lanbery
 * @description
 *  this sse factory for wxai
 */
@Injectable()
export class WxaiStreamFactory implements OnModuleInit, OnModuleDestroy {
  protected logger = new Logger(WxaiStreamFactory.name);
  private readonly dropSeconds: number = 30;
  private wxaiOption: WXAI.WxaiConfigType | undefined;

  constructor(
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
    private readonly http: HttpService,
  ) {}

  onModuleInit() {
    const { name, appId, apiKey, apiSecret } = this.config.get<
      Record<string, string>
    >('bce.wxai', {});
    if (!appId || !apiKey?.length || !apiSecret?.length)
      throw new Error(`Miss bce.wxai config`);
    this.wxaiOption = { name, apiKey, apiSecret, appId } as WXAI.WxaiConfigType;
  }

  get apiKey() {
    return this.wxaiOption?.apiKey;
  }

  get apiSecret() {
    return this.wxaiOption.apiSecret;
  }

  public async getModelUrl(modelKey: WXAI.ModelRouteKeyType = 'ernie_speed') {
    const { access_token } = await this.getAccessToken();

    return getWxaiUrl(modelKey, { token: access_token });
  }

  /**
   * only use messages
   * @param dto validate params before call this function
   * @param options
   * @returns stream
   */
  public createChatComplition(
    dto: WxaiChatProcessReqDto,
    options: SSEChatProcessOptions,
  ) {
    const { model, messages, aiopts, uuid, tid } = dto;

    const {
      username,
      onOpen,
      onMessage,
      onError,
      onEnd,
      reqid,
      uid,
      cliid,
      ip,
    } = options;

    const cacheKey: string = RedisKeyHelper.buildTaskQueueMessageKey(
      uid,
      reqid,
      'wxai',
    );

    const data: WXAI.ChatAPIRequestOptions = {
      ...aiopts,
      messages,
      user_id: username,
      stream: true,
    };

    return new Observable((subscribe) => {
      const fetchStartTime = new Date().getTime();
      if (onOpen) {
        onOpen(
          cacheKey,
          createTaskQueueCache(
            {
              uid,
              username,
              ip,
              cliid,
              reqid,
              startTime: fetchStartTime,
              uuid,
              tid,
            },
            messages,
            'wxai',
          ),
        );
      }

      this.startStreamFetch({
        url: '', // will remove
        model,
        data: data,
        timeoutMs: TimeoutMs,
        onProcess: (message: WXAI.WxaiSuccessType) => {
          subscribe.next(JSON.stringify(message));
          onMessage?.(message, cacheKey);
        },
      })
        .then((_resp: Response) => {
          subscribe.complete();
          onEnd?.(cacheKey, fetchStartTime);
        })
        .catch((err) => {
          this.logger.error(err);
          const evData = createSseErrorMessage(err);
          subscribe.error(JSON.stringify(evData));
          onError?.(evData, cacheKey);
        });
    });
  }

  public async createAsyncChatComplition(
    dtoFn: (
      dto?: WxaiChatProcessReqDto,
    ) => Promise<WxaiChatProcessReqDto> | WxaiChatProcessReqDto,
    options: SSEChatProcessOptions,
  ) {
    const { model, messages, aiopts, uuid, tid } = await dtoFn();
    // this.logger.log('uuid', uuid, tid);
    const {
      username,
      onOpen,
      onMessage,
      onError,
      onEnd,
      reqid,
      uid,
      cliid,
      ip,
    } = options;

    const cacheKey: string = RedisKeyHelper.buildTaskQueueMessageKey(
      uid,
      reqid,
      'wxai',
    );

    const data: WXAI.ChatAPIRequestOptions = {
      ...aiopts,
      messages,
      user_id: username,
      stream: true,
    };

    this.logger.log('WxaiSSE Request body:', data);

    return new Observable((subscribe) => {
      const fetchStartTime = new Date().getTime();
      if (onOpen) {
        onOpen(
          cacheKey,
          createTaskQueueCache(
            {
              uid,
              username,
              ip,
              cliid,
              reqid,
              startTime: fetchStartTime,
              uuid,
              tid,
              reqData: data,
              aiopts: aiopts,
              model,
            },
            messages,
            'wxai',
          ),
        );
      }

      this.startStreamFetch({
        url: '', // will remove
        model,
        data: data,
        timeoutMs: TimeoutMs,
        onProcess: (message: WXAI.WxaiSuccessType) => {
          subscribe.next(JSON.stringify(message));
          onMessage?.(message, cacheKey);
        },
      })
        .then((_resp: Response) => {
          subscribe.complete();
          onEnd?.(cacheKey, fetchStartTime);
        })
        .catch((err) => {
          this.logger.error(err);
          const evData = createSseErrorMessage(err);
          subscribe.error(JSON.stringify(evData));
          onError?.(evData, cacheKey);
        });
    });
  }

  protected async startStreamFetch(options: ClientAPIRequestOptions) {
    const {
      timeoutMs,
      headers,
      data,
      model,
      method = 'POST',
      onProcess,
    } = options;

    const url = await this.getModelUrl(model);

    let abortController: AbortController = null;

    let { abortSignal } = options;
    if (timeoutMs && !abortSignal) {
      abortController = new AbortController();
      abortSignal = abortController.signal;
    }

    const responseP = new Promise<any>(async (reslove, reject) => {
      const body = JSON.stringify({ ...data, stream: true });

      fetchWxaiSSE(url, {
        method,
        headers: {
          ...fetchHeaders,
          ...headers,
        },
        body,
        signal: abortSignal,
        onMessage: (data: string) => {
          if (!data) reject(ProxyAIError.createUnknownError());
          try {
            const ret = JSON.parse(data);
            if (ret?.error_code) {
              const msg = `Wxai Proxy error: ${ret.error_code} - ${ret?.error_msg ?? 'Internal error'}`;

              return reject(
                ProxyAIError.createError(msg, null, ret.error_code),
              );
            }

            onProcess?.(ret as WXAI.WxaiSuccessType);
          } catch (e) {
            return reject(ProxyAIError.createUnknownError(e));
          }
        },
        onError: (err) => {
          this.logger.error('Request body', body, url);
          reject(err);
        },
      })
        .then((res) => {
          reslove(res);
        })
        .catch(reject);
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

  /**
   * get access token
   * @returns token object
   */
  public async getAccessToken() {
    const k = this.tokenCacheKey();
    let tk = await this.redisService.getData<WXAI.AccessTokenType>(k);
    const _axios = this.http;

    const GetWxaiAccessTokenFn = async function (
      clientKey: string,
      clientSecret: string,
    ): Promise<WXAI.AccessTokenType | undefined> {
      const _url = getTokenUrl(clientKey, clientSecret);

      try {
        const tkRes = _axios.request({
          method: 'POST',
          url: _url,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        const { data } = await lastValueFrom<
          AxiosResponse<WXAI.AccessTokenType>
        >(
          tkRes.pipe(
            catchError((err: AxiosError) => {
              throw err;
            }),
          ),
        );
        if (!data)
          throw new Error(`Get access token for ${clientKey} invalid. `);
        return data as unknown as WXAI.AccessTokenType;
      } catch (ex: any) {
        this.logger.error(ex);
        throw BizException.createError(
          BizCodeEnum.API_SERVER_CALL_FAIL,
          ex?.message || 'get bce oauth access token fail',
        );
      }
    };

    if (!tk) {
      tk = await GetWxaiAccessTokenFn(this.apiKey, this.apiSecret);
      const { expires_in } = tk;
      if (expires_in && expires_in - this.dropSeconds > 0) {
        await this.redisService.setData(k, tk, expires_in - this.dropSeconds);
      } else {
        throw BizException.createError(
          BizCodeEnum.API_SERVER_CALL_FAIL,
          `wxai token expire_in [${expires_in}] invalid`,
        );
      }
    }

    return tk;
  }

  public tokenCacheKey(): string {
    if (!this.apiKey?.length || !this.apiSecret)
      throw new Error('apiSecret invalid.');
    return RedisKeyHelper.buildBDCwxaiAccessTokenKey(this.apiKey);
  }

  onModuleDestroy() {
    // throw new Error('Method not implemented.');
  }
}
