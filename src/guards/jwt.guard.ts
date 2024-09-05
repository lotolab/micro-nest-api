import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { PublicApiPropertyName } from 'src/decorators';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') implements IAuthGuard {
  constructor(
    private reflector: Reflector,
    private readonly config: ConfigService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | boolean | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride(PublicApiPropertyName, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (this.config.get<string>('server.mode', 'prod') === 'locale')
      return true;

    if (isPublic) return true;

    return super.canActivate(context);
  }
}
