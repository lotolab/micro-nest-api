import { Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LotoModuleRoutes } from 'src/api/module.routes';
import { FanwenAPIService } from '../service/fanwen.api.service';
import { PublicApi } from 'src/decorators';

@ApiTags(`${LotoModuleRoutes.fanwen.name} 行政区划树同步`)
@Controller('city')
export class CityTreeController {
  constructor(private readonly fanwenAPI: FanwenAPIService) {}

  @PublicApi()
  @ApiOperation({
    summary: '获取Fanwen Token',
  })
  @Put('connect')
  connectFanwenAPI() {
    return this.fanwenAPI.connectToken();
  }

  @ApiOperation({
    summary: '同步城市树',
  })
  @Get('sync_tree')
  syncCityTree() {
    return this.fanwenAPI.getCitytree();
  }

  @ApiOperation({ summary: '根据缓存更新' })
  @Get('sync_city_tree')
  syncMatchCityTreeCache() {
    return this.fanwenAPI.syncRegionFromCache();
  }
}
