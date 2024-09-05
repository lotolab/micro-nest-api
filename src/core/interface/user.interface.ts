import { AccountTypeEnum } from '../enums';
import { BaseColumnsType } from './base.columns.interface';

export type BaseAccountType = {
  id?: number;
  username: string;
  mobile?: string;
  email?: string;
  type?: AccountTypeEnum;
  status?: number;
  isSuper?: boolean;
  platform?: number;
  openid?: string;
};

export type UserInfoType = BaseAccountType & {
  nickname?: string;
  name?: string;
  avatar?: string;
  wechat?: string;
  wechatUid?: string;
  gender?: number;
  age?: number;
  wechatOpenid?: string;
} & BaseColumnsType;

export interface ICurrentUser {
  id: number;
  username: string;
  mobile?: string;
  email?: string;
  openid?: string;
  status?: number;
  platform?: number;
  isSuper?: boolean;
  type?: AccountTypeEnum;
  avatar?: string;
  nickname?: string;
  name?: string;
  roles?: Array<string> | undefined;
}

export interface ILoginUser {
  id?: number;
  account?: string;
  password?: string;
  openid?: string;
  accountType?: AccountTypeEnum;
}

/**
 *
 */
export interface ITokenUser extends ICurrentUser {
  token: string;
}
