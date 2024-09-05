import { Transform, Type } from 'class-transformer';
import { CommonEntity } from 'src/core/entities';
import { Column, Entity, Index } from 'typeorm';

/**
 * SSETaskQueueCacheData
 */
@Entity({
  name: 'ai_chat_record',
  comment: 'AI chat V3 record',
})
export class ChatRecordV3Entity extends CommonEntity {
  @Index()
  @Column({
    name: 'reqid',
    type: 'varchar',
    length: 50,
    nullable: false,
    default: '',
    comment: 'reqid',
  })
  reqid: string;

  @Column({
    name: 'prompt',
    type: 'longtext',
    nullable: false,
    default: null,
    comment: 'injected prompt engineering text',
  })
  prompt: string; // injected prompt engineering text

  @Column({
    name: 'aiopts',
    type: 'longtext',
    nullable: true,
    default: null,
    comment: 'aiopts json',
  })
  aiopts: string;

  @Column({
    name: 'result',
    type: 'longtext',
    nullable: true,
    default: null,
    comment: 'ai response content string or error string',
  })
  result: string; // ai response text or error text

  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    name: 'uuid',
    type: 'int',
    nullable: true,
    comment: 'prompt engineering template uuid',
  })
  uuid: number; // prompt engineering uudi,can null

  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    name: 'uid',
    type: 'int',
    nullable: true,
    comment: 'user id',
  })
  uid: number;

  @Column({
    name: 'username',
    length: 50,
    type: 'varchar',
    nullable: true,
    default: '',
    comment: 'user name',
  })
  username: string;

  @Column({
    name: 'cost_time',
    length: 100,
    type: 'varchar',
    nullable: true,
    default: '',
    comment: 'request cost time description',
  })
  costTime?: string;

  @Column({
    name: 'resp_content',
    type: 'longtext',
    nullable: true,
    default: null,
    comment: 'response json str',
  })
  respContent: string; // success json or error json

  @Column({
    name: 'ai_type',
    length: 50,
    type: 'varchar',
    nullable: true,
    default: '',
    comment: 'ai type',
  })
  aitype: string;

  @Column({
    name: 'prevous_reqid',
    type: 'varchar',
    length: 50,
    nullable: true,
    default: '',
    comment: 'prevous_reqid',
  })
  preqid: string; // prevous reqid

  @Column({
    name: 'model',
    type: 'varchar',
    length: 100,
    nullable: false,
    default: '',
    comment: 'ai model name',
  })
  model: string;

  @Type(() => Boolean)
  @Transform(({ value }) => Boolean(value))
  @Column({
    name: 'is_error',
    type: 'tinyint',
    nullable: true,
    default: '0',
    comment: 'response error',
  })
  isError: boolean;

  @Column({
    name: 'req_dto',
    type: 'longtext',
    nullable: true,
    default: null,
    comment: 'request data json str',
  })
  reqdto: string; // request dto & ip,cliid etd. JSON

  @Column({
    name: 'req_extra',
    type: 'longtext',
    nullable: true,
    default: null,
    comment: 'request extra json str',
  })
  reqextra: string; // request dto & ip,cliid etd. JSON
}
