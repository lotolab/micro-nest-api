import { CommonEntity } from 'src/core/entities';
import { Column, Entity, Index } from 'typeorm';

@Entity({
  name: 'ai_smart_record',
})
export class SmartRecordEntity extends CommonEntity {
  @Index()
  @Column({
    name: 'tid',
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: '唯一ID',
  })
  tid: string;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'title',
  })
  title: string;

  @Column({
    name: 'content',
    type: 'longtext',
    nullable: true,
    comment: 'content',
  })
  content: string;

  @Column({
    name: 'uid',
    type: 'int',
    nullable: false,
    comment: 'uid',
  })
  uid: number;

  @Column({
    name: 'uname',
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: 'uname',
  })
  uname: string;

  @Column({
    type: 'longtext',
    name: 'extra',
    nullable: true,
    default: null,
    comment: '存储JSON',
  })
  extra: string;
}
