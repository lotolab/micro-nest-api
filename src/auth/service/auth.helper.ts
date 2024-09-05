import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IJwtConfigSchema } from 'src/config';
import { RedisKeyHelper, RedisService } from 'src/core/cache';
import { ICurrentUser, ITokenUser } from 'src/core/interface';
import { convertDiffToSeconds } from 'src/core/utils';
import { BizCodeEnum, BizException } from 'src/exception';

@Injectable()
export class AuthHelper {
  private readonly jwtOptions: IJwtConfigSchema;

  private readonly jwt: JwtService;

  constructor(
    jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.jwtOptions = this._init();
    this.jwt = jwt;
  }

  get expireIn(): string | number {
    // 1d default stay in sync core module
    return this.jwtOptions?.expirein ?? '1d';
  }

  get exSeconds(): number {
    const expirein = this.jwtOptions?.expirein ?? '1d';
    return convertDiffToSeconds(expirein);
  }

  get secretKey(): string {
    return this.jwtOptions?.secretKey;
  }

  /**
   *
   * @param user
   */
  async createAccessToken(user: ICurrentUser): Promise<string | never> {
    const payload = this.buildJwtPayload(user);

    const token = await this.jwt.sign(payload);

    const key = AuthHelper.tokenCacheKey(user.id, payload.iat ?? 0);
    const tokenCache: ITokenUser = {
      ...user,
      token,
    };

    const duration = this.exSeconds;
    await this.redis.setData(key, tokenCache, duration);

    return token;
  }

  /**
   *
   * @param user
   * @param token
   * @param payload
   * @returns
   */
  async renewToken(
    user: ICurrentUser,
    token: string,
    payload: JwtAccessPayload,
  ): Promise<ITokenUser> {
    const key = AuthHelper.tokenCacheKey(user.id, payload.iat ?? 0);
    const tokenCache: ITokenUser = {
      ...user,
      token,
    };
    const duration = this.exSeconds;
    await this.redis.setData(key, tokenCache, duration);

    return tokenCache;
  }

  async removeAccessToken(token: string) {
    const { id, iat } = await this.decryptToken(token);
    const key = AuthHelper.tokenCacheKey(id, iat);

    return await this.redis.deleteKey(key);
  }

  async verifyToken(token: string): Promise<JwtAccessPayload | never> {
    try {
      const valid = await this.jwt.verify<JwtAccessPayload>(token, {
        issuer: this.jwtOptions.iss,
        secret: this.jwtOptions.secretKey,
        ignoreExpiration: true,
      });
      return valid;
    } catch (e: any) {
      // globalThis.console.log('verifyToken >>>>', e);
      throw BizException.createError(
        BizCodeEnum.FORBIDDEN,
        e?.message ?? 'token invalid.',
      );
    }
  }

  async decryptToken(token: string): Promise<JwtAccessPayload | never> {
    return await this.jwt.decode<JwtAccessPayload>(token);
  }

  private buildJwtPayload(user: ICurrentUser): JwtAccessPayload {
    const { id, username, openid, platform } = user;
    const { version, sub } = this.jwtOptions;
    const now = new Date();

    const payload: JwtAccessPayload = {
      id,
      username,
      platform,
      version,
      state: openid ?? '',
      sub,
      iat: now.valueOf(),
    };

    return payload;
  }

  static tokenCacheKey(uid: number, iat: number): string {
    return RedisKeyHelper.buildJwtTokenCacheKey(uid, iat);
  }

  private _init() {
    const option = this.config.get<IJwtConfigSchema>('jwt', null);
    if (!option || !option.secretKey?.length)
      throw new Error(`Miss jwt config at runtime`);

    const {
      version = '3',
      iss = 'lotolab',
      sub = 'wgts-sso',
      secretKey,
      expirein,
      encryptRounds = 10,
    } = option as unknown as IJwtConfigSchema;

    return {
      version,
      iss,
      sub,
      secretKey,
      expirein,
      encryptRounds,
    };
  }
}
