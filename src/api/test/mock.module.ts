import { Module } from '@nestjs/common';
import { CacheTestController } from './cache.test.controller';
import { CacheTestService } from './cache.test.service';

@Module({
  imports: [],
  controllers: [CacheTestController],
  providers: [CacheTestService],
})
export class MockModule {}
