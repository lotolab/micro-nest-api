import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SysDictEntity, SysDictItemEntity } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { DictManagementService } from './dict.management.service';
import { StatusEnum } from '../enums';
import { compareSortnoASC } from '../utils/array.util';

@Injectable()
export class DictOptionsService {
  protected logger = new Logger(DictOptionsService.name);

  constructor(
    @InjectRepository(SysDictEntity)
    private readonly dictRepository: Repository<SysDictEntity>,

    private readonly dictManagement: DictManagementService,
  ) {}

  async getDictSelectOptionsByCode(code: string) {
    const items = await this.dictManagement.getDictItemsByCode(code);
    if (!items?.length) return [];

    return (
      items
        .sort((a, b) => compareSortnoASC(Number(a.sortno), Number(b.sortno)))
        // .filter((v) => v.status === StatusEnum.FORBIDDEN)
        .map((it) => DictOptionsService.convertDictItemToSelectorOption(it))
    );
  }

  async getDictSelectOptionsById(id: number) {
    const entity = await this.dictManagement.getById(id);
    if (!entity || !entity.items?.length) return [];

    return entity.items
      .sort((a, b) => compareSortnoASC(Number(a.sortno), Number(b.sortno)))
      .map((it) => DictOptionsService.convertDictItemToSelectorOption(it));
  }

  static convertDictItemToSelectorOption(
    entity: SysDictItemEntity,
  ): SelectorOptionType {
    const { id, label, value, status, defaultActived, extra, icon, sortno } =
      entity;

    let extraObj = {};
    try {
      if (extra?.length) {
        Array.isArray(JSON.parse(extra))
          ? (extraObj = { arrays: JSON.parse(extra) })
          : (extraObj = JSON.parse(extra));
      }
    } catch (_e) {}

    return {
      label,
      value,
      disabled: status === StatusEnum.FORBIDDEN,
      actived: Boolean(defaultActived),
      icon,
      extra: {
        ...extraObj,
        id,
        sortno,
      },
    } as SelectorOptionType;
  }
}
