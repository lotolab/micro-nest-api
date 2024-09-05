import { Logger } from '@nestjs/common';
import { WxaiSDKOptions } from './interfaces/wxai.interface';

export class WxaiService {
  private readonly logger = new Logger(WxaiService.name);

  constructor(private readonly options: WxaiSDKOptions = {}) {}
}
