import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemRegionEntity } from '../entities';
import { Like, Repository } from 'typeorm';
import {
  IGBRegionNode,
  RecursionRegionParams,
  RecursionRegionState,
} from '../interface';
import { ConfigService } from '@nestjs/config';
import { FsHelper } from '../helper';
import { formatDateTime, mapToObj } from '../utils';
import { IfwCityTree, SyncCityTreeState } from 'src/api/fanwen/interface';
import { StatusEnum } from '../enums';

@Injectable()
export class RegionConvertService {
  protected logger = new Logger(RegionConvertService.name);

  private basePath: string = 'upload/sql';
  private dataPath: string = 'upload/data';

  constructor(
    @InjectRepository(SystemRegionEntity)
    private readonly regionRepository: Repository<SystemRegionEntity>,
    private readonly config: ConfigService,
  ) {
    this.basePath = this.config.get<string>('upload.sql', 'upload/sql');
    this.dataPath = this.config.get<string>('upload.data', 'upload/data');
  }

  async syncCityTreeUpdate(cities: Array<IfwCityTree>) {
    const state: SyncCityTreeState = {
      size: 0,
      affected: 0,
      left: [],
    };

    if (cities.length) {
      for (let i = 0; i < cities.length; i++) {
        await this.recursionSyncCityTree(cities[i], state);
      }
    }

    return state;
  }

  private async recursionSyncCityTree(
    city: IfwCityTree,
    state: SyncCityTreeState,
  ) {
    state.size = state.size + 1;

    const find = await this.getOneByCity(city);
    if (find) {
      const out = await this.updateRegionForCityTree(city, find.id);
      this.logger.log(
        `&&&>>>>${city.name} :  update ${out} + ${state.affected}`,
      );
      state.affected = state.affected + out;
    } else {
      state.left.push({ name: city.name, id: city.id, list: city?.list });
    }

    if (city.list?.length) {
      for (let j = 0; j < city.list.length; j++) {
        this.recursionSyncCityTree(city.list[j], state);
      }
    }
  }

  async updateRegionForCityTree(city: IfwCityTree, key: number) {
    const { name, id } = city;

    const qb = this.regionRepository
      .createQueryBuilder()
      .update(SystemRegionEntity)
      .set({
        value: id.toString(),
        tag: 'fw',
      })
      .where('id = :id', { id: key });

    const { affected } = await qb.execute();
    this.logger.log(`&&&>>>>${name} : ${id} update ${affected}`);
    return affected ?? 0;
  }

  async getOneByCity(city: IfwCityTree) {
    const { name } = city;

    const map = new Map();
    map.set('name', Like(`${name.trim()}%`));
    // if (!list?.length) {
    //   map.set('code', Like(`%0000`));
    // }
    const entity = await this.regionRepository
      .createQueryBuilder()
      .where(mapToObj(map))
      .getOne();

    return entity;
  }

  parseRegionJson() {
    const jsonName = 'level.json';
    const file = FsHelper.join(this.dataPath, jsonName);
    const jsons = FsHelper.readJsonFileSync<Array<IGBRegionNode>>(file);

    const treeNodes: Array<RegionTreeExType> = [];

    if (jsons?.length) {
      const file = this.checkEnsureSQLFile('sys_region.sql');
      let nextid = 1;
      const nextsid = 100;
      const state: RecursionRegionParams = {
        nextsid: nextsid,
        file,
        root: null,
      };
      for (let i = 0; i < jsons.length; i++) {
        const { name, code, province } = jsons[i];
        const node: RegionTreeExType = {
          id: nextid,
          pid: 0,
          label: name,
          value: null,
          code,
          pcode: '',
          status: true,
          sortno: province?.length
            ? parseInt(province)
            : parseInt(code.substring(0, 2)),
          oid: nextid,
          opid: 0,
          extra: {},
        };
        treeNodes.push(node);

        this.appendJsonRegionSql(file, node, '');

        state.root = node;
        this.recursionJsonNode(jsons[i], node, state);

        nextid = nextid + 1;
      }
    }

    return treeNodes;
  }

  private recursionJsonNode(
    json: IGBRegionNode,
    node: RegionTreeExType,
    state: RecursionRegionParams,
  ) {
    if (json.children?.length) {
      if (!node.children) node.children = [];

      for (let j = 0; j < json.children.length; j++) {
        const { code, name, province, city, area } = json.children[j];

        const sortStr = area ?? city ?? province ?? '0';

        const { nextsid, root, file } = state;

        const subNode: RegionTreeExType = {
          id: nextsid,
          pid: node.id,
          pcode: node.code,
          code,
          label: name,
          sortno: parseInt(sortStr),
          oid: nextsid,
          opid: node.id,
          value: null,
        };

        node.children.push(subNode);

        this.appendJsonRegionSql(file, subNode, root.label);

        state.nextsid = state.nextsid + 1;

        this.recursionJsonNode(json.children[j], subNode, state);
      }
    }
  }

