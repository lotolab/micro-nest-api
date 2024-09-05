import { ICurrentUser } from 'src/core/interface';
import { BizCodeEnum, BizException } from 'src/exception';

import { WxaiChatProcessOptions } from 'src/sdk/wxsdk/interfaces';

//wxai stream module utils
export function buildWxaiChatProcessOptions(
  user: ICurrentUser,
  reqid: string,
  ip: string,
  cliid?: string,
): WxaiChatProcessOptions {
  return {
    uid: user.id,
    username: user.nickname,
    cliid,
    reqid,
    ip,
  } as WxaiChatProcessOptions;
}

export function createSseErrorMessage(
  e: Error,
  bizCode: BizCodeEnum = BizCodeEnum.SSE_UNKNOW_ERROR,
): SSEErrorDataType {
  if (e instanceof BizException) {
    const { code, message } = e as BizException;
    return { code, message } as SSEErrorDataType;
  } else {
    return {
      code: bizCode.valueOf(),
      message: e?.message,
    };
  }
}

export function convertSseErrorMessageByMessage(
  msg: string,
  code?: number,
): SSEErrorDataType {
  return {
    code: code ?? BizCodeEnum.SSE_UNKNOW_ERROR.valueOf(),
    message: msg,
  };
}

export function calcCostTime(start: number = 0, now?: number): string {
  const last = now ? now : new Date().getTime();

  const diff = Math.ceil((last - start) / 1000);
  const um = Math.floor(diff / 60);
  const us = diff % 60;
  return um > 0 ? `${um} minutes ${us} seconds` : `${us} seconds`;
}

export function createTaskQueueCache(
  opts: SSEChatProcessBaseOptions & { [k: string]: any },
  messages: Array<WXAI.AIMessage>,
  aitype: AIType = 'wxai',
): SSETaskQueueCacheData {
  const {
    cliid,
    reqid,
    ip,
    uid,
    username,
    model,
    startTime,
    reqData,
    aiopts,
    tid,
    uuid,
  } = opts;
  const prompt = messages?.length ? messages.slice(-1)[0].content : '';
  return {
    model,
    cliid,
    reqid,
    tid,
    uuid,
    ip,
    uid,
    username,
    created: startTime ?? new Date().getTime(),
    status: 0,
    aitype,
    prompt,
    aiopts,
    reqData,
  };
}
