import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { SmartRecordService } from './service';
import { QuerySmartRecordListDto, SmartRecordDto } from './dto';
import { CurrentUser } from 'src/decorators';
import { ICurrentUser } from 'src/core/interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LotoModuleRoutes } from '../module.routes';
import { BizException } from 'src/exception';

@ApiTags(`${LotoModuleRoutes.pc.name} 智能写稿历史记录 API`)
@Controller('smart')
export class SmartCreationController {
  constructor(private readonly recordService: SmartRecordService) {}

  @ApiOperation({
    summary: '查询智能写稿历史列表',
  })
  @Get('record/list')
  recordList(
    @Query() queryDto: QuerySmartRecordListDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.recordService.list(queryDto, user);
  }

  @ApiOperation({
    summary: '添加记录',
  })
  @Put('create_record')
  @HttpCode(HttpStatus.OK)
  addSmartRecord(
    @Body() dto: SmartRecordDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.recordService.createOrUpdate(dto, user);
  }

  @ApiOperation({
    summary: '获取记录明细',
  })
  @Get('record/detail/:tid')
  getRecordDetail(@Param('tid') tid: string) {
    if (!tid?.length) throw BizException.IllegalParamterError(`tid invalid.`);
    return this.recordService.getDetailSmartRecordType(tid);
  }
}
