export const LotolabAppConstants = {
  HEADER_LOTO_CLIENT_KEY: 'x-loto-key',
  HEADER_LOTO_REQID_KEY: 'x-loto-reqid',
  CLIENT_PREFIX_MOB: 'tsmob',
};

export function convertHeaderKey(key: string, isClient?: boolean) {
  return key
    .split('-')
    .map((v: string) => {
      if (isClient) {
        return v.toLowerCase();
      }
      return v.length > 1
        ? `${v.slice(0, 1).toUpperCase()}${v.slice(1).toLowerCase()}`
        : v.toUpperCase();
    })
    .join('-');
}
