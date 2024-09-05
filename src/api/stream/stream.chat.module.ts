import { Module } from '@nestjs/common';

import { WxMobChatController } from './wxai/wx-mob-chat.controller';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Agent } from 'https';
import { WxaiStreamService } from './wxai/services/wxai-stream.service';
import { WxaiPcChatController } from './wxai/wxai-pc-chat.controller';
import { SsePcWrapService } from './wxai/services/sse-pc-wrap.service';
import { WxaiStreamFactory } from './wxai/services/wxai-stream-factory';
import { PromptCachedService } from './services/prompt-cached.service';
import { ChatLoggingService } from './services/chat-logging.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRecordV3Entity } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRecordV3Entity]),
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
  controllers: [WxMobChatController, WxaiPcChatController],
  providers: [
    WxaiStreamFactory,
    WxaiStreamService,
    SsePcWrapService,
    PromptCachedService,
    ChatLoggingService,
  ],
})
export class StreamChatModule {}
