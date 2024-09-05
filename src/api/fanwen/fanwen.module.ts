import { Module } from '@nestjs/common';
import { FanwenAPIService } from './service/fanwen.api.service';
import { CityTreeController } from './controller/city.tree.controller';
import { FanwenAPIClientFactory } from './client/client.factory';
import { FwSearcherController } from './controller/searcher.controller';

@Module({
  imports: [],
  controllers: [CityTreeController, FwSearcherController],
  providers: [FanwenAPIService, FanwenAPIClientFactory],
  exports: [FanwenAPIService],
})
export class FanwenModule {}
