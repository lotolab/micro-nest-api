import { Test, TestingModule } from '@nestjs/testing';
import { SmartCreationController } from './smart-creation.controller';

describe('SmartCreationController', () => {
  let controller: SmartCreationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmartCreationController],
    }).compile();

    controller = module.get<SmartCreationController>(SmartCreationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
