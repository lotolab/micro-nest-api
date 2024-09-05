# Proxy AI fetch SDK

- fetch 对 400，500 都当做成功的请求，需要封装去处理
- 用于访问和操纵 HTTP 管道的一些具体部分

## tech links

- Pipe : https://www.51cto.com/article/647605.html

- https://medium.com/@sherbolotarbaev/building-a-nest-js-microservice-for-openai-and-chatgpt-integration-ca9424cd22c3

- NEST SSE https://stackoverflow.com/questions/75773659/how-to-create-a-post-streaming-sse-api-with-nestjs-and-fastify-like-openais-ap

- https://medium.com/@mohdejazsiddiqui/how-to-stream-openai-completion-model-response-to-client-in-nextjs-2206d3c48c1b

- https://www.niraj.life/blog/exploring-server-sent-events-sse-nestjs/

### fetch api 

> [](https://juejin.cn/post/7086722767567421454)

> [Fetch MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)

> [](https://stackoverflow.com/questions/75773659/how-to-create-a-post-streaming-sse-api-with-nestjs-and-fastify-like-openais-ap)

```ts
fetch(url,options):Reponse 


```

```yaml
options:
    body: http请求参数
    mode: 指定请求模式
        cros:允许跨域（为默认值）
        same-origin:只允许同源请求;
        no-cros:只限于get、post和head,并且只能使用有限的几个简单标头。
    cache : 用户指定缓存。
    method : 请求方法，默认GET
    signal : 用于取消 fetch
    headers : http请求头设置
    keepalive : 用于页面卸载时，告诉浏览器在后台保持连接，继续发送数据。
    credentials : cookie设置，
        omit:忽略不带cookie（默认），
        same-origin:同源请求带cookie，
        inclue:无论跨域还是同源都会带cookie。        
```

- 返回 Reponse

> Response 接口 [https://developer.mozilla.org/zh-CN/docs/Web/API/Response]

```yaml
ok: 包含了一个布尔值，标示该 Response 成功（HTTP 状态码的范围在 200-299）
redirected : 是否来自一个重定向，如果是的话，它的 URL 列表将会有多个条目
status: 包含 Response 的状态码（例如 200 表示成功）
statusText: 包含了与该 Response 状态码一致的状态信息
type: 包含 Response 的类型（例如，basic、cors）
url: 包含 Response 的 URL
body: 一个简单的 getter，用于暴露一个 ReadableStream 类型的 body 内容
```

```ts
# 读取 Response 对象并且将它设置为已读（因为 Responses 对象被设置为了 stream 的方式，所以它们只能被读取一次），并返回一个被解析为 JSON 格式的 Promise 对象
Body.json()

# 读取 Response 对象并且将它设置为已读（因为 Responses 对象被设置为了 stream 的方式，所以它们只能被读取一次），并返回一个被解析为 USVString 格式的 Promise 对象
Body.text()
```

- openai 

```text
{"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{"role":"assistant","content":""},"logprobs":null,"finish_reason":null}]}

{"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{"content":"Hello"},"logprobs":null,"finish_reason":null}]}

....

{"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}]}

```