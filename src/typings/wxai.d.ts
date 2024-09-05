declare namespace WXAI {
  type ModelRouteKeyType =
    | 'completions_pro'
    | 'ernie-4.0-8k-latest'
    | 'ernie-4.0-turbo-8k'
    | 'ernie-lite-8k'
    | 'ernie_speed'
    | string;

  type WxaiConfigType = {
    appId: string;
    name: string;
    apiKey: string;
    apiSecret: string;
  };

  type ModelRouterType = {
    key: ModelRouteKeyType;
    path: string;
    name: string;
    desc: string;
  };

  type GetModelUrlOptionType = {
    strictMode?: boolean;
    token?: string;
    path?: string;
  };

  type AccessTokenType = {
    refresh_token: string;
    expires_in: number;
    session_key: string;
    access_token: string;
    scope: string;
    session_secret: string;
  };

  type WxaiOptionType = {
    temperature?: number;
    top_p?: number;
    penalty_score?: number;
    system?: string;
    user_id?: string;
    [key: string]: any;
  };

  type AIMessage = {
    role: 'user' | 'assistant';
    content: string;
    name?: string;
  };

  type ChatAPIRequestOptions = {
    stream?: boolean;
    messages: Array<AIMessage>;
  } & WxaiOptionType;

  type WxaiChatReqOptions = {
    tid?: string; // topic uuid
    text: string;
    model: ModelRouteKeyType;
    uid: string;
    stream?: boolean;
    options?: WxaiOptionType;
    abortSignal?: AbortSignal;
    timeoutMs?: number;
  };

  type WxaiUsage = {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };

  type WxaiSuccessType = {
    id: string;
    object?: 'chat.completion' | string;
    created: number;
    result: string;
    usage: WxaiUsage;
    sentence_id?: number;
    is_end?: boolean;
    is_truncated?: boolean;
    [k: string]: any;
  };

  type WxaiErrorType = {
    error_code: number;
    error_msg?: string;
  };

  type WxaiReponseType = WxaiSuccessType | WxaiErrorType;
}
