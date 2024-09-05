import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IFanwenConfigSchema } from 'src/config';
import {
  RedisKeyModuleEnum,
  RedisService,
  buildRedisKey,
} from 'src/core/cache';
import { BizCodeEnum, BizException } from 'src/exception';
import { IFanwenAPIResponse, IFanwenToken } from '../interface';
import * as qs from 'qs';
import { catchError, lastValueFrom } from 'rxjs';

const FW_SUB_PATH = 'v1/bingtuan';

@Injectable()
export class FanwenAPIClientFactory {
  protected logger = new Logger(FanwenAPIClientFactory.name);

  private tokenBaseUrl = 'https://ids.hzfanews.com';

  protected options: IFanwenConfigSchema = {
    baseURL: 'https://oapi.hzfanews.com',
    grantType: 'client_credentials',
    clientId: '',
    clientSecret: '',
  };

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {
    const options = this.configService.get<IFanwenConfigSchema | null>(
      'fw',
      null,
    );
    if (!options) throw new Error(`Load config fw fail.`);
    const { baseURL, grantType, clientId, clientSecret } = options;
    this.options = {
      ...this.options,
      baseURL: baseURL?.length ? baseURL : this.options.baseURL,
      grantType: grantType?.length ? grantType : this.options.grantType,
      clientId,
      clientSecret,
    };
    if (this.options.baseURL.endsWith('/'))
      this.options.baseURL = this.options.baseURL.substring(
        0,
        this.options.baseURL.length - 1,
      );
  }

  validOptions() {
    const { baseURL, grantType, clientId, clientSecret } = this.options;
    if (!baseURL?.length)
      throw BizException.createError(
        BizCodeEnum.API_SERVER_CONFIG_ERROR,
        `BaseURL unset.`,
      );

    if (!grantType?.length)
      BizException.createError(
        BizCodeEnum.API_SERVER_CONFIG_ERROR,
        `Config grantType value illegal.`,
      );

    if (!clientId?.length)
      BizException.createError(
        BizCodeEnum.API_SERVER_CONFIG_ERROR,
        `Config clientId value illegal.`,
      );
    if (!clientSecret?.length)
      BizException.createError(
        BizCodeEnum.API_SERVER_CONFIG_ERROR,
        `Config clientSecret value illegal.`,
      );

    return this.options;
  }

  async get<T = any>(
    url: string,
    params?: Record<string, any>,
  ): Promise<T | never> {
    const token = await this.connectToken();
    const { access_token } = token;

    const options = {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    if (params && Object.keys(params)?.length) {
      options['params'] = params;
    }

    const fetchResp = await this.http.get(url, options);

    try {
      const { data: respData } = await lastValueFrom(
        fetchResp.pipe(
          catchError((error) => {
            this.logger.error(`Url: ${url}`, error);
            throw error;
          }),
        ),
      );
      if (!respData) {
        throw BizException.createError(
          BizCodeEnum.API_SERVER_CALL_FAIL,
          `接口未返回有效数据`,
        );
      }
      const { succeed, code, msg, data } =
        respData as unknown as IFanwenAPIResponse<T>;

      if (!succeed || code !== 0) {
        this.logger.warn(`凡闻API [${url}] 调用返回数据不正确.${code}-${msg}`);
        throw BizException.createError(
          BizCodeEnum.API_SERVER_CALL_FAIL,
          `凡闻API [${url}] 调用返回数据不正确.${code}-${msg}`,
        );
      }
      return data as T;
    } catch (error: any) {
      this.logger.error(`API [${url}] call fail. ${error?.message}`);
      throw BizException.createError(
        BizCodeEnum.API_SERVER_CALL_FAIL,
        error?.message ?? '凡闻API 调用失败',
      );
    }
  }

  async post<T = any>(
    url: string,
    data?: Record<string, any> | any[],
  ): Promise<T | never> {
    const token = await this.connectToken();
    const { access_token } = token;

    const options = {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    const fetchResp = await this.http.post(url, data ?? null, {
      ...options,
    });

    try {
      const { data: respData } = await lastValueFrom(
        fetchResp.pipe(
          catchError((error) => {
            this.logger.error(`Url: ${url}`, error);
            throw error;
          }),
        ),
      );
      if (!respData) {
        throw BizException.createError(
          BizCodeEnum.API_SERVER_CALL_FAIL,
          `接口未返回有效数据`,
        );
      }
      const { succeed, code, msg, data } =
        respData as unknown as IFanwenAPIResponse<T>;

      if (!succeed || code !== 0) {
        this.logger.warn(`凡闻API [${url}] 调用返回数据不正确.${code}-${msg}`);
        throw BizException.createError(
          BizCodeEnum.API_SERVER_CALL_FAIL,
          `凡闻API [${url}] 调用返回数据不正确.${code}-${msg}`,
        );
      }

      return data as unknown as T;
    } catch (error: any) {
      this.logger.error(`API [${url}] call fail. ${error?.message}`);
      throw BizException.createError(
        BizCodeEnum.API_SERVER_CALL_FAIL,
        error?.message ?? '凡闻API 调用失败',
      );
    }
  }

  async connectToken(): Promise<IFanwenToken | never> {
    const token = await this.getCacheToken();
    if (token) return token;

    const url = await this.tokenUrl();
    const { clientId, clientSecret, grantType } = await this.validOptions();

    const fetchResp = await this.http.request({
      method: 'POST',
      url,
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({
        grant_type: grantType,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    try {
      const { data: respData } = await lastValueFrom(
        fetchResp.pipe(
          catchError((error) => {
            this.logger.error('FW Token Error:', error);
            throw error;
          }),
        ),
      );
      if (typeof respData !== 'object') {
        this.logger.log(respData);
        throw BizException.createError(
          BizCodeEnum.API_SERVER_CALL_FAIL,
          `Token 数据非法 ${respData}`,
        );
      }
      const token = respData as IFanwenToken;

      await this.setCacheToken(token);
      return token;
    } catch (ex: any) {
      this.logger.error(ex);
      throw BizException.createError(
        BizCodeEnum.API_SERVER_CALL_FAIL,
        `调用凡闻 token API 失败: ${ex?.message}`,
      );
    }
    return;
  }

  tokenUrl(): string {
    return `${this.tokenBaseUrl}/connect/token`;
  }

  articleSearchAdvancedUrl(): string {
    const { baseURL } = this.validOptions();
    return `${baseURL}/${FW_SUB_PATH}/getadvanced`;
  }

  articleContentUrl(): string {
    const { baseURL } = this.validOptions();
    return `${baseURL}/${FW_SUB_PATH}/getarticlelist`;
  }

  getCityTreeUrl(): string {
    const { baseURL } = this.validOptions();
    return `${baseURL}/${FW_SUB_PATH}/getcitytree`;
  }

  async setCacheToken(token: IFanwenToken) {
    const { expires_in = 3600 } = token;
    const key = this.getTokenCacheKey();

    await this.redis.setData(key, token, expires_in);
  }

  async getCacheToken(): Promise<IFanwenToken | never> {
    const key = this.getTokenCacheKey();
    return await this.redis.getData<IFanwenToken>(key);
  }

  getTokenCacheKey() {
    const { clientId } = this.validOptions();

    return buildRedisKey(RedisKeyModuleEnum.fanwen, 'cid', clientId);
  }

  getCityTreeSyncPatternKey() {
    return buildRedisKey(RedisKeyModuleEnum.fanwen, 'sync');
  }

  getCityTreeSyncKey() {
    const { clientId } = this.validOptions();
    return buildRedisKey(RedisKeyModuleEnum.fanwen, 'sync', clientId);
  }
}
