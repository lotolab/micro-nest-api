export interface IWxaiSDKConfig {
  name: string;
  appId: string;
  apiKey: string;
  apiSecret: string;
}

export interface WxaiSDKOptions extends Partial<IWxaiSDKConfig> {
  global?: boolean;
}

export interface IWxaiModelApiType {
  apipath: string;
  name: string;
  desc?: string;
}

export interface IBuildAccessTokenParams {
  apiKey: string;
  apiSecret: string;
  grantType?: string;
}

/**
 * expires_in Access Token的有效期(秒为单位，有效期30天)
 */
export interface WxaiAccessToken {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  scope?: string; // 该参数忽略
  session_key?: string; // 该参数忽略
  session_secret?: string; // 该参数忽略
}

export interface WxaiMessageType {
  role: string;
  content: string;
}

export interface WxaiRequestOption extends Record<string, any> {
  user_id?: string;
  temperature?: number;
  top_p?: number;
  penalty_score?: number;
  stream?: boolean;
  system?: string;
}
