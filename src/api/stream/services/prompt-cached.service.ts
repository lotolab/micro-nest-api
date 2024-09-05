import { Injectable } from '@nestjs/common';
import { RedisKeyHelper, RedisService } from 'src/core/cache';

/**
 * @author lanbery<lanbery@github.com>
 * management prompt engineering cache
 */
@Injectable()
export class PromptCachedService {
  constructor(private readonly redis: RedisService) {}

  public async getPromptEngineeringCache(
    tid: number,
  ): Promise<PromptEngineeringTemplateCached | null> {
    const k = PromptCachedService.promptEngineeringCacheKey(tid);
    const cached = await this.redis.getData<PromptEngineeringTemplateCached>(k);

    return cached ?? null;
  }

  static promptEngineeringCacheKey(tid: number): string {
    return RedisKeyHelper.buildCustomKey('tpl', 'aigc', tid);
  }
}
