import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatDateTime } from './core/utils';

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService) {}

  health(): string {
    const name = this.config.get<string>('app.name', '');
    return `${name} ${formatDateTime()}\<br\> Hey gay,I am running...!`;
  }
}
