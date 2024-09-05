import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from 'src/core/cache';
import { AuthHelper } from '../service/auth.helper';
import { ICurrentUser, ITokenUser } from 'src/core/interface';
import { convertDiffToSeconds } from 'src/core/utils';
import { AuthService } from '../service/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  protected logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: config.get<string>('jwt.secretKey'),
    });
  }

  /**
   *
   * @param payload
   * @returns
   */
  async validate(payload: JwtAccessPayload) {
    const { id, iat } = payload;
    this.logger.log('>>>>>>>validate>>>>>>', payload);
    const key = AuthHelper.tokenCacheKey(id, iat);
    let tokenUser = await this.redis.getData<ITokenUser>(key);

    const mode = this.config.get<string>('server.mode', 'prod');
    if (!tokenUser && 'locale' !== mode) {
      tokenUser = await this.authService.renewUserToken(payload);
    }

    // TODO DB check
    const { token, ...others } = tokenUser;
    const user: ICurrentUser = { ...others };
    await this.extendExpireIn(key);
    return user;
  }

  private async extendExpireIn(key: string) {
    const ex = this.config.get<string>('jwt.expirein');
    const duration = convertDiffToSeconds(ex);

    await this.redis.setExpires(key, duration);
  }
}
