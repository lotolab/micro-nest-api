import { Column, Entity } from 'typeorm';
import CommonEntity from './common.entity';
import { GenderEnum } from '../enums';

@Entity('sys_user_profile')
export class UserProfileEntity extends CommonEntity {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'nickname',
    comment: 'Nickname',
  })
  nickname: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'name',
    comment: 'real name',
  })
  name: string;

  @Column({
    type: 'tinyint',
    nullable: true,
    default: 0,
    name: 'gender',
    comment: 'gender,0-unknow,1-male,2-female',
  })
  gender: GenderEnum;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
    name: 'age',
    comment: 'age',
  })
  age: number;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'wechat',
    comment: 'wechat name',
  })
  wechat?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'wechat_uid',
    comment: 'Wechat unionid',
  })
  wechatUid?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'wechat_openid',
    comment: 'Wechat openid',
  })
  wechatOpenid?: string;
}
