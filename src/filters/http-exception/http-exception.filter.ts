import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { BizException, ValidationException } from 'src/exception';
import { getClientIp } from '@supercharge/request-ip';

const CONTENT_TYPE_HEADER = 'application/json; charset=utf-8';

export const getStatusCode = <T>(exception: T): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

@Catch(
  HttpException,
  BizException,
  BadRequestException,
  UnauthorizedException,
  ValidationException,
)
export class HttpExceptionFilter<T> implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: T, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();

    const response = ctx.getResponse();
    globalThis.console.log('eee&&>>>', ctx.getResponse);
    this.logger.log('error>>>', ctx.getRequest, response.getHeaders());

    const status = getStatusCode(exception);

    globalThis.console.log('eee&&>status>>', status);

    if (status || exception) this.log(ctx, exception);

    globalThis.console.log(
      'eee&&>>>',
      typeof exception,
      (exception as unknown as Error)?.name,
    );

    if (exception instanceof BizException) {
      const bizerr = exception as BizException;

      const data: LotoResponseType = {
        code: bizerr.code,
        message: bizerr.message,
        error: bizerr.error,
      };

      response.status(HttpStatus.OK);
      response.header('Content-type', CONTENT_TYPE_HEADER);
      response.send(data);
    } else if (exception instanceof ValidationException) {
      const ex = exception as ValidationException;
      const res = ex.getResponse();

      response.header('Content-type', CONTENT_TYPE_HEADER);
      response.status(HttpStatus.BAD_REQUEST);
      response.send(res);
    } else if (exception instanceof UnauthorizedException) {
      const message = (exception as UnauthorizedException).message;
      response.header('Content-type', CONTENT_TYPE_HEADER);
      response.status(status);
      response.send({
        code: status,
        message: message,
      });
    } else {
      const statusCode = status || response?.statusCode;
      response.status(statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
      response.header('Content-type', CONTENT_TYPE_HEADER);
      response.send({
        code: statusCode,
        message: (exception as Error).message,
      });
    }
  }

  private log(ctx: HttpArgumentsHost, exception: T) {
    const { user, ip, originalUrl } = ctx.getRequest();
    let url = originalUrl as string;
    url = url?.indexOf('?') > 0 ? url.substring(0, url.indexOf('?')) : url;

    const realIp = getClientIp(ctx.getRequest()) ?? ip;
    this.logger.log(
      `${user?.username} [IP: ${realIp}] visit [${url}] error.`,
      exception,
    );
  }
}
