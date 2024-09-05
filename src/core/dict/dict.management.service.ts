import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SysDictEntity, SysDictItemEntity } from '../entities';
import { Repository } from 'typeorm';
import { StatusEnum } from '../enums';

@Injectable()
export class DictManagementService {
  protected logger = new Logger(DictManagementService.name);

  constructor(
    @InjectRepository(SysDictEntity)
    private readonly dictRepository: Repository<SysDictEntity>,

    @InjectRepository(SysDictItemEntity)
    private readonly dictItemRepository: Repository<SysDictItemEntity>,
  ) {}

  async getById(id: number) {
    const entity = await this.dictRepository.findOne({
      where: { id },
      relations: {
        items: true,
      },
      order: {
        sortno: 'ASC',
      },
    });

    // await this.dictRepository.createQueryBuilder('dict').leftJoinAndSelect("dict.items","dict")

    return entity;
  }

  async getOneDictByCode(code: string) {
    if (!code?.length) throw new Error(`Code parameter illegal`);
    const dict = await this.dictRepository.findOneBy({ code });
    return dict;
  }

  async getDictByCode(code: string) {
    if (!code?.length) throw new Error(`Code parameter illegal`);

    return await this.dictRepository.findOne({
      where: { code },
      relations: {
        items: true,
      },
      order: {
        sortno: 'ASC',
      },
    });
  }

  async getDictItemsByCode(code: string) {
    const dict = await this.getOneDictByCode(code);
    if (!dict) return [];
    const list = await this.dictItemRepository
      .createQueryBuilder('item')
      .where({ dict, status: StatusEnum.NORMAL })
      .getMany();

    return list;
  }
}
