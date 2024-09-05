import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemRegionEntity } from '../entities';
import { Repository } from 'typeorm';
import { mapToObj } from '../utils';
import { StatusEnum } from '../enums';

@Injectable()
export class RegionService {
  protected logger = new Logger(RegionService.name);

  constructor(
    @InjectRepository(SystemRegionEntity)
    private readonly regionRepository: Repository<SystemRegionEntity>,
  ) {}

  async findRegionTree(
    rootId: number = 0,
  ): Promise<Array<RegionTreeType> | never> {
    const rootNodes = await this.getRegionTreeNodes(rootId);
    if (!rootNodes.length) return [];

    for (let i = 0; i < rootNodes.length; i++) {
      await this.recursionSubRegions(rootNodes[i]);
    }
    return rootNodes;
  }

  async recursionSubRegions(
    parentNode: RegionTreeType,
  ): Promise<RegionTreeType> {
    const { id } = parentNode;

    const children = await this.getRegionTreeNodes(id);
    if (children.length) {
      parentNode.children = children;
      for (let i = 0; i < parentNode.children.length; i++) {
        await this.recursionSubRegions(parentNode.children[i]);
      }
    } else {
      return parentNode;
    }
  }

  async getRegionTreeNodes(pid: number, isFw?: boolean) {
    const map = new Map();
    map.set('pid', pid);
    if (isFw) map.set('tag', 'fw');
    const entities = await this.regionRepository
      .createQueryBuilder('region')
      .where(mapToObj(map))
      .orderBy('sortno', 'ASC')
      .getMany();

    return entities?.length
      ? entities.map(({ id, name, value, code, sortno, status, extra }) => {
          const node: RegionTreeType = {
            id,
            label: name,
            code: code ?? '',
            value: value ?? '',
            sortno,
            status: status === StatusEnum.NORMAL,
            extra: {},
          };
          if (extra && extra.length) {
            try {
              node.extra = { ...JSON.parse(extra) };
            } catch (_e) {}
          }
          return node;
        })
      : [];
  }
}
