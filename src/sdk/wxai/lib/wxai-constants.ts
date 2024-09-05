import { IWxaiModelApiType } from './interfaces/wxai.interface';

export const BCE_WXAI_CLIENT = Symbol('BCE_WXAI_CLIENT');

export const BCE_WXAI_OPTIONS = Symbol('BCE_WXAI_OPTIONS');

export const BCE_OAUTH2_BASE = 'https://aip.baidubce.com/oauth/2.0/token';
export const BCE_WXAI_BASEURL =
  'https://aip.baidubce.com/rpc/2.0/ai_custom/ai_custom/v1/wenxinworkshop';

export const BCE_WXAI_CHAT_PATH = 'chat';

export const BceWxaiSupportModels: Record<string, IWxaiModelApiType> = {
  completions_pro: {
    apipath: 'completions_pro',
    name: 'ERNIE-4.0-8K',
    desc: 'ERNIE-Bot 4.0是百度最新发布的自研⼤语⾔模型，实现了基础模型的全面升级，在理解、生成、逻辑和记忆能力上都有着显著提升，支持5K输入+2K输出',
  },
  completions_pro_preemptible: {
    apipath: 'completions_pro_preemptible',
    name: 'ERNIE-4.0-8K（抢占式）',
    desc: 'ERNIE-4.0-8K（抢占式）使用QPS限流策略，接口可用配额动态变化，流量高峰期会出现请求失败，可用于实验/服务降级场景',
  },

  completions: {
    apipath: 'completions',
    name: 'ERNIE-3.5-8K',
    desc: 'ERNIE 3.5是百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。ERNIE-3.5-8K（原ERNIE-Bot）',
  },
  ernie_bot_8k: {
    apipath: 'ernie_bot_8k',
    name: 'ERNIE-Bot-8K',
    desc: 'ERNIE-Bot-8K是百度⾃⾏研发的⼤语⾔模型，覆盖海量中⽂数据，具有更强的对话问答、内容创作⽣成等能⼒，支持5K 输入+2K 输出',
  },
  ernie_speed: {
    apipath: 'ernie_speed',
    name: 'ERNIE-Speed-8K',
    desc: 'ERNIE-Speed是百度自主研发的高效语言模型，基于海量高质数据训练，具有更强的文本理解、内容创作、对话问答等能力',
  },
  'ernie-speed-128k': {
    apipath: 'ernie-speed-128k',
    name: 'ERNIE-Speed-128K',
    desc: 'ERNIE-Speed是百度2024年最新发布的自研高性能大语言模型，通用能力优异，适合作为基座模型进行精调，更好地处理特定场景问题，同时具备极佳的推理性能。ERNIE-Speed-128K是模型的一个版本',
  },
  'eb-instant': {
    apipath: 'eb-instant',
    name: 'ERNIE-Lite-8K-0922',
    desc: 'ERNIE-Bot-turbo是百度自行研发的高效语言模型，基于海量高质数据训练，具有更强的文本理解、内容创作、对话问答等能力',
  },
};
