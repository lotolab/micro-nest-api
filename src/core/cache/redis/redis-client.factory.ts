import { FactoryProvider } from '@nestjs/common';
import { RedisClient } from './redis.types';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const RedisFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async (config: ConfigService) => {
    const redisConfig = config.get<CacheRedisConfigSchema>('cache.redis');

    const { host = '127.0.0.1', port = 6379, db = 0, passport } = redisConfig;
    const client = createClient({
      url: `redis://${host}:${port}/${db}`,
      password: passport,
    });

    await client.connect();
    return client;
  },
  inject: [ConfigService],
};
