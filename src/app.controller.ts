import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IgnoreTransformApi, PublicApi } from './decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @IgnoreTransformApi()
  @PublicApi()
  @Get(['', 'health'])
  getHello(): string {
    return this.appService.health();
  }
}
