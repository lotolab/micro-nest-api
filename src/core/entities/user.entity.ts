import { Column, Entity, Index, JoinColumn, OneToOne, Unique } from 'typeorm';
import CommonEntity from './common.entity';
import { Exclude, Transform, Type } from 'class-transformer';
import { AccountTypeEnum, PlatformEnum, UserStatusEnum } from '../enums';
import { UserProfileEntity } from './user.profile.entity';

@Entity('sys_account')
@Unique('uq_username_type', ['username', 'type'])
@Unique('uq_mobile_type', ['mobile', 'type'])
export class UserEntity extends CommonEntity {
  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    name: 'username',
    comment: 'Username',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 15,
    nullable: true,
    name: 'mobile',
    comment: 'phone number',
  })
  mobile: string;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 256,
    select: false,
    name: 'password',
    comment: 'password',
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 128,
    name: 'email',
    comment: 'email address',
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    name: 'avatar',
    comment: 'user avatar image',
  })
  avatar: string;

  @Column({
    type: 'tinyint',
    nullable: false,
    default: 3,
    name: 'type',
    comment: 'account type: 1-system,2-admin,3-client',
  })
  type: AccountTypeEnum;

  @Column({
    type: 'tinyint',
    nullable: true,
    default: 1,
    name: 'status',
    comment: 'status,0-unavailable,1-new registed,2-available',
  })
  status: UserStatusEnum;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
    name: 'platform',
    comment: 'platform,0-guest,999-system,2-merchant,3-farmer',
  })
  platform: PlatformEnum;

  @Column({
    type: 'tinyint',
    default: 0,
    width: 1,
    name: 'is_super',
    comment: 'Is super adminstrator,0-not,1-yes',
  })
  @Type(() => Boolean)
  @Transform(({ value }) => Boolean(value))
  isSuper: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'openid',
    comment: 'Wx Openid',
  })
  openid: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'unionid',
    comment: 'Wechat Unionid',
  })
  unionid: string;

  @OneToOne(() => UserProfileEntity)
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  profile: UserProfileEntity;
}
