type RedirectCodeType = 301 | 302;

type OauthRedirectDecorateParams = {
  url?: string;
  statusCode?: RedirectCodeType;
};

type AESOptionsType = {
  alg: string;
  iv: string; // iv base64
  key: string; // key base64
};
