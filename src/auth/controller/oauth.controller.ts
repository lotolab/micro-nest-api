import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
  Headers,
  Res,
  Post,
  Body,
} from '@nestjs/common';
import { OauthJwtService } from '../service/oauth-jwt.service';
import { CurrentUser, RealIP } from 'src/decorators';
import { LOTO_HEADER_KEY } from 'src/core';
import { Response } from 'express';
import { Oauth2RequestDto } from '../dto';

@Controller('oauth2')
export class OAuthController {
  private logger = new Logger(OAuthController.name);
  constructor(private readonly jwtService: OauthJwtService) {}

  @Get('sign')
  async getToken(
    @Headers(LOTO_HEADER_KEY) clientKey: string,
    @CurrentUser() user,
    @RealIP() ip: string,
    @Query('appid') appid: string,
    @Query('state') state: string,
  ) {
    this.logger.log(`visit IP ${ip}`, clientKey);
    const token = await this.jwtService.signOauth2Token(
      user,
      ip,
      appid,
      state || clientKey,
    );
    return token;
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  verifyToken(
    @Query('access_token') token: string,
    @Query('appid') appid: string,
  ) {
    return this.jwtService.verifyOauth2Token(token, appid);
  }

  @Post('parse_jwt')
  @HttpCode(HttpStatus.OK)
  async decodeToken(@Body() dto: Oauth2RequestDto, @RealIP() ip: string) {
    const { appid, token } = dto;
    await this.jwtService.checkWhitelist(appid, ip);
    return this.jwtService.decodeJwt(token, appid, true);
  }

  @Get('access_token')
  //   @Redirect('https://pc.wenguangtianshu.com.cn', 301)
  async getCallback(
    @Headers(LOTO_HEADER_KEY) clientKey: string,
    @CurrentUser() user,
    @RealIP() ip: string,
    @Query('appid') appid: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const url = await this.jwtService.signOauth2Callback(
      user,
      ip,
      appid,
      clientKey || state,
    );
    this.logger.log(url);
    await res.redirect(301, url);
  }
}
