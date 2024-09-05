import { Injectable } from '@nestjs/common';
import { AuthHelper } from 'src/auth';
import { UserService } from 'src/core';
import { RedisKeyHelper, RedisService } from 'src/core/cache';
import { ILoginUser } from 'src/core/interface';

@Injectable()
export class CacheTestService {
  constructor(
    private readonly redis: RedisService,
    private readonly userService: UserService,
    private readonly authHelper: AuthHelper,
  ) {}

  async getCacheKey(subkey: string) {
    const key = RedisKeyHelper.buildBDCwxaiAccessTokenKey(subkey);
    return this.redis.getData(key);
  }

  async setCacheKey(subkey: string) {
    const key = RedisKeyHelper.buildBDCwxaiAccessTokenKey(subkey);
    const cache = {
      name: 'wx-main',
      appId: '38991877',
      apiKey: 'FkUy3bQYcqGhyIBVCGqzugks',
      apiSecret: 'iBOrlZ6A5Mpy2V2lYqo1CD65Ux5KPCWb',
    };

    const ret = await this.redis.setData(key, cache, 900);
    return ret;
  }

  async findUserById(uid: number) {
    return this.userService.getUserById(uid);
  }

  async loginWithAccount(dto: ILoginUser): Promise<string | never> {
    // const token = await this.authService.login(dto);

    // const user: ICurrentUser = await this.authService.validToken(token);
    // globalThis.console.log(user);

    return dto.account;
  }

  async validJwtToken(token: string) {
    // return this.authService.validToken(token);
    let payload;
    if (token?.length) {
      payload = await this.authHelper.decryptToken(token);
    }
    return payload;
  }
}
