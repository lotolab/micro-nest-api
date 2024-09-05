export enum PlatformEnum {
  /* no auth */
  GUEST = 0,
  AI_PALTFORM = 1,
  DC_PLATFROM = 2,
  EC_PLATFROM = 3,
  WECHAT_PLATFORM = 4,
  SYSTEM_PLATFORM = 999,
}

export const PlatformMessage = {
  999: 'System',
  0: 'Guest',
  1: 'AiUser',
  2: 'DcUser',
  3: 'EcUser',
  4: 'WechatUser',
};

export const ClientPlatforms = [
  PlatformEnum.AI_PALTFORM,
  PlatformEnum.GUEST,
  PlatformEnum.DC_PLATFROM,
  PlatformEnum.EC_PLATFROM,
];
