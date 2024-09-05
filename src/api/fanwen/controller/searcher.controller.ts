import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LotoModuleRoutes } from 'src/api/module.routes';
import { FanwenAPIService } from '../service';
import { getSearcherPeriodSelectorOptions } from '../enums';
import { SearchAdvanceParamsDto } from '../dto';
import { BizCodeEnum, BizException } from 'src/exception';

@ApiTags(`${LotoModuleRoutes.fanwen.name} 高级查询`)
@Controller('q')
export class FwSearcherController {
  constructor(private readonly fanwenAPI: FanwenAPIService) {}

  @ApiOperation({ summary: '时间周期查询条件选这项' })
  @Get('dict/date_period')
  searcherPeriodOptions() {
    return getSearcherPeriodSelectorOptions();
  }

  @ApiOperation({
    summary: '高级检索',
    description: '调用凡闻 https://oapi.hzfanews.com/v1/bingtuan/getadvanced',
  })
  @Post('sa')
  @HttpCode(HttpStatus.OK)
  queryAdvanice(@Body() dto: SearchAdvanceParamsDto) {
    return this.fanwenAPI.getAdvanced(dto);
  }

  @ApiOperation({ summary: '获取新闻内容' })
  @Get('fakenews/detail/:sid')
  getArticalContent(@Param('sid') sid: string) {
    if (!sid?.trim()?.length) {
      throw BizException.createError(BizCodeEnum.ILLEGAL_ARGS, `id required.`);
    }

    return this.fanwenAPI.getDetailFakenewsContent(sid);
  }
}
