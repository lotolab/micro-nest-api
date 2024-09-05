import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as chalk from 'chalk';
import helmet from 'helmet';

import { ConfigService } from '@nestjs/config';

import { version, author, name, description } from '../package.json';
import { isDevMode } from './config';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { validationExceptionFactory } from './filters/validators';
import { HttpExceptionFilter } from './filters';

async function bootstrap() {
  const listeners: Array<LotoAppListener> = [];
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appPort = configService.get<number>('server.port', 3000);
  const globalApiPrefix = configService.get<string>('app.prefix', 'v3');
  const SWAGERR_ENABLE = isDevMode();

  //允许跨域请求
  app.enableCors();

  // Web漏洞的
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use((req: { originalUrl: any }, _: any, next: () => void) => {
    console.log(`Got invoked url:'${req.originalUrl}'`);
    next();
  });

  const docTitle = configService.get<string>('app.name', name);
  if (SWAGERR_ENABLE) {
    const docDesc = configService.get<string>('app.docDesc', description);
    const wikiUrl = configService.get<string>(
      'app.wiki',
      'https://blog.lanbery.cc',
    );

    const options = new DocumentBuilder()
      .setTitle(docTitle)
      .setDescription(docDesc)
      .addBearerAuth({ type: 'apiKey', in: 'header', name: 'token' })
      .addTag('api/v3')
      .setVersion(version ?? '3.0.0')
      .setContact(author ?? 'xunyun', wikiUrl, 'service@xunyun-info.com')
      .build();

    const document = await SwaggerModule.createDocument(app, options);
    // console.log(`>>>>>>document url: doc-${globalApiPrefix}`, SWAGERR_ENABLE);
    await SwaggerModule.setup(`doc-${globalApiPrefix}`, app, document);
  }

  await app.setGlobalPrefix(globalApiPrefix, {
    exclude: [
      {
        path: 'health',
        method: RequestMethod.GET,
      },
    ],
  });

  await app.listen(appPort, '0.0.0.0');
  const servUrl = await app.getUrl();

  listeners.push({
    name: 'AppHome',
    url: `${servUrl}/health`,
  });

  if (SWAGERR_ENABLE) {
    listeners.push({
      name: `${docTitle} API`,
      url: `${servUrl}/doc-${globalApiPrefix}`,
    });
  }

  return listeners;
}

bootstrap()
  .then((listeners: Array<LotoAppListener>) => {
    const logger = console.log;

    logger(chalk.magentaBright('🌸🌸🌸🚀🚀🚀🌸🌸🌸'));
    logger(chalk.magentaBright(`乐通任务系统启动完成...\n`));

    listeners.forEach(({ name, url }) => {
      logger(chalk.cyan(`${name}: `, url));
    });

    logger(chalk.magentaBright('🌸🌸🌸🚀🚀🚀🌸🌸🌸'));
  })
  .catch((error: any) => {
    console.error(error);
  });
