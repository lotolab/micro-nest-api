import { Test, TestingModule } from '@nestjs/testing';
import { WxchatService } from './wxchat.service';

describe('WxchatService', () => {
  let service: WxchatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WxchatService],
    }).compile();

    service = module.get<WxchatService>(WxchatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
