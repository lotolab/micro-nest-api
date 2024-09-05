import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { AuthHelper } from './auth.helper';
import { ToolsService, UserService } from 'src/core';
import { ICurrentUser, ILoginUser, ITokenUser } from 'src/core/interface';
import { AccountTypeEnum, StatusEnum } from 'src/core/enums';
import { BizCodeEnum, BizException } from 'src/exception';

@Injectable()
export class AuthService {
  protected logger = new Logger(AuthService.name);

  constructor(
    private readonly authHelper: AuthHelper,
    private readonly userService: UserService,
    private readonly tools: ToolsService,
  ) {}

  async signin(loginDto: ILoginUser) {
    const { account, accountType = AccountTypeEnum.USER, password } = loginDto;
    const entity = await this.userService.findUserEntity(account, accountType);
    if (!entity) throw new ForbiddenException(`Account ${account} not found.`);

    if (entity.status === StatusEnum.FORBIDDEN.valueOf())
      throw new ForbiddenException(`账号被禁用`);
    const enpassword = entity.password;
    if (!enpassword?.length)
      throw BizException.createError(
        BizCodeEnum.UNSET_PW_FORBIDDEN,
        `密码未设置，请通过其他方式登录`,
      );
    const b = await this.tools.validPassword(password, enpassword);
    if (!b) throw BizException.createError(BizCodeEnum.FORBIDDEN, `密码错误`);

    const user: ICurrentUser = UserService.convertEntityToICurrentUser(entity);

    const token = await this.authHelper.createAccessToken(user);

    return token;
  }

  /**
   * TODO unimplement
   * @param payload
   */
  async renewUserToken(payload: JwtAccessPayload): Promise<ITokenUser | never> {
    const { id, username } = payload;
    const entity = await this.userService.getUserById(id);
    if (!entity) throw new ForbiddenException(`Account ${username} not found.`);

    if (entity.status === StatusEnum.FORBIDDEN.valueOf())
      throw new ForbiddenException(`账号被禁用`);

    const user: ICurrentUser = UserService.convertEntityToICurrentUser(entity);

    // token where get
    return await this.authHelper.renewToken(user, '', payload);
  }

  async logout(token: string): Promise<boolean> {
    try {
      await this.authHelper.removeAccessToken(token);
    } catch (e: any) {
      this.logger.error(`Logout error ${e?.message}`);
    } finally {
      return true;
    }
  }

  async createToken() {}

  async createRefreshToken() {}

  async validateUser() {}
}
