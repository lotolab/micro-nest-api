# Stream API 

> ![SSE_CLIENT](https://bj.chenenkou.com/jishu/119.html)

## Front SSE Wrapper 

- loto-stream-reqid in header 
- auth token in header

## Back post 

- catch request and response into cache
- user prompt engineering cache : key : wxai:uid:prompt:peid -- value {peid,uid,tid,model,messages,system,...}

```ts
// key-value key   wxai:reqid - cache value
type AIRespCacheData = {
    id?:string;
    error_code?:string;
    error_msg?:string;
    result?:string;
    res?:Array<Record<string,any>>
}

type AIRequestCacheData = {
    tid?:number; // topic template id
    peid?:string; // 客户端 Prompt engineer id
    options?:
    messages:Array<WXAI.AIMessage>;
}

type AICacheExtrData = {
    aitype: string; // wxai,gpt,
    cliid?:string;
    ip?:string;
    aiurl?: string;
    username?:string;
    uid?:number
}

type AICacheData = {
    reqid: string; //'xxxxxxxx',
    completed?:bool;
    error?: string;
    created:number; // 请求时间
    firstResponsed:number; // 第一次响应时间
    lastResponsed:number; // 最后一次响应时间
    reqData:Record<string,any> //原始data
    respData:AIRespCacheData
    result?:string
} & AICacheExtrData

```

### 后端封装

- AICacheLogService 

```ts
interface AICacheLogService {
    // create or update
    createRequestCache:(reqid:string,reqData:Record<string,any>,extrData?:AICacheExtrData)=>void;
    // update if reqid will throw error
    updateSomeCache:(reqid:string,Partial<AICacheData>)=>void
    errorCache:(reqid:string,errCode:string;errMsg:string)=>void
}

//
class WxaiCacheLogService implement AICacheLogService {

}

```