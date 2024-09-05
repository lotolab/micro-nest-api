import { Injectable, Logger } from '@nestjs/common';
import { FanwenAPIClientFactory } from '../client/client.factory';

import {
  IFakeNewsDetailType,
  IFakeNewsType,
  IFanwenToken,
  IQueryFakeNewsResultType,
  IfwCityTree,
} from '../interface';
import { RedisService } from 'src/core/cache';
import { BizCodeEnum, BizException } from 'src/exception';
import { RegionConvertService } from 'src/core';
import { SearchAdvanceParamsDto } from '../dto';
import {
  betweenLastMonth,
  betweenLastWeek,
  betweenLastYear,
} from 'src/core/utils';

@Injectable()
export class FanwenAPIService {
  protected logger = new Logger(FanwenAPIService.name);

  constructor(
    private readonly cli: FanwenAPIClientFactory,
    private readonly redis: RedisService,
    private readonly regionConvertService: RegionConvertService,
  ) {}

  async getCitytree() {
    const sync = await this.getCtiyTreeSyncStatus();
    if (sync)
      throw BizException.createError(
        BizCodeEnum.API_LIMIT,
        `当前已存在同步任务请勿重复操作`,
      );
    const url = await this.cli.getCityTreeUrl();
    const resp = await this.cli.get<Array<IfwCityTree>>(url);
    if (resp?.length) {
      this.setCityTreeSyncData(resp);
    }

    return resp;
  }

  async syncRegionFromCache() {
    const caches = await this.getCityTreeCaches();
    return await this.regionConvertService.syncCityTreeUpdate(caches);
  }

  private async getCityTreeCaches(): Promise<Array<IfwCityTree>> {
    const key = this.cli.getCityTreeSyncKey();
    const data = await this.redis.getData<Array<IfwCityTree>>(key);

    return data ?? [];
  }

  connectToken(): Promise<IFanwenToken | never> {
    return this.cli.connectToken();
  }

  async getCtiyTreeSyncStatus(): Promise<boolean> {
    const key = this.cli.getCityTreeSyncKey();
    return this.redis.hasKey(key);
  }

  setCityTreeSyncData(data: Array<IfwCityTree>) {
    if (!data) return;
    const key = this.cli.getCityTreeSyncKey();
    this.redis.setData(key, data, 3600 * 24);
  }

  /**
   *
   * @param dto
   */
  async getAdvanced(dto: SearchAdvanceParamsDto) {
    const {
      page = 1,
      pageSize = 20,
      peroid,
      classes = [],
      keywords = '',
      cityids = [],
      markinfo = true,
    } = dto;

    let dateCondition: BetweenDateStrType = {};
    switch (peroid) {
      case 'week':
        dateCondition = { ...betweenLastWeek(1) };
        break;
      case 'month':
        dateCondition = { ...betweenLastMonth(1) };
        break;
      case 'twoMonth':
        dateCondition = { ...betweenLastMonth(2) };
        break;
      case 'season':
        dateCondition = { ...betweenLastMonth(3) };
        break;
      case 'sixMonth':
        dateCondition = { ...betweenLastMonth(6) };
        break;
      case 'year':
        dateCondition = { ...betweenLastYear(1) };
        break;
      case 'all':
      default:
        break;
    }

    let cityidsCondition = [];
    if (cityids.length && cityids.findIndex((id) => id === 0) < 0) {
      cityidsCondition = [...cityids];
    }

    const keywordsConditions = [];
    if (keywords?.trim()?.length) {
      keywords
        .split(' ')
        .filter((v) => v.trim().length)
        .forEach((v) => {
          keywordsConditions.push({
            field: '',
            word: /^\^.*$/.test(v) ? v.slice(1) : v,
            andornot: /^\^.*$/.test(v) ? 0 : 1, // 0-必须存在，1-可以存在,2- 不能出现
          });
        });
    }

    const contidions: Record<string, any> = {
      pageIndex: page,
      pageSize,
      keywords: keywordsConditions,
      date: {
        ...dateCondition,
      },
      cityids: cityidsCondition,
      classes,
      markinfo,
    };

    const url = await this.cli.articleSearchAdvancedUrl();

    const { total, rows } = await this.cli.post<IQueryFakeNewsResultType>(
      url,
      contidions,
    );

    const result: PaginationResultData<IFakeNewsType> = {
      total,
      page,
      pageSize,
      list: rows ?? [],
    };

    return result;
  }

  async getDetailList(ids: Array<string>): Promise<Array<IFakeNewsDetailType>> {
    if (!ids?.length)
      throw BizException.createError(
        BizCodeEnum.ILLEGAL_ARGS,
        'Parameters invalid.',
      );

    const url = await this.cli.articleContentUrl();

    const datas = await this.cli.post<Array<IFakeNewsDetailType>>(url, ids);

    return (datas as unknown as Array<IFakeNewsDetailType>) ?? [];
  }

  async getDetailFakenewsContent(
    sid: string,
  ): Promise<IFakeNewsDetailType | null> {
    const datas = await this.getDetailList([sid]);
    if (datas.length) return datas[0];
    return null;
  }
}
