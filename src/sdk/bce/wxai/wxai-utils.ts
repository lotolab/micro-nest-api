import {
  BCE_OAUTH2_BASE,
  BCE_WXAI_BASEURL,
  BCE_WXAI_CHAT_PATH,
} from '../../wxai/lib/wxai-constants';
import { IBuildAccessTokenParams } from '../../wxai/lib/interfaces/wxai.interface';

export const buildWxaiChatBaseUrl = (
  wxaiModelKey: string,
  token?: string,
): string => {
  return token?.length
    ? `${BCE_WXAI_BASEURL}/${BCE_WXAI_CHAT_PATH}/${wxaiModelKey}?access_token=${token}`
    : `${BCE_WXAI_BASEURL}/${BCE_WXAI_CHAT_PATH}/${wxaiModelKey}`;
};

export const buildAccessTokenUrl = (
  params: IBuildAccessTokenParams,
): string => {
  const { apiKey, apiSecret } = params;
  if (!apiKey?.length || !apiSecret?.length)
    throw new Error(`apiKey or apiSecret invalid.`);

  const grantType = 'client_credentials';

  return `${BCE_OAUTH2_BASE}?client_id=${apiKey}&client_secret=${apiSecret}&grant_type=${grantType}`;
};
