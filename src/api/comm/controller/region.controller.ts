import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LotoModuleRoutes } from 'src/api/module.routes';
import { RegionConvertService, RegionService } from 'src/core';

@ApiTags(`${LotoModuleRoutes.comm.name} 行政区划树`)
@Controller('region')
export class RegionController {
  constructor(
    private readonly regionService: RegionService,
    private readonly regionConvertService: RegionConvertService,
  ) {}

  @ApiOperation({ summary: '根据PID获取部分树节点并递归子节点' })
  @Get('tree/:pid')
  getTreeNodes(@Param('pid') pid: number) {
    return this.regionService.findRegionTree(pid);
  }

  @ApiOperation({
    summary: '根据PID获取部分树节点',
    description: '用于异步加载',
  })
  @Get('sub_nodes/:pid')
  getSubNodes(@Param('pid') pid: number) {
    return this.regionService.getRegionTreeNodes(pid);
  }

  @Get('fw_sub_nodes/:pid')
  getFanwenSubNodes(@Param('pid') pid: number) {
    return this.regionService.getRegionTreeNodes(pid, true);
  }

  @ApiOperation({ summary: '根据PID获取部分树节点并递归子节点导出JSON' })
  @Get('tree_shake')
  exportRecursionRegionTree() {
    return this.regionConvertService.parseRegionJson();
  }

  @ApiOperation({ summary: '根据缓存更新' })
  @Get('sync_city_tree')
  syncMatchCityTreeCache() {
    return this.regionConvertService.parseRegionJson();
  }
}
