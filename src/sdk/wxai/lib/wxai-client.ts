import {
  BCE_OAUTH2_BASE,
  BCE_WXAI_BASEURL,
  BCE_WXAI_CHAT_PATH,
} from './wxai-constants';
import { IWxaiSDKConfig } from './interfaces/wxai.interface';

export type WxaiClientType = WxaiClient;

export default class WxaiClient {
  private cliname: string;
  private appid: string;
  private apiKey: string;
  private apiSecret: string;

  private grantType: string = 'client_credentials';

  protected constructor(
    appid: string,
    apiKey: string,
    apiSecret: string,
    name?: string,
  ) {
    this.cliname = name ?? appid ?? 'DEFAULT_WXAI_CLIENT';
    this.appid = appid;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  static createClient(config: IWxaiSDKConfig): WxaiClientType {
    const { appId, apiKey, apiSecret, name } = config;
    return new WxaiClient(appId, apiKey, apiSecret, name);
  }

  get clientName(): string {
    return this.cliname;
  }

  get appId(): string {
    return this.appid;
  }

  /**
   * 构造文心一言模型调用URL
   * @param wxaiModelKey
   * @param token
   * @returns url
   */
  buildWxaiChatBaseUrl(wxaiModelKey: string, token?: string): string {
    return token?.length
      ? `${BCE_WXAI_BASEURL}/${BCE_WXAI_CHAT_PATH}/${wxaiModelKey}?access_token=${token}`
      : `${BCE_WXAI_BASEURL}/${BCE_WXAI_CHAT_PATH}/${wxaiModelKey}`;
  }

  /**
   * 构造文心一言OAuth2.0 授权 url
   * @returns url
   */
  buildAccessTokenUrl(): string {
    if (!this.apiKey?.length || !this.apiSecret?.length)
      throw new Error(`apiKey or apiSecret invalid.`);

    return `${BCE_OAUTH2_BASE}?client_id=${this.apiKey}&client_secret=${this.apiSecret}&grant_type=${this.grantType}`;
  }
}
