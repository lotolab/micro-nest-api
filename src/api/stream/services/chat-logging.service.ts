import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRecordV3Entity } from 'src/api/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ChatLoggingService {
  constructor(
    @InjectRepository(ChatRecordV3Entity)
    private readonly chatRecordRepository: Repository<ChatRecordV3Entity>,
  ) {}

  /**
   * If record exsit will ignore
   */
  public async createChatRecord(cached: SSETaskQueueCacheData) {
    const { reqid } = cached;
    if (!reqid?.length) return;

    const find = await this.findByReqid(reqid);
    if (find) return;
    const entity = ChatLoggingService.convertCacheToPartialEntity(cached);

    return await this.chatRecordRepository.save(
      this.chatRecordRepository.create(entity),
    );
  }

  public async updateChatRecord(cached: SSETaskQueueCacheData) {
    const { reqid } = cached;
    if (!reqid?.length) return;
    const old = await this.findByReqid(reqid);
    if (!old) return;

    const updated = ChatLoggingService.mergeCacheToUpdatedEntity(cached, old);
    await this.chatRecordRepository
      .createQueryBuilder('record')
      .update(updated)
      .where({ id: old.id })
      .execute();
  }

  findByReqid(reqid: string) {
    return this.chatRecordRepository
      .createQueryBuilder('record')
      .where({
        reqid: reqid,
      })
      .getOne();
  }

  static mergeCacheToUpdatedEntity(
    cache: SSETaskQueueCacheData,
    entity: ChatRecordV3Entity,
  ) {
    const {
      result,
      error,
      costTime,
      data,
      endTime,
      reqid,
      cliid,
      ip,
      startTime,
    } = cache;

    let extra;
    if (endTime) {
      if (entity.reqextra?.length) {
        try {
          const json = JSON.parse(entity.reqextra);
          extra = JSON.stringify({ ...json, endTime });
        } catch (_err) {}
      } else {
        extra = JSON.stringify({ reqid, cliid, ip, startTime, endTime });
      }
    }

    const updated: Partial<ChatRecordV3Entity> = {
      ...entity,
      result: result ? result : entity.result ?? undefined,
      isError: error ? true : false,
      respContent: error
        ? JSON.stringify(error)
        : data
          ? JSON.stringify(data)
          : entity.respContent ?? undefined,
      costTime,
      reqextra: extra ?? undefined,
    };

    return updated;
  }

  static convertCacheToPartialEntity(
    cache: SSETaskQueueCacheData,
  ): Partial<ChatRecordV3Entity> {
    const {
      cliid,
      ip,
      startTime,
      reqid,
      model,
      prompt,
      result,
      uuid,
      aiopts,
      uid,
      username,
      aitype,
      preqid,
      reqData,
      tid,
    } = cache;

    const reqExtraJson: Record<string, any> = {
      reqid,
      cliid,
      ip,
      startTime,
      uuid,
      tid,
    };

    const entity: Partial<ChatRecordV3Entity> = {
      reqid,
      prompt,
      result: result ? result : undefined,
      aiopts: aiopts ? JSON.stringify(aiopts) : undefined,
      uuid,
      uid,
      username,
      aitype,
      preqid,
      model,
      reqdto: reqData ? JSON.stringify(reqData) : undefined,
      reqextra: JSON.stringify(reqExtraJson),
    };

    return entity;
  }
}
