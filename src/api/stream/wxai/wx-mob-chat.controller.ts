import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
  Sse,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LotoModuleRoutes } from 'src/api/module.routes';
import { CurrentUser, IgnoreTransformApi, RealIP } from 'src/decorators';

import { Response, Request } from 'express';

import { WxaiChatProcessReqDto } from 'src/sdk/wxsdk/interfaces';

import { ICurrentUser } from 'src/core/interface';

import { WxaiStreamService } from './services/wxai-stream.service';
import { convertHeaderKey, LotolabAppConstants } from 'src/core/enums';
import { ToolsService } from 'src/core';

@ApiTags(`${LotoModuleRoutes.mobs.name} `)
@Controller('mob/wxai/chat')
export class WxMobChatController {
  protected readonly logger = new Logger(WxMobChatController.name);
  constructor(
    private readonly service: WxaiStreamService,
    private readonly tools: ToolsService,
  ) {}

  @ApiOperation({ summary: '健康检查接口' })
  @IgnoreTransformApi()
  @Get()
  health(@RealIP() ip: string) {
    return `Wxchat Service runing...,visit IP: ${ip}`;
  }

  /**
   *
   * @param user 当前用户
   * @param req 请求
   * @param res 响应
   * @param dto 请求Body
   * @param ip IP
   * @returns stream
   */
  @ApiOperation({ summary: '流式请求API' })
  @IgnoreTransformApi()
  @Post('chat_process')
  @Sse('chat_process')
  @HttpCode(HttpStatus.OK)
  async chatProcess(
    @CurrentUser() user: ICurrentUser,
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: WxaiChatProcessReqDto,
    @RealIP() ip: string,
  ) {
    let reqid = req.headers[LotolabAppConstants.HEADER_LOTO_REQID_KEY];
    if (!reqid?.length) {
      reqid = await this.tools.createReqId(
        20,
        LotolabAppConstants.CLIENT_PREFIX_MOB,
      );
      res.setHeader(
        convertHeaderKey(LotolabAppConstants.HEADER_LOTO_REQID_KEY, true),
        reqid,
      );
    } else {
      reqid =
        Array.isArray(reqid) && reqid.length > 1
          ? (reqid as string[])[0]
          : reqid;
    }
    const cliid = req.headers[LotolabAppConstants.HEADER_LOTO_CLIENT_KEY];

    const opts: SSEChatProcessOptions = {
      cliid,
      ip,
      reqid: reqid as string,
      uid: user.id,
      username: user.nickname,
    };
    return await this.service.chatProcess(dto, opts);
  }
}
