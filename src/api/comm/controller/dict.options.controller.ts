import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LotoModuleRoutes } from 'src/api/module.routes';
import { DictOptionsService } from 'src/core';

@ApiTags(`${LotoModuleRoutes.comm.name} 数据字典`)
@Controller('dict')
export class DictOptionsController {
  constructor(private readonly dictService: DictOptionsService) {}

  @ApiOperation({
    summary: '获取UI下拉数据字典项',
    description: 'code 参数为 sys_dict表code',
  })
  @Get('by_code/:code')
  getSelectorOptions(@Param('code') code: string) {
    return this.dictService.getDictSelectOptionsByCode(code);
  }
}
