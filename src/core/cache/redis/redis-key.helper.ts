import { RedisKeyModuleEnum } from './redis-key.enum';

const Splitor = ':';

export class RedisKeyHelper {
  static buildBDCwxaiAccessTokenKey(appId: string): string {
    return buildRedisKey(RedisKeyModuleEnum.bcewxai, 'token', appId);
  }

  static buildJwtTokenCacheKey(uid: number, iat: number): string {
    return buildRedisKey(RedisKeyModuleEnum.jwt, 'uid', uid, iat);
  }

  static buildTaskQueueMessageKey(
    uid: number,
    reqid: string,
    aitype: AIType = 'wxai',
  ) {
    return buildRedisKey(RedisKeyModuleEnum.task, aitype, uid, reqid);
  }

  static buildCustomKey(...args: Array<string | number>) {
    return args.join(Splitor);
  }
}

export function buildRedisKey(...args: Array<string | number>): string {
  return args.filter((v) => v !== undefined && ('' + v).length).join(Splitor);
}
