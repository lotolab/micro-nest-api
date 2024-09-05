import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LotoModuleRoutes } from 'src/api/module.routes';
import { SsePcWrapService } from './services/sse-pc-wrap.service';
import { Body, Controller, Logger, Post, Req, Sse } from '@nestjs/common';

import { ICurrentUser } from 'src/core/interface';
import { CurrentUser, IgnoreTransformApi, RealIP } from 'src/decorators';
import { Request } from 'express';
import { WxaiChatProcessReqDto } from 'src/sdk/wxsdk/interfaces';
import { ToolsService } from 'src/core';
import { LotolabAppConstants } from 'src/core/enums';
import { BizCodeEnum, BizException } from 'src/exception';

@ApiTags(`${LotoModuleRoutes.sse.name} For PC`)
@Controller('pc/wxai/chat')
export class WxaiPcChatController {
  protected readonly logger = new Logger(WxaiPcChatController.name);

  constructor(
    private readonly chatService: SsePcWrapService,
    private readonly tools: ToolsService,
  ) {}

  @ApiOperation({ summary: 'PC流式请求API' })
  @IgnoreTransformApi()
  @Post('chat_process')
  @Sse('chat_process')
  async chatProcess(
    @CurrentUser() user: ICurrentUser,
    @Req() req: Request,
    // @Res() res: Response,
    @Body() dto: WxaiChatProcessReqDto,
    @RealIP() ip: string,
  ) {
    const sseOpts: SSEChatProcessOptions = await this.buildSSEChatOptions(
      req,
      user,
      ip,
    );
    // res.write()
    return this.chatService.pcChatProcess(dto, sseOpts);
  }

  @ApiOperation({ summary: 'PC流式请求API', description: '天書魔方Stream API' })
  @IgnoreTransformApi()
  @Post('mf/chat_tpl')
  @Sse('mf/chat_tpl')
  async mfchatProcess(
    @CurrentUser() user: ICurrentUser,
    @Req() req: Request,
    // @Res() res: Response,
    @Body() dto: WxaiChatProcessReqDto,
    @RealIP() ip: string,
  ) {
    const sseOpts: SSEChatProcessOptions = await this.buildSSEChatOptions(
      req,
      user,
      ip,
    );
    // res.write()
    return this.chatService.pcMfChatProcess(dto, sseOpts);
  }

  private async buildSSEChatOptions(
    req: Request,
    user: ICurrentUser,
    ip: string,
  ): Promise<SSEChatProcessOptions> {
    let reqid = req.headers[LotolabAppConstants.HEADER_LOTO_REQID_KEY];
    if (!reqid?.length)
      throw BizException.createError(BizCodeEnum.ILLEGAL_ARGS, `Miss reqid.`);
    if (!reqid) {
      reqid = await this.tools.createReqId(
        20,
        LotolabAppConstants.CLIENT_PREFIX_MOB,
      );
    }
    const cliid = req.headers[LotolabAppConstants.HEADER_LOTO_CLIENT_KEY];
    return {
      reqid: reqid as string,
      uid: user.id,
      username: user.nickname,
      cliid: cliid,
      ip,
    };
  }
}
