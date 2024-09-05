import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  createTypeOrmOptions(
    _connectionName?: string,
  ): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    console.log(this.configService.get('mysql'));
    const options: TypeOrmModuleOptions = {
      type: 'mysql',
      host: this.configService.get<string>('mysql.host', '127.0.0.1'),
      port: this.configService.get<number>('mysql.port', 3306),
      database: this.configService.get<string>('mysql.database'),
      username: this.configService.get<string>('mysql.username'),
      password: this.configService.get<string>('mysql.password'),
      logging: this.configService.get<boolean>('mysql.logging', false),
      synchronize: true,
      autoLoadEntities: true,
      entities: [__dirname + '/**/*.entity.{ts,js}'],
      timezone: '+08:00', // 东八区
      cache: {
        duration: 60000, // 1分钟的缓存
      },
      extra: {
        // Mysql2 unspport
        // poolMax: 32,
        // poolMin: 16,
        // queueTimeout: 60000,
        // pollPingInterval: 60, // 每隔60秒连接
        // pollTimeout: 60, // 连接有效60秒
      },
    };
    // throw new Error('Method not implemented.');

    return options;
  }
}
