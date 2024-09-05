type FetchFn = typeof fetch;
type FetchLoggedType = 'beforeRequest' | 'onCompletion' | 'onFail';
type FetchLoggedFn = (type: FetchLoggedType, data?: any) => void;
type HandlePromptFn<T> = (tid: string, content?: string | Array<T>) => Array<T>;
type CreateAIMsgIdFn = (responseMsgId?: string) => string;
type OnStreamProcessFn<T> = (partialResponse: T) => void;
type SSEMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'ALL'
  | 'OPTIONS'
  | 'HEAD'
  | 'SEARCH';
type AIType = 'wxai' | 'gpt' | 'mj';
type TokenUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

type SSEErrorDataType = {
  name?: string;
  code: number;
  message?: string;
};

type SSEChatProcessBaseOptions = {
  cliid?: string | string[];
  ip?: string;
  model?: string;
  reqid: string;
  uid: number;
  username: string;
  startTime?: number;
};

type SSEChatProcessOptions = SSEChatProcessBaseOptions & {
  cacheKey?: string;
  preprocess?: (dto: WxaiChatProcessReqDto) => WxaiChatProcessReqDto;
  onOpen?: (key: string, cacheData: SSETaskQueueCacheData) => void;
  onMessage?: (data?: any, key?: string) => void;
  onError?: (err: SSEErrorDataType, key?: string) => void;
  onEnd?: (key?: string, startTime: number) => void;
  [k: string]: any;
};

type SSETaskQueueCacheData = SSEChatProcessBaseOptions & {
  prompt?: string;
  status: number; //task control status 0 create ,1 -locked
  usage?: TokenUsage;
  created: number;
  completed?: boolean;
  endTime?: number;
  error?: SSEErrorDataType;
  data?: Record<string, any>;
  result?: string;
  costTime?: string;
  aitype?: string;
  aiopts?: any; // ai opts
  reqData?: Record<string, any>;
  [k: string]: any;
};
