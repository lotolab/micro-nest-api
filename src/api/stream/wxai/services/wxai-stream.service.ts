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
import {
  ClientAPIRequestOptions,
  WxaiChatProcessReqDto,
} from 'src/sdk/wxsdk/interfaces';
import { WxaiClientAPI } from 'src/sdk/wxsdk/services/wxai.client.api';
import { getTokenUrl, getWxaiUrl } from 'src/sdk/wxsdk/utils';
import {
  convertSseErrorMessageByMessage,
  createSseErrorMessage,
  createTaskQueueCache,
} from '../wxai-utils';

/**
 *
 */
@Injectable()
export class WxaiStreamService implements OnModuleInit, OnModuleDestroy {
  protected logger = new Logger(WxaiStreamService.name);
  private readonly dropSeconds: number = 30;
  private wxaiOption: WXAI.WxaiConfigType | undefined;
  private readonly timeoutMs: number = 10 * 60 * 1000;
  private readonly cacheExpSeconds: number = 2 * 60;

  private _cli: WxaiClientAPI;

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

  get CliAPI(): WxaiClientAPI {
    if (!this._cli) {
      const { appId } = this.wxaiOption;
      this._cli = new WxaiClientAPI({ appId });
    }
    return this._cli;
  }

  public tokenCacheKey(): string {
    if (!this.apiKey?.length || !this.apiSecret)
      throw new Error('apiSecret invalid.');
    return RedisKeyHelper.buildBDCwxaiAccessTokenKey(this.apiKey);
  }

  async getAccessToken() {
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

  public async getModelUrl(
    modelKey: WXAI.ModelRouteKeyType = 'ernie_speed',
  ): Promise<string | never> {
    const { access_token } = await this.getAccessToken();

    return getWxaiUrl(modelKey, { token: access_token });
  }

  public chatProcess(
    dto: WxaiChatProcessReqDto,
    options?: SSEChatProcessOptions,
  ) {
    this.logger.log(dto, options);
    const ob$ = new Observable((subscribe) => {
      try {
        // if (dto.uuid)
        //   throw BizException.createError(
        //     BizCodeEnum.API_VERIFY_CODE_AVAILABLE,
        //     `Some UUID ${dto.uuid}`,
        //   );
        this.sendChatProcess(
          dto,
          (d: any) => {
            if ((d as unknown as WXAI.WxaiErrorType).error_code) {
              const { error_code, error_msg } =
                d as unknown as WXAI.WxaiErrorType;

              const evData = convertSseErrorMessageByMessage(
                error_msg,
                error_code,
              );
              subscribe.error(JSON.stringify(evData));
              // TODO update taskQueue Message
            } else {
              subscribe.next(JSON.stringify(d));
              // TODO update taskQueue Message
            }
          },
          options,
        )
          .then(() => {
            subscribe.complete();
            // TODO update taskQueue Message
          })
          .catch((err: any) => {
            this.logger.error(err);
            const evData = createSseErrorMessage(err);
            subscribe.error(JSON.stringify(evData));
          });
      } catch (e: any) {
        this.logger.error(e);
        const evData = createSseErrorMessage(e);
        subscribe.error(JSON.stringify(evData));
      }
    });
    return ob$;
  }

  protected updateSomeTaskQueueMessage() {}

  /**
   *
   * @param dto validate out before call
   */
  protected async sendChatProcess(
    dto: WxaiChatProcessReqDto,
    callbackMessage: (d: any) => void,
    opts?: SSEChatProcessOptions,
  ) {
    const { text, aiopts } = dto;

    let { messages, model } = dto;

    if (!model?.length) {
      model = 'completions_pro';
    }
    if (!messages?.length && !text?.length) {
      throw BizException.createError(
        BizCodeEnum.SSE_VALIDATE_ERROR,
        `缺少提示词参数[text or messages]`,
      );
    }
    const url = await this.getModelUrl(model);
    if (!messages?.length) {
      messages = [
        {
          role: 'user',
          content: text,
        },
      ];
    }

    const reqOpts: ClientAPIRequestOptions = {
      method: 'POST',
      url,
      timeoutMs: this.timeoutMs,
      data: {
        ...aiopts,
        messages,
        stream: true,
      },
      onProcess: callbackMessage,
    };
    await this.setTaskQueueCache({ ...opts, model });
    return await this.CliAPI.createChatStreamCompletions(reqOpts);
  }

  protected async setTaskQueueCache(
    opts: SSEChatProcessBaseOptions,
  ): Promise<SSETaskQueueCacheData> {
    const { uid, reqid } = opts;
    const k = RedisKeyHelper.buildTaskQueueMessageKey(uid, reqid, 'wxai');

    const data = createTaskQueueCache(opts, [], 'wxai');
    const ex = this.cacheExpSeconds;
    await this.redisService.setData(k, data, ex);

    return data;
  }
  /**
   *
   */
  onModuleDestroy() {
    // throw new Error('Method not implemented.');
  }
}
