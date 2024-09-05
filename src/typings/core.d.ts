type RedirectCodeType = 301 | 302;

type OauthRedirectDecorateParams = {
  url?: string;
  statusCode?: RedirectCodeType;
};
