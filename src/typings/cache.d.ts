type CacheRedisConfigSchema = {
  host: string;
  port: number;
  db: number;
  passport?: string;
  username?: string;
  ttl?: number;
};

type BuildRedisBizKeyFn = (...args: Array<string | number>) => string;

type PromptEngineeringTemplateCached = {
  id: number;
  title: string;
  uuid: number;
  template: string;
  aiType: AiProviderEnum;
  modelName: string;
  apiType?: string;
  status?: StatusEnum;
  tid?: string;
  systemMessage?: string;
  temperature?: number;
  penaltyScore?: number;
  messages?: Array<ChatMessage>;
};
