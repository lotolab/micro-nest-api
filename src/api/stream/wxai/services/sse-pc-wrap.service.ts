import { Injectable, Logger } from '@nestjs/common';
// import { Response } from 'express';

import { WxaiChatProcessReqDto } from 'src/sdk/wxsdk/interfaces';
import { WxaiStreamFactory } from './wxai-stream-factory';
import { RedisKeyHelper, RedisService } from 'src/core/cache';
import { calcCostTime, createTaskQueueCache } from '../wxai-utils';
import { BizCodeEnum, BizException } from 'src/exception';
import { PromptCachedService } from '../../services/prompt-cached.service';
import { AiGlobalProps } from 'src/global.consts';
import { ChatLoggingService } from '../../services';

@Injectable()
export class SsePcWrapService {
  protected logger = new Logger(SsePcWrapService.name);
  private readonly cacheExpSeconds: number = 5 * 60;

  constructor(
    private readonly factory: WxaiStreamFactory,
    private readonly redisService: RedisService,
    private readonly promptCacheService: PromptCachedService,
    private readonly chatLoggingService: ChatLoggingService,
  ) {}

  pcChatProcess(dto: WxaiChatProcessReqDto, opts: SSEChatProcessOptions) {
    const { text } = dto;
    let { messages } = dto;
    if (!text?.length && !messages?.length) {
      throw BizException.createError(
        BizCodeEnum.ILLEGAL_ARGS,
        `text or messages at least one `,
      );
    }

    if (!messages?.length) {
      messages = [];
    }

    if (!messages.length || messages.slice(-1)[0].role === 'assistant') {
      messages.push({
        role: 'user',
        content: text,
      });
    }

    let result = '';
    return this.factory.createAsyncChatComplition(
      async () => {
        return this.prehandleDto(dto);
      },
      {
        ...opts,
        onOpen: (k: string, cache: SSETaskQueueCacheData) => {
          this.setTaskCacheOnOpen(k, cache);
        },
        onMessage: (data: WXAI.WxaiSuccessType, key: string) => {
          if (data?.result?.length) {
            result += data.result;
          }
          if (data && key?.length) {
            this.updateSomeTaskQueueMessage(key, {
              usage: data.usage,
              result,
              data: data,
            });
          }
        },
        onError: (ev: SSEErrorDataType, key: string) => {
          if (key?.length && ev) {
            this.updateSomeTaskQueueMessage(key, {
              completed: true,
              error: ev,
              result,
            }).then((cached) => {
              // TODO remove this logic when the task server deployed
              if (cached) {
                this.chatLoggingService.updateChatRecord(
                  cached as SSETaskQueueCacheData,
                );
              }
            });
          }
        },
        onEnd: (key: string, startTime: number) => {
          if (key.length) {
            const last = new Date().getTime();
            this.updateSomeTaskQueueMessage(key, {
              completed: true,
              endTime: last,
              costTime: calcCostTime(startTime, last),
              result,
            }).then((cached) => {
              // TODO remove this logic when the task server deployed
              if (cached) {
                this.chatLoggingService.updateChatRecord(
                  cached as SSETaskQueueCacheData,
                );
              }
            });
          }
        },
      },
    );
  }

  /**
   *
   * @param dto
   */
  pcMfChatProcess(dto: WxaiChatProcessReqDto, opts: SSEChatProcessOptions) {
    let result = '';
    return this.factory.createAsyncChatComplition(
      () => {
        return this.prehandleDto(dto);
      },
      {
        ...opts,
        onOpen: (k: string, cache: SSETaskQueueCacheData) => {
          this.setTaskCacheOnOpen(k, cache);
        },
        onMessage: (data: WXAI.WxaiSuccessType, key: string) => {
          if (data?.result?.length) {
            result += data.result;
          }
          if (data && key?.length) {
            this.updateSomeTaskQueueMessage(key, {
              usage: data.usage,
              result,
              data: data,
            });
          }
        },
        onError: (ev: SSEErrorDataType, key: string) => {
          if (key?.length && ev) {
            this.updateSomeTaskQueueMessage(key, {
              completed: true,
              error: ev,
              result,
            }).then((cached) => {
              // TODO remove this logic when the task server deployed
              if (cached) {
                this.chatLoggingService.updateChatRecord(
                  cached as SSETaskQueueCacheData,
                );
              }
            });
          }
        },
        onEnd: (key: string, startTime: number) => {
          if (key.length) {
            const last = new Date().getTime();
            this.updateSomeTaskQueueMessage(key, {
              completed: true,
              endTime: last,
              costTime: calcCostTime(startTime, last),
              result,
            }).then((cached) => {
              // TODO remove this logic when the task server deployed
              if (cached) {
                this.chatLoggingService.updateChatRecord(
                  cached as SSETaskQueueCacheData,
                );
              }
            });
          }
        },
      },
    );
  }

  /**
   * 预处理请求消息
   * @param dto
   * @returns
   */
  protected async prehandleDto(
    dto: WxaiChatProcessReqDto,
  ): Promise<WxaiChatProcessReqDto> {
    const { text, aiopts, uuid, model } = dto;

    const messages = dto.messages ?? [];

    if (!messages.length || messages.slice(-1)[0].role !== 'user') {
      messages.push({ role: 'user', content: text });
    }

    let handleDto = {
      ...dto,
      messages,
    };

    if (
      !uuid ||
      !(await this.promptCacheService.getPromptEngineeringCache(uuid as number))
    ) {
      return { ...handleDto, model: model ?? AiGlobalProps.wxaiDefaultModel };
    }

    const { modelName, systemMessage, temperature, penaltyScore } =
      await this.promptCacheService.getPromptEngineeringCache(uuid as number);

    const system = aiopts?.system ?? systemMessage;

    handleDto = {
      ...dto,
      messages,
      aiopts: {
        ...aiopts,
        system: system?.length ? system : undefined,
        temperature: temperature ? Number(temperature) : undefined,
        penalty_score: penaltyScore ? Number(penaltyScore) : undefined,
      },
      model: model ?? modelName ?? AiGlobalProps.wxaiDefaultModel,
    };

    this.logger.log('request dto original:', dto);
    return handleDto;
  }

  protected setTaskCacheOnOpen(key: string, cache: SSETaskQueueCacheData) {
    this.logger.log(cache, key);
    if (key.length && cache) {
      const ex = this.cacheExpSeconds;
      this.redisService.setData(key, cache, ex);

      // TODO save and create logged,this will remove when task server deploy done
      // TODO remove this logic when the task server deployed
      this.chatLoggingService.createChatRecord(cache);
    }
  }

  protected async updateSomeTaskQueueMessage(
    key: string,
    some: Partial<SSETaskQueueCacheData>,
  ): Promise<SSETaskQueueCacheData | never> {
    if (!key?.length || !some || !Object.keys(some).length) return;
    const cached = await this.redisService.updateSomeDataByKeyNodelay(
      key,
      some,
      this.cacheExpSeconds,
    );

    return cached as unknown as SSETaskQueueCacheData;
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
}
