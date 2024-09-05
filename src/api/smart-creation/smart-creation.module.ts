import { Module } from '@nestjs/common';
import { SmartCreationController } from './smart-creation.controller';
import { SmartRecordService } from './service/smart.record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmartRecordEntity } from '../entities/smart.record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmartRecordEntity])],
  controllers: [SmartCreationController],
  providers: [SmartRecordService],
})
export class SmartCreationModule {}
