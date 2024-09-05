import { Test, TestingModule } from '@nestjs/testing';
import { WxchatController } from './wxchat.controller';

describe('WxchatController', () => {
  let controller: WxchatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WxchatController],
    }).compile();

    controller = module.get<WxchatController>(WxchatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
