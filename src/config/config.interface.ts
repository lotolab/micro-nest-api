export interface IJwtConfigSchema {
  version: string;
  iss: string;
  sub: string;
  secretKey: string;
  expirein?: string;
  encryptRounds?: number;
}

export interface IFanwenConfigSchema {
  baseURL?: string;
  grantType: string;
  clientId: string;
  clientSecret: string;
}
