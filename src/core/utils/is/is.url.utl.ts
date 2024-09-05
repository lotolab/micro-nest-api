export function isCallbackUrl(url: string): boolean {
  if (!url?.length) return false;

  if (url.indexOf('?') >= 0) return false;

  return /^(http(s)?:\/\/)\w+[^\s]+(\.[^\s]+){1,}$/.test(url);
}
