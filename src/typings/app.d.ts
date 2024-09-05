type LotoAppListener = {
  name: string;
  url: string;
};

type LocaleType = 'enUS' | 'zhCN';

type LotoHeaderKeyType = 'x-loto-key' | 'x-loto-reqid';

type BizErrorOptionType = {
  locale?: LocaleType;
  error?: string | string[];
} & Record<string, string | number>;

type IAccessBase = {
  id: number;
};

type ITokenBase = {
  iat: number;
  exp: number;
  iss: string;
  aud: string; // 受众 oauth appid hex
  sub: string; // 主题
};

type JwtAccessPayload = {
  username: string;
  version: string;
  platform: number;
  state: string;
} & IAccessBase &
  Partial<ITokenBase>;

type OAuth2JwtConfigOption = {
  priFilename?: string;
  privateKey?: string;
  pubFilename?: string;
  publicKey?: string;
  vendor: string;
  appid: string;
  secretId?: string;
  secretKey: string;
  alg: string; // @see https://github.com/auth0/node-jsonwebtoken
  iss: string;
  expirein: string;
  encryptRounds: number;
  redirectUrl?: string;
  whitelist?: string[];
};

type OAuth2JwtBaseConfigOption = Pick<
  OAuth2JwtConfigOption,
  'alg' | 'appid' | 'priFilename' | 'pubFilename' | 'secretKey'
>;

type OAuth2AccessPayload = {
  jti: string; // 32 位随机值防止重放攻击
  username: string; //用户名
  avatar?: string; // 头像
  ip: string | undefined; // 用户端IP
  cid?: string; //  有token申请者传入
  nonce?: string; //
} & Partial<ITokenBase>;

type OAuth2DecodeCompleteType = {
  header: {
    typ: string;
    alg: string;
  };
  payload: OAuth2AccessPayload;
  signature: string;
};

type OAuthJwtClientData = {
  clientId?: string;
  ip?: string | undefined;
  [key: string]: any;
};

type SystemRegionType = {
  id: number;
  pid: number;
  label: string;
  value: string;
  code: string;
  extra?: Record<string, any>;
  sortno: number;
  status: boolean;
  remark: string;
};

type SystemRegionExType = SystemRegionType & {
  level: number;
};

type RegionTreeType = {
  id: number;
  label: string;
  value: string;
  code: string;
  pcode?: string;
  status?: boolean;
  sortno: number;
  extra?: Record<string, any>;
  children?: Array<RegionTreeType>;
  isLeaf?: boolean;
};

type RegionTreeExType = RegionTreeType & {
  pid: number;
  oid: number;
  opid: number;
};

interface SelectorOptionType<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
  actived?: boolean;
  icon?: string;
  extra?: Record<string, any>;
}
