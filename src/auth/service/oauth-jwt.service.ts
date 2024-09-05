import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { ToolsService } from 'src/core';
import { RedisService } from 'src/core/cache';
import { ICurrentUser } from 'src/core/interface';
import { formatDateTime, isCallbackUrl } from 'src/core/utils';
import * as fs from 'fs';
import * as path from 'path';
import {
  decimalToHex,
  hex2Dec,
  hexToDecimalString,
} from 'src/core/utils/strings/hex.util';
import { BizCodeEnum, BizException } from 'src/exception';

const defaultOption: Record<string, any> = {
  alg: 'HS256',
  iss: 'lotolab',
  expirein: 30 * 60 * 1000,
};

const NEED_PRIVATE_FILE_ALGS = ['ES256', 'ES384', 'ES512'];
const SUPPORT_ALGS = NEED_PRIVATE_FILE_ALGS.concat(['HS256', 'HS384', 'HS512']);
/**
 *
 */
@Injectable()
export class OauthJwtService {
  private logger = new Logger(OauthJwtService.name);
  private oauths: Array<OAuth2JwtConfigOption>;
  constructor(
    private readonly config: ConfigService,
    private jwt: JwtService,
    private readonly redis: RedisService,
    private readonly tools: ToolsService,
  ) {
    this.oauths = this.config.get<Array<OAuth2JwtConfigOption>>('oauth', []);
  }

  public getOAuthJwtConfigs() {
    const configs = this.config.get<Array<OAuth2JwtConfigOption>>('oauth', []);
    return configs;
  }

  async checkWhitelist(appid: string, ip: string) {
    if (!/^\d+$/.test(appid))
      throw BizException.createError(
        BizCodeEnum.PARAMS_INVALID,
        `Appid ${appid} 参数格式非法.`,
      );
    const cfg = this.oauths.find(
      (it) => it.appid === appid || it.appid.toString() === appid,
    );

    if (!cfg)
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_UNSET,
        `OAuth appid :${appid} 无效`,
      );
    const { whitelist = [] } = cfg;

    const find = whitelist.find((it) => it === ip);
    if (!find)
      throw BizException.createError(
        BizCodeEnum.NO_PERMISSION,
        `当前${ip} 没有权限，请联系技术人员开通OAuth2.0 服务.`,
      );

