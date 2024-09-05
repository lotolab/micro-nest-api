# CI 

## Git tags

```bash
# commit code & push
# create new Tag : 
git tag -a <tag_name> -m "message"

# push all tags
git push --tags

```


## CI changelog
- websockets & socket.io & axios

```bash

```


好的,我来为您提供一个使用 NestJS 实现 ChatGPT 流式 API 的示例。我们将使用 NestJS 的 WebSocket 模块来建立与 ChatGPT 的实时双向通信。
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import axios, { AxiosResponse } from 'axios';

@WebSocketGateway()
export class ChatGptGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = 'your_api_key_here';

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  async handleMessage(client: Socket, message: any) {
    try {
      const response: AxiosResponse = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message.prompt }],
          stream: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          responseType: 'stream',
        }
      );

      response.data.on('data', (chunk) => {
        const data = JSON.parse(chunk.toString());
        if (data.choices?.[0]?.delta?.content) {
          client.emit('response', data.choices[0].delta.content);
        }
      });

      response.data.on('end', () => {
        client.emit('response', '[DONE]');
      });
    } catch (error) {
      console.error('Error:', error);
      client.emit('error', 'An error occurred while processing your request.');
    }
  }
}

在这个示例中,我们创建了一个 ChatGptGateway 类,它实现了 NestJS 的 WebSocketGateway 接口。这个网关将处理与客户端的 WebSocket 连接,并将客户端的消息转发给 ChatGPT API。

我们使用 axios 库向 ChatGPT API 发送 POST 请求,并将 stream 选项设置为 true。这样,API 响应将以流的形式返回,我们可以将每个数据块发送给客户端。

当客户端连接或断开连接时,我们会记录相关信息。当客户端发送消息时,我们会将消息转发给 ChatGPT API,并将 API 的响应流式传输给客户端。如果出现任何错误,我们会将错误消息发送给客户端。

接下来,我们需要在 app.module.ts 文件中注册 ChatGptGateway:

import { Module } from '@nestjs/common';
import { ChatGptGateway } from './chat-gpt/chat-gpt.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [ChatGptGateway],
})
export class AppModule {}

# https://blog.stackademic.com/unlocking-stream-capabilities-in-openai-chat-integration-d9ab49c4659d
