import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class CommonEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: 'Primary key ID',
  })
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  id: number;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
    name: 'created_by',
    comment: 'record created by',
  })
  @Type(() => Number)
  createdBy?: number;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
    name: 'updated_by',
    comment: 'record updated by',
  })
  @Type(() => Number)
  updatedBy?: number;

  @Transform((row: TransformFnParams) => +new Date(row.value))
  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'created_at',
    comment: 'record create time',
  })
  createdAt: Date;

  @Transform((row: TransformFnParams) => +new Date(row.value))
  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'updated_at',
    comment: 'record last update time',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'deleted_at',
    comment: 'Logic delete sign',
  })
  deletedAt?: Date;
}

export default CommonEntity;