  async recursionExport() {
    const rootId = 0;

    const roots = await this.getRegionTreeNodes(rootId);

    if (roots?.length) {
      const nextid = 1;
      let subNextid = 100;
      for (let i = 0; i < roots.length; i++) {
        roots[i] = {
          ...roots[i],
          id: nextid,
          sortno: i,
        };
        const label = roots[i].label;
        const filename = `${nextid}_${label}.sql`;
        const file = await this.checkEnsureRootFile(filename, roots[i]);
        const sql = this.buildSql(roots[i]);
        await FsHelper.appendByFilepath(file, sql);

        const state: RecursionRegionState = {
          root: roots[i],
          file,
        };
        subNextid = await this.recursionWriteSql(roots[i], state, subNextid);
      }
    }

    return roots;
  }

  /**
   *
   * @param pid
   * @param state
   * @param subNextid
   */
  private async recursionWriteSql(
    pNode: RegionTreeExType,
    state: RecursionRegionState,
    subNextid: number,
  ): Promise<number> {
    const { id, oid } = pNode;
    const children = await this.getRegionTreeNodes(oid);
    if (children?.length) {
      const { file, root } = state;
      for (let j = 0; j < children.length; j++) {
        children[j] = {
          ...children[j],
          id: subNextid,
          sortno: j,
          pid: id,
        };
        const sql = this.buildSql(children[j]);
        await FsHelper.appendByFilepath(file, sql);

        subNextid++;

        await this.recursionWriteSql(children[j], { root, file }, subNextid);
      }
    }
    return subNextid;
  }

  private checkEnsureRootFile(filename: string, node: RegionTreeType): string {
    const { label, id } = node;

    const template = `
    -- ------------------------------------------------
    -- Region : ${label} ${id} 
    -- ------------------------------------------------
    `;
    const file = FsHelper.ensureFileSync(filename, this.basePath, template);
    return file;
  }

  private checkEnsureSQLFile(filename: string): string {
    const now = new Date();
    const template = `
    -- ------------------------------------------------
    -- Region : ${formatDateTime(now)}
    -- Author : LotoOpenLab
    -- ------------------------------------------------
    `;
    const file = FsHelper.ensureFileSync(filename, this.dataPath, template);
    return file;
  }

  private buildSql(data: RegionTreeExType): string {
    const { id, label, pid, code = '', sortno = 0, value = '' } = data;

    const sql = `\nINSERT INTO \`sys_region\` (\`id\`, \`created_by\`, \`updated_by\`, \`created_at\`, \`updated_at\`, \`deleted_at\`, \`name\`, \`code\`, \`value\`, \`extra\`, \`status\`, \`remark\`, \`tag\`, \`pid\`, \`sortno\`) VALUES (${id}, 0, 0, '1988-06-04 03:54:54.994729', '1988-06-04 03:54:54.007856', NULL, '${label}', '${code}', '${value}', NULL, 1, '', NULL, ${pid}, ${sortno});`;
    return sql;
  }

  private appendJsonRegionSql(
    file: string,
    data: RegionTreeExType,
    remark: string,
  ) {
    const { id, label, pid, code = '', sortno = 0, value = '' } = data;

    const sql = `\nINSERT INTO \`sys_region\` (\`id\`, \`created_by\`, \`updated_by\`, \`created_at\`, \`updated_at\`, \`deleted_at\`, \`name\`, \`code\`, \`value\`, \`extra\`, \`status\`, \`remark\`, \`tag\`, \`pid\`, \`sortno\`) VALUES (${id}, 0, 0, '1988-06-04 03:54:54.994729', '1988-06-04 03:54:54.007856', NULL, '${label}', '${code}', '${value}', NULL, 1, '${remark}', NULL, ${pid}, ${sortno});`;

    FsHelper.appendByFilepath(file, sql);
  }

  async getRegionTreeNodes(pid: number): Promise<Array<RegionTreeExType>> {
    const entities = await this.regionRepository
      .createQueryBuilder()
      .where('pid = :pid', { pid: String(pid) })
      .orderBy('sortno', 'ASC')
      .getMany();

    return entities?.length
      ? entities.map(
          ({ id, pid, name, value, code, sortno, status, extra }) => {
            const node: RegionTreeExType = {
              id,
              pid,
              oid: id,
              opid: pid,
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
          },
        )
      : [];
  }
}
