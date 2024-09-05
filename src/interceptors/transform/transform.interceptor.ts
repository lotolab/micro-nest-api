import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { instanceToPlain } from 'class-transformer';

import {
  IgnoreTransformPropertyName,
  // OAUTH_REDIRECT_METADATA,
  // OauthRedirect,
} from 'src/decorators';
import { Reflector } from '@nestjs/core';
// import { REDIRECT_METADATA } from '@nestjs/common/constants';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  protected readonly logger = new Logger(TransformInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // TODO push IP visit message

    // TODO checkLimit

    const ignored = context.getHandler()[IgnoreTransformPropertyName];
    // const hasRedirect = context.getHandler()[OAUTH_REDIRECT_METADATA];
    // const hr = context.getType();
    // console.log(
    //   '>>hasRedirect>>>',
    //   hr,
    //   ignored,
    //   hasRedirect,
    //   this.reflector.getAll(OauthRedirect, [context.getHandler()]),
    // );

    return ignored
      ? next.handle()
      : next.handle().pipe(
          map((data: any): LotoResponseType => {
            return {
              code: HttpStatus.OK,
              message: 'Success',
              result: instanceToPlain(data),
            };
          }),
        );
  }
}
