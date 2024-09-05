import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisClient } from './redis.types';
import { REDIS_CLIENT } from './redis-client.factory';

@Injectable()
export class RedisService implements OnModuleDestroy {
  protected logger = new Logger(RedisService.name);

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: RedisClient,
  ) {}
  onModuleDestroy() {
    this.redis?.quit();
  }

  ping() {
    return this.redis?.ping();
  }

  get redisClient(): RedisClient {
    return this.redis;
  }

  async getValue<T = string | number | undefined>(key: string): Promise<T> {
    const r = await this.redis.get(key);
    return r as unknown as T;
  }

  async setValue(key: string, value: string | number) {
    return await this.redis.set(key, value);
  }

  /**
   *
   * @param key
   * @param value :string|number|boolean
   * @param ex : number ,default -1
   * @returns String|Buffer
   */
  async setExValue(key: string, value: any, ex: number = -1) {
    return this.redis.setEx(key, ex, value);
  }

  async deleteKey(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
    } catch (ex: any) {
      this.logger.error(ex);
    } finally {
      return true;
    }
  }

  async updateExValue(key: string, value: any, ex: number) {
    if (!ex || ex <= 0) {
      throw new Error(`ex require an number more than 0.`);
    }

    const ttl = await this.redis.TTL(key);
    let _ex = ex;
    if (ttl > 0) _ex = (ttl || 0) + ex;

    if (_ex > 0) {
      await this.redis.setEx(key, _ex, value);
    } else {
      await this.redis.del(key);
    }
  }

  async findPattenKeys(pattern: string): Promise<Array<string>> {
    return await this.redis.keys(pattern);
  }

  async getData<T = any>(key: string): Promise<T | never> {
    const data = await this.redis.get(key);
    if (typeof data === 'undefined' || typeof data === 'symbol') {
      return undefined;
    }
    try {
      const ret = JSON.parse(data);
      return ret as unknown as T;
    } catch (_e) {
      return undefined;
    }
  }

  async setData(key: string, data: any, ex: number = -1): Promise<string> {
    if (typeof data !== 'object' || !Object.keys(data)?.length)
      throw new Error(`Here only save Object,Record<string,any> volume.`);

    if (ex > 0) {
      return await this.redis.setEx(key, ex, JSON.stringify(data));
    } else {
      return await this.redis.set(key, JSON.stringify(data));
    }
  }

  async updateSomeDataByKey(key: string, some: any, ex: number = -1) {
    if (ex !== -1 && ex <= 0) throw new Error(`ex required >0 or -1.`);
    const old = await this.redis.get(key);

    let oldData: Record<string, any> = {};
    if (old?.length) {
      try {
        oldData = JSON.parse(old);
      } catch (_e) {}
    }
    // if (!Object.keys(oldData)?.length) throw new Error(`缓存不存在`);

    oldData = Object.assign(oldData, some);
    if (ex === -1) {
      await this.redis.set(key, JSON.stringify(oldData));
    } else {
      const ttl = await this.redis.ttl(key);
      if (ttl > 0) {
        await this.redis.setEx(key, ttl + ex, JSON.stringify(oldData));
      } else {
        await this.redis.setEx(key, ex, JSON.stringify(oldData));
      }
    }

    return oldData;
  }

  async updateSomeDataByKeyNodelay(key: string, some: any, ex: number = -1) {
    if (ex !== -1 && ex <= 0) throw new Error(`ex required >0 or -1.`);
    const old = await this.redis.get(key);

    let oldData: Record<string, any> = {};
    if (old?.length) {
      try {
        oldData = JSON.parse(old);
      } catch (_e) {}
    }
    // if (!Object.keys(oldData)?.length) throw new Error(`缓存不存在`);

    oldData = Object.assign(oldData, some);
    if (ex === -1) {
      await this.redis.set(key, JSON.stringify(oldData));
    } else {
      await this.redis.setEx(key, ex, JSON.stringify(oldData));
    }

    return oldData;
  }

  async hasKey(key: string, safity?: boolean) {
    const b = await this.redis.exists(key);
    if (!safity) return !!b;
    const v = await this.redis.get(key);
    return v && !!b;
  }

  /**
   * 获取剩余过期时间(秒)
   * -1 代表永不过期
   * -2 代表数据不存在
   * @param key string
   * @returns number
   */
  async getExpiredSeconds(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }

  async setExpires(key: string, ex: number): Promise<boolean | never> {
    return await this.redis.expire(key, ex);
  }
}