    return true;
  }

  async signOauth2Token(
    user: ICurrentUser,
    ip: string,
    appid: string,
    state: string,
  ) {
    const { alg, priFilename } = await this.getOauth2BaseConfig(appid);
    let jwtOptions = await this.getOauth2Config(appid);

    if (NEED_PRIVATE_FILE_ALGS.includes(alg)) {
      const privateKey = await this.readPrivateKey(priFilename);
      jwtOptions = { ...jwtOptions, privateKey, secret: privateKey };
    }

    const payload = await this.buildOauth2JwtPayload(user, ip, state);

    // log
    // this.logger.log(jwtOptions);
    const token = await this.jwt.sign(payload, jwtOptions as JwtSignOptions);

    const v = await this.jwt.verify<OAuth2AccessPayload>(token, jwtOptions);

    // this.logger.log(v);
    if (v?.exp) {
      const expDate = formatDateTime(new Date(v.exp));
      const iatDate = formatDateTime(new Date(v.iat));
      this.logger.log(`iat: ${iatDate} - ${expDate}`);
    }
    return token;
  }

  async signOauth2Callback(
    user: ICurrentUser,
    ip: string,
    appid: string,
    state?: string,
  ) {
    const base = await this.buildCallbackUrl(appid);
    try {
      const { alg, priFilename } = await this.getOauth2BaseConfig(appid);

      let jwtOptions = await this.getOauth2Config(appid);

      if (NEED_PRIVATE_FILE_ALGS.includes(alg)) {
        const privateKey = await this.readPrivateKey(priFilename);
        jwtOptions = { ...jwtOptions, privateKey };
      }

      const payload = await this.buildOauth2JwtPayload(user, ip, state);
      this.logger.log(jwtOptions);
      const token = await this.jwt.sign(payload, jwtOptions as JwtSignOptions);
      return `${base}?token=${token}&state=${state || ''}`;
    } catch (e: any) {
      const errorid = await this.tools.genNanoid(32);
      this.logger.error(`${appid}-${errorid}`, e);
      return `oauth_error?errorid=${errorid}&error=${e.message}`;
    }
  }

  async decodeJwt(
    token: string,
    appid: string,
    complete?: boolean,
  ): Promise<OAuth2AccessPayload | OAuth2DecodeCompleteType | never> {
    const { alg, pubFilename } = await this.getOauth2BaseConfig(appid);
    let decodeOptions = await this.getOauth2Config(appid);

    if (NEED_PRIVATE_FILE_ALGS.includes(alg)) {
      const publicKey = await this.readPublicKey(pubFilename);

      decodeOptions = {
        ...decodeOptions,
        publicKey,
        secret: publicKey,
        complete,
      };
    }

    const res = await this.jwt.decode(token, decodeOptions as any);

    return res;
  }

  async verifyOauth2Token(
    token: string,
    appid: string,
  ): Promise<OAuth2AccessPayload | never> {
    try {
      const { alg, pubFilename } = await this.getOauth2BaseConfig(appid);
      let jwtOptions = await this.getOauth2Config(appid);

      if (NEED_PRIVATE_FILE_ALGS.includes(alg)) {
        const publicKey = await this.readPublicKey(pubFilename);

        jwtOptions = {
          ...jwtOptions,
          publicKey,
          secret: publicKey,
          complete: false,
        };
      }
      this.logger.log(jwtOptions, appid);
      const payload = await this.jwt.verify<OAuth2AccessPayload>(
        token,
        jwtOptions as JwtVerifyOptions,
      );

      if (payload && payload?.aud?.length) {
        const deappid = hex2Dec(payload.aud);
        const hexid = decimalToHex(appid);
        this.logger.log(
          `calc ${deappid}-${appid}`,
          payload.aud,
          hexToDecimalString(appid),
          hexid,
          hex2Dec(hexid),
        );
        if (deappid === appid.toString()) return payload;
      }
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_VERIFY_AUD_FAIL,
        `疑似伪造aud ${payload.aud}`,
      );
    } catch (e: any) {
      this.logger.error(`Verify OAuthor: ${appid} error:`, e);
      if (e instanceof BizException) throw e;
      throw BizException.createError(
        BizCodeEnum.OAUTH_TOKEN_INVALID,
        e.message ?? 'Token 无效',
      );
    }
  }

  private async buildOauth2JwtPayload(
    user: ICurrentUser,
    ip: string,
    state?: string,
  ) {
    const { id, username, avatar, mobile } = user;
    const cid =
      mobile?.length && mobile.length > 4
        ? `${mobile.slice(-4)}${id}`
        : id.toString();
    const jti = await this.tools.createJti();
    const payload: OAuth2AccessPayload = {
      jti,
      iat: new Date().valueOf(),
      username,
      ip,
      cid: cid,
      avatar,
      nonce: state,
    };

    return payload;
  }

  private async getOauth2BaseConfig(
    appid: string,
  ): Promise<OAuth2JwtBaseConfigOption | never> {
    if (!/^\d+$/.test(appid))
      throw BizException.createError(
        BizCodeEnum.PARAMS_INVALID,
        `Appid ${appid} 参数格式非法.`,
      );
    const cfg = this.oauths.find(
      (it) => it.appid === appid || it.appid.toString() === appid,
    );
    if (!cfg)
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_UNSET,
        `OAuth appid :${appid} 无效`,
      );

    const {
      alg = defaultOption.alg,
      secretKey,
      priFilename = '',
      pubFilename = '',
    } = cfg;

    if (!SUPPORT_ALGS.includes(alg))
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_ALGORITHM_UNSUPPORT,
        `JWT 当前不支持${alg}`,
      );

    return {
      alg,
      secretKey,
      priFilename,
      pubFilename,
    } as OAuth2JwtBaseConfigOption;
  }

  private async getOauth2Config(
    appid: string,
  ): Promise<JwtSignOptions | JwtVerifyOptions | never> {
    if (!/^\d+$/.test(appid))
      throw BizException.createError(
        BizCodeEnum.PARAMS_INVALID,
        `Appid ${appid} 参数格式非法.`,
      );
    const cfg = this.oauths.find(
      (it) => it.appid === appid || it.appid.toString() === appid,
    );
    if (!cfg)
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_UNSET,
        `OAuth appid :${appid} 无效`,
      );
    const { secretKey, expirein, alg, iss = defaultOption.iss } = cfg;
    if (!secretKey?.length)
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_UNSET_SECRETKEY,
        `OAuth ${appid} unset secret-key.`,
      );

    // const audience = appid.toString(); //decimalToHex(appid);
    const audience = decimalToHex(appid);
    this.logger.log(
      `Log: ${appid}, ${audience}, ${hexToDecimalString(audience)}`,
    );
    const jwtOpts: JwtSignOptions = {
      algorithm: alg ?? defaultOption.alg,
      secret: secretKey,
      issuer: iss,
      expiresIn: expirein ?? defaultOption.expirein,
      audience,
    };

    return jwtOpts;
  }

  private async buildCallbackUrl(appid: string) {
    if (!/^\d+$/.test(appid))
      throw BizException.createError(
        BizCodeEnum.PARAMS_INVALID,
        `Appid ${appid} 参数格式非法.`,
      );
    const cfg = this.oauths.find(
      (it) => it.appid === appid || it.appid.toString() === appid,
    );
    if (!cfg)
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_UNSET,
        `OAuth appid :${appid} 无效`,
      );

    const { redirectUrl } = cfg;
    if (!redirectUrl?.length || !isCallbackUrl(redirectUrl))
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_UNSET,
        `未设置回调URL或设置不正确${redirectUrl}`,
      );

    const base = redirectUrl?.endsWith('/')
      ? redirectUrl.substring(0, redirectUrl.length - 1)
      : redirectUrl;

    return base;
  }

  private async readPrivateKey(priFilename: string): Promise<string | never> {
    if (!priFilename?.length)
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_UNSET,
        `Unset private file`,
      );

    const priFile = path.resolve(process.cwd(), priFilename);
    if (!fs.existsSync(priFile) || fs.statSync(priFile).isDirectory())
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_FILE_INVALID,
        `JWT ${priFilename} 配置文件不存在`,
      );
    const prevateKey = fs.readFileSync(priFile, { encoding: 'utf8' });
    if (!prevateKey?.length)
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_FILE_INVALID,
        `JWT 配置 ${priFilename}内容格式不正确`,
      );

    return prevateKey;
  }

  private async readPublicKey(pubFilename: string): Promise<string | never> {
    if (!pubFilename?.length)
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_UNSET,
        `Unset private file`,
      );

    const pubFile = path.resolve(process.cwd(), pubFilename);
    if (!fs.existsSync(pubFile) || fs.statSync(pubFile).isDirectory())
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_FILE_INVALID,
        `JWT ${pubFilename} 配置文件不存在`,
      );
    const publicKey = fs.readFileSync(pubFile, { encoding: 'utf8' });
    if (!publicKey?.length)
      throw BizException.createError(
        BizCodeEnum.OAUTH_CONFIG_FILE_INVALID,
        `JWT 配置 ${pubFilename}内容格式不正确`,
      );

    return publicKey;
  }
}
