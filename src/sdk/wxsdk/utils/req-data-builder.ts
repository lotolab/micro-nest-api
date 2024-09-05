export function buildWxaiCommReqData(
  messages: Array<WXAI.AIMessage>,
  options?: WXAI.WxaiOptionType,
) {
  const {
    temperature = 0.8,
    top_p = 0.8,
    penalty_score,
    stream,
    system,
    stop,
    user_id,
    disable_search,
    enable_citation,
    enable_trace,
  } = options || {};

  return {
    messages,
    temperature,
    top_p,
    penalty_score,
    stream,
    system,
    stop,
    user_id,
    disable_search,
    enable_citation,
    enable_trace,
  };
}

export function buildErnie4_8k_latest(
  messages: Array<WXAI.AIMessage>,
  options?: WXAI.WxaiOptionType,
) {
  const {
    temperature = 0.8,
    top_p = 0.8,
    stream,
    system,
    stop,
    user_id,
    enable_system_memory,
    system_memory_id,
    disable_search,
    enable_citation,
    enable_trace,
  } = options || {};

  return {
    messages,
    temperature,
    top_p,
    stream,
    enable_system_memory,
    system_memory_id,
    system,
    stop,
    user_id,
    disable_search,
    enable_citation,
    enable_trace,
  };
}

export function buildWxaiReqData(
  messages: Array<WXAI.AIMessage>,
  modelKey: WXAI.ModelRouteKeyType = 'ernie_speed',
  options?: WXAI.WxaiOptionType,
): Record<string, any> {
  switch (modelKey) {
    case 'completions_pro':
      return buildWxaiCommReqData(messages, options);
    case 'ernie-4.0-8k-latest':
      return buildErnie4_8k_latest(messages, options);
    default:
      return buildWxaiCommReqData(messages, options);
  }
}
