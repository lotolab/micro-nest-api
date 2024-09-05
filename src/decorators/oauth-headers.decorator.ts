import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as requestIp from 'request-ip';

export const OAuthJwt = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx?.switchToHttp().getRequest();
    const ip = requestIp.getClientIp(request);

    const oauthData = {
      ip,
    } as OAuthJwtClientData;
    return data ? oauthData[data] : oauthData;
  },
);
