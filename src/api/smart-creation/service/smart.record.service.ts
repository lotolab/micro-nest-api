import { Injectable } from '@nestjs/common';
import { QuerySmartRecordListDto, SmartRecordDto } from '../dto';
import { ICurrentUser } from 'src/core/interface';
import { InjectRepository } from '@nestjs/typeorm';
import { SmartRecordEntity } from 'src/api/entities/smart.record.entity';
import { Like, Repository } from 'typeorm';
import { BizException } from 'src/exception';
import { OrderbyModeEnum, PaginationEnum } from 'src/core/enums';
import { CommSortColNames } from 'src/api/enums';
import { mapToObj } from 'src/core/utils';

@Injectable()
export class SmartRecordService {
  constructor(
    @InjectRepository(SmartRecordEntity)
    private readonly recordRepository: Repository<SmartRecordEntity>,
  ) {}

  async list(
    dto: QuerySmartRecordListDto,
    user: ICurrentUser,
  ): Promise<PaginationResultData<BizSmart.SmartRecordType>> {
    const {
      page = PaginationEnum.PAGE_NUMBER,
      pageSize = PaginationEnum.PAGE_SIZE,
      title,
      sortColum = CommSortColNames.updatedAt,
      orderMode = OrderbyModeEnum.DESC,
    } = dto;
    const { id = -1 } = user;

    const map = new Map();
    map.set('uid', id);
    if (title?.length) {
      map.set('title', Like(`%${title}%`));
    }

    const [data, total] = await this.recordRepository
      .createQueryBuilder('record')
      .where(mapToObj(map))
      .orderBy(sortColum.valueOf(), orderMode)
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .getManyAndCount();

    return {
      page,
      pageSize,
      total,
      list:
        data?.map((data: SmartRecordEntity) =>
          SmartRecordService.convertEntity2SmartRecordType(data),
        ) ?? [],
    };
  }

  async createOrUpdate(dto: SmartRecordDto, user: ICurrentUser) {
    const { id, username } = user;
    const { tid, title, content, extra } = dto;
    const old = await this.getByTid(tid);

    let entity;
    let extraJson: string | undefined;
    if (extra && Object.keys(extra).length) {
      extraJson = JSON.stringify(extra);
    }
    if (old) {
      entity = {
        ...old,
        title,
        content,
        uid: id,
        uname: username,
        extra: extraJson,
      };

      await this.recordRepository.save(entity);
    } else {
      entity = await this.recordRepository.save(
        this.recordRepository.create({
          title,
          tid,
          content,
          uid: id,
          uname: username,
          extra: extraJson,
        }),
      );
    }

    return entity;
  }

  getByTid(tid: string) {
    if (!tid?.length) throw BizException.IllegalParamterError();

    const entity = this.recordRepository
      .createQueryBuilder('record')
      .where({ tid })
      .getOne();

    return entity;
  }

  async getDetailSmartRecordType(
    tid: string,
  ): Promise<BizSmart.SmartRecordType | undefined> {
    const entity = await this.getByTid(tid);

    return entity
      ? SmartRecordService.convertEntity2SmartRecordType(entity)
      : undefined;
  }

  static convertEntity2SmartRecordType(
    entity: SmartRecordEntity,
  ): BizSmart.SmartRecordType {
    const {
      tid,
      createdAt,
      updatedAt,
      title = '',
      content,
      extra,
      ...others
    } = entity;

    let extraRecord: Record<string, any> | undefined;

    if (extra?.length) {
      try {
        extraRecord = JSON.parse(extra) as unknown as Record<string, any>;
      } catch (_e) {}
    }
    const data: BizSmart.SmartRecordType = {
      ...others,
      tid,
      title,
      datetime: new Date(updatedAt ?? createdAt).valueOf(),
      content,
      extra: extraRecord,
    };

    return data;
  }
}
