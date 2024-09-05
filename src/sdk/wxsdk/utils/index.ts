import { BCE_OAUTH20_BASE_URL, WXAI_API_URL_BASE } from '../wxai.constants';
import { findModelRouter } from './get-router';

export function getWxaiModelRouterUrl(
  router: WXAI.ModelRouterType,
  token: string,
): string {
  return `${WXAI_API_URL_BASE}/${router.path}?access_token=${token || ''}`;
}

export function getWxaiUrl(
  modelKey,
  options?: WXAI.GetModelUrlOptionType,
): string {
  const { strictMode = false, token = '', path = '' } = options || {};

  const router = findModelRouter(
    modelKey as WXAI.ModelRouteKeyType,
    path,
    strictMode,
  );
  if (router) return getWxaiModelRouterUrl(router, token);

  return path?.length
    ? `${WXAI_API_URL_BASE}/${path}?access_token=${token}`
    : `${WXAI_API_URL_BASE}/chat/${modelKey}?access_token=${token}`;
}

export function getTokenUrl(
  clientId: string,
  clientSecret: string,
  grantType: string = 'client_credentials',
): string {
  return `${BCE_OAUTH20_BASE_URL}/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=${grantType}`;
}
