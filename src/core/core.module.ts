import { Global, Module } from '@nestjs/common';
import { RedisService } from './cache/redis/redis.service';
import { RedisFactory } from './cache/redis/redis-client.factory';
import { UserService } from './user/user.service';
import {
  DictManagementService,
  DictOptionsService,
  RegionConvertService,
  RegionService,
  ToolsService,
} from './export.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SysDictEntity,
  SysDictItemEntity,
  SystemRegionEntity,
  UserEntity,
  UserProfileEntity,
} from './entities';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Agent } from 'https';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
      SysDictEntity,
      SysDictItemEntity,
      SystemRegionEntity,
    ]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          timeout: config.get<number>('axios.httpTimeout', 5000),
          maxRedirects: config.get<number>('axios.maxRedirects', 5),
          httpsAgent: new Agent({ rejectUnauthorized: false }),
          httpAgent: new Agent({ rejectUnauthorized: false }),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    DictManagementService,
    DictOptionsService,
    RedisFactory,
    RedisService,
    ToolsService,
    UserService,
    RegionService,
    RegionConvertService,
  ],
  exports: [
    DictManagementService,
    DictOptionsService,
    HttpModule,
    RedisService,
    ToolsService,
    UserService,
    RegionService,
    RegionConvertService,
  ],
})
export class CoreModule {}
