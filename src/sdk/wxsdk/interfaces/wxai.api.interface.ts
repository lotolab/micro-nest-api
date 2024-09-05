/**
 *
 */
export interface ClientAPIRequestOptions {
  url: string;
  method?: SSEMethod;
  model?: string;
  headers?: Record<string, string>;
  data: WXAI.ChatAPIRequestOptions;
  fetchFn?: FetchFn;
  timeoutMs?: number;
  abortSignal?: AbortSignal;
  onProcess?: OnStreamProcessFn<WXAI.WxaiReponseType>;
}

/**
 *
 */
export interface ClientAPIConstructOptions {
  appId?: string;
  debug?: boolean;
  createdMsgId?: (responseId?: string) => string; // create ai response message id
  headers?: Record<string, string>;
  handlePrompt?: HandlePromptFn<WXAI.AIMessage>; // 预处理prompt
  logged?: FetchLoggedFn;
  abortSignal?: AbortSignal;
  fetchFn?: FetchFn;
}

export interface WxaiChatProcessReqDto {
  model?: string;
  tid?: string;
  uuid?: number;
  text?: string;
  messages?: Array<WXAI.AIMessage>;
  aiopts?: WXAI.WxaiOptionType;
  [k: string]: any;
}

/**
 * API gateway wrap parameter options
 */
export interface WxaiChatProcessOptions {
  cliid?: string | string[];
  ip?: string;
  reqid: string | string[];
  uid: number;
  username: string;
  [k: string]: any;
}
