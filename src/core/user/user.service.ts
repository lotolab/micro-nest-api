import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities';
import { IsNull, Repository } from 'typeorm';
import { AccountTypeEnum } from '../enums';
import { BizCodeEnum, BizException } from 'src/exception';
import { isPhone } from '../utils';
import { isEmail } from 'class-validator';
import { ICurrentUser, UserInfoType } from '../interface';

@Injectable()
export class UserService {
  protected logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   *
   * @param uid number
   * @returns UserEntity or null
   */
  async getUserById(uid: number): Promise<UserEntity | null> {
    const user: UserEntity = await this.userRepository.findOne({
      where: {
        id: uid,
      },
      relations: ['profile'],
    });

    return user ?? null;
  }

  /**
   *
   * @param account
   * @param accountType
   * @returns {UserInfoType}
   */
  async findUserInfo(
    account: string,
    accountType?: AccountTypeEnum,
  ): Promise<UserInfoType | never> {
    const entity = await this.findUserEntity(account, accountType);
    return UserService.convertEntityToUserInfo(entity);
  }

  /**
   *
   * @param account
   * @param accountType
   * @returns UserEntity or null
   */
  public async findUserEntity(
    account: string,
    accountType: AccountTypeEnum = AccountTypeEnum.USER,
  ): Promise<UserEntity | null> {
    if (!account?.length) {
      throw BizException.createError(
        BizCodeEnum.ILLEGAL_ARGS,
        `account 参数非法`,
      );
    }

    let user: UserEntity;

    if (isPhone(account)) {
      user = await this.userRepository.findOne({
        where: {
          type: accountType,
          mobile: account,
          deletedAt: IsNull(),
        },
        relations: ['profile'],
        select: [
          'id',
          'username',
          'mobile',
          'email',
          'avatar',
          'type',
          'status',
          'platform',
          'isSuper',
          'createdBy',
          'updatedBy',
          'createdAt',
          'updatedAt',
          'deletedAt',
          'password',
          'unionid',
          'openid',
        ],
      });

      if (user) return user;
    }

    if (isEmail(account)) {
      this.userRepository.findOne({
        where: {
          type: accountType,
          email: account,
          deletedAt: IsNull(),
        },
        relations: ['profile'],
        select: [
          'id',
          'username',
          'mobile',
          'email',
          'avatar',
          'type',
          'status',
          'platform',
          'isSuper',
          'createdBy',
          'updatedBy',
          'createdAt',
          'updatedAt',
          'deletedAt',
          'password',
          'unionid',
          'openid',
        ],
      });

      if (user) return user;

      user = await this.userRepository.findOne({
        where: {
          type: accountType,
          email: account,
          deletedAt: IsNull(),
        },
        relations: ['profile'],
        select: [
          'id',
          'username',
          'mobile',
          'email',
          'avatar',
          'type',
          'status',
          'platform',
          'isSuper',
          'createdBy',
          'updatedBy',
          'createdAt',
          'updatedAt',
          'deletedAt',
          'password',
          'unionid',
          'openid',
        ],
      });

      return user ?? null;
    }
  }

  static convertEntityToUserInfo(
    entity: UserEntity,
  ): UserInfoType | null | never {
    if (!entity) return entity;

    const {
      id,
      username,
      mobile,
      email,
      status,
      type,
      platform,
      isSuper,
      avatar,
      profile: { gender, age, wechat, wechatUid, wechatOpenid },
      deletedAt,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
    } = entity;

    const user: UserInfoType = {
      id,
      username,
      mobile,
      email,
      avatar,
      status,
      type,
      platform,
      isSuper,
      gender,
      age,
      wechat,
      wechatUid,
      wechatOpenid,
      deletedAt,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
    };

    return user;
  }

  static convertEntityToICurrentUser(
    entity: UserEntity,
    roles?: Array<string>,
  ): ICurrentUser {
    if (!entity) throw new Error(`Parameter entity illegal.`);
    const {
      id,
      username,
      mobile,
      email,
      openid,
      status,
      platform,
      isSuper,
      type,
      avatar,
      profile: { name, nickname },
    } = entity;

    const user: ICurrentUser = {
      id,
      username,
      mobile,
      email,
      openid,
      status,
      platform,
      isSuper,
      type,
      avatar,
      name,
      nickname,
      roles,
    };

    return user;
  }
}
