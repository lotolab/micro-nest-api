const DefaultRouterDesc =
  '请参见技术文档中心[https://console.bce.baidu.com/support/#/api]';

export const wxaiRegisteredRoutes: WXAI.ModelRouterType[] = [
  {
    key: 'completions_pro',
    name: 'ERNIE-4.0-8K',
    path: 'chat/completions_pro',
    desc: '支持5K tokens输入+2K tokens输出',
  },
  {
    key: 'ernie-4.0-8k-latest',
    name: 'ERNIE-4.0-8K-Latest',
    path: 'chat/ernie-4.0-8k-latest',
    desc: '最新版接口，指向最新版本模型,支持5K tokens输入+2K tokens输出',
  },
  {
    key: 'ernie-4.0-turbo-8k',
    name: 'ERNIE-4.0-Turbo-8K',
    path: 'chat/ernie-4.0-turbo-8k',
    desc: '综合效果表现出色，广泛适用于各领域复杂任务场景',
  },
  {
    key: 'ernie_speed',
    name: 'ERNIE-Speed-8K',
    path: 'chat/ernie_speed',
    desc: '通用能力优异，适合作为基座模型进行精调，更好地处理特定场景问题，同时具备极佳的推理性能',
  },
  {
    key: 'ernie_speed',
    name: 'ERNIE-Bot-4',
    path: 'chat/ernie_speed',
    desc: '通用能力优异，适合作为基座模型进行精调，更好地处理特定场景问题，同时具备极佳的推理性能',
  },
];

/**
 *
 * @param key model url last
 * @param strictMode validate mode
 * @returns
 */
export function findModelRouter(
  key: WXAI.ModelRouteKeyType,
  path: string,
  strictMode?: boolean,
) {
  const mRouter = wxaiRegisteredRoutes.find((it) => it.key === key);

  if (strictMode && !mRouter) {
    throw new Error(`当前不支持${key} 模型`);
  } else if (!mRouter && /^[a-z0-9\-_\.]+$/.test(key)) {
    // fix old Bot
    return {
      key: key,
      name: key,
      path: path?.length ? path : `chat/${key}`,
      desc: DefaultRouterDesc,
    } as WXAI.ModelRouterType;
  } else {
    return {
      key: 'completions',
      name: key,
      path: path?.length ? path : `chat/completions`,
      desc: DefaultRouterDesc,
    } as WXAI.ModelRouterType;
  }
  return mRouter;
}
