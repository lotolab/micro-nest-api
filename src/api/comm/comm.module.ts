import { Module } from '@nestjs/common';
import { RegionController } from './controller/region.controller';
import { DictOptionsController } from './controller/dict.options.controller';

@Module({
  imports: [],
  controllers: [DictOptionsController, RegionController],
  providers: [],
})
export class CommModule {}
