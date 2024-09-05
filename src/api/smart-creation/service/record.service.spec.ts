import { Test, TestingModule } from '@nestjs/testing';
import { SmartRecordService } from './smart.record.service';

describe('RecordService', () => {
  let service: SmartRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmartRecordService],
    }).compile();

    service = module.get<SmartRecordService>(SmartRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
