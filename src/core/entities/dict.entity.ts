import { Column, Entity, Index, OneToMany, Unique } from 'typeorm';
import { StatusEnum } from '../enums';
import CommonEntity from './common.entity';
import { SysDictItemEntity } from './dict.item.entity';
import { Transform, Type } from 'class-transformer';

@Entity({
  name: 'sys_dict',
})
@Unique('uq_name_code', ['name', 'code'])
export class SysDictEntity extends CommonEntity {
  @Index()
  @Column({
    name: 'name',
    type: 'varchar',
    length: 64,
    nullable: false,
    comment: 'Dict name require not null',
  })
  name: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: 'Dict code require not null',
  })
  code: string;

  @Column({
    name: 'tag',
    type: 'varchar',
    length: 64,
    nullable: true,
    default: '',
    comment: 'Dict group',
  })
  tag: string;

  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    type: 'int',
    nullable: true,
    default: 0,
    name: 'sortno',
    comment: 'record sort number',
  })
  sortno: number;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    name: 'icon',
    comment: 'Record icon',
  })
  icon: string;

  @Column({
    type: 'tinyint',
    nullable: true,
    default: 1,
    name: 'status',
    comment: 'status,0-forbidden,1-normal',
  })
  status: StatusEnum;

  @OneToMany(() => SysDictItemEntity, (e) => e.dict)
  items: Array<SysDictItemEntity>;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    name: 'remark',
    comment: 'Record remark',
  })
  remark: string;
}
