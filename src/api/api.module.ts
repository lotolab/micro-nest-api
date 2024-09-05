import { Module } from '@nestjs/common';
import { MockModule } from './test/mock.module';
import { RouterModule } from '@nestjs/core';
import { LotoModuleRoutes } from './module.routes';
import { WxchatController } from './wxchat/wxchat.controller';
import { WxchatService } from './wxchat/wxchat.service';
import { CommModule } from './comm/comm.module';
import { FanwenModule } from './fanwen/fanwen.module';
import { SmartCreationModule } from './smart-creation/smart-creation.module';
import { StreamChatModule } from './stream/stream.chat.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: LotoModuleRoutes.mock.modulePath,
        module: MockModule,
      },
    ]),
    RouterModule.register([
      {
        path: LotoModuleRoutes.comm.modulePath,
        module: CommModule,
      },
    ]),
    RouterModule.register([
      {
        path: LotoModuleRoutes.fanwen.modulePath,
        module: FanwenModule,
      },
    ]),
    RouterModule.register([
      {
        path: LotoModuleRoutes.pc.modulePath,
        module: SmartCreationModule,
      },
    ]),
    RouterModule.register([
      {
        path: LotoModuleRoutes.sse.modulePath,
        module: StreamChatModule,
      },
    ]),
    CommModule,
    MockModule,
    FanwenModule,
    SmartCreationModule,
    StreamChatModule,
  ],
  controllers: [WxchatController],
  providers: [WxchatService],
})
export class ApiModule {}
