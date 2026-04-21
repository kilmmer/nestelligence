# WebSocket Example

This document shows how to use Nestelligence in a NestJS WebSocket gateway.

The gateway handles transport concerns, while the orchestrator handles AI execution and schema validation.

## What This Example Covers

- `@AI` on a service class.
- `@Chat` for socket-driven conversational requests.
- `AiOrchestratorService` inside a gateway.
- Event-based streaming responses.
- Provider registration with `AiModule.forRoot()`.

## Suggested Structure

```text
src/
  ws-support/
    ws-support-ai.service.ts
    ws-support.gateway.ts
    ws-support.dto.ts
    demo-ws-support.provider.ts
    app.module.ts
```

## 1. DTOs

```ts
// ws-support.dto.ts
export class WsSupportRequestDto {
  question!: string;
}

export class WsSupportResponseDto {
  answer!: string;
}
```

## 2. AI Contract Service

```ts
// ws-support-ai.service.ts
import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { AI, Chat } from "../src/decorators";

const WsSupportResponseSchema = z.object({
  answer: z.string(),
});

@AI({
  provider: "demo-ws-support",
  model: "demo-model",
})
@Injectable()
export class WsSupportAiService {
  @Chat({
    schema: WsSupportResponseSchema,
    stream: true,
  })
  answer(question: string): { answer: string } {
    return { answer: question };
  }
}
```

## 3. Provider

```ts
// demo-ws-support.provider.ts
import { AiProvider } from "../src/providers/ai-provider.interface";

export const demoWsSupportProvider: AiProvider = {
  name: "demo-ws-support",

  async execute(request) {
    const question = String(request.input ?? "");

    return {
      output: {
        answer: `WebSocket answer for: ${question}`,
      },
    };
  },

  async *stream(request) {
    const question = String(request.input ?? "");

    yield {
      type: "delta",
      value: "Preparing socket response...",
    };

    yield {
      type: "done",
      output: {
        answer: `WebSocket answer for: ${question}`,
      },
    };
  },
};
```

## 4. WebSocket Gateway

The gateway emits progress events and final answers back to the client.

```ts
// ws-support.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { AiOrchestratorService } from "../src/orchestrator/ai-orchestrator.service";
import { WsSupportAiService } from "./ws-support-ai.service";
import { WsSupportRequestDto, WsSupportResponseDto } from "./ws-support.dto";

@WebSocketGateway({ namespace: "/support" })
export class WsSupportGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly orchestrator: AiOrchestratorService,
    private readonly supportAi: WsSupportAiService,
  ) {}

  @SubscribeMessage("ask")
  async ask(
    @MessageBody() dto: WsSupportRequestDto,
    @ConnectedSocket() client: Socket,
  ): Promise<WsSupportResponseDto> {
    client.emit("status", { state: "thinking" });

    const result = await this.orchestrator.execute<WsSupportResponseDto>({
      target: this.supportAi,
      methodName: "answer",
      input: dto.question,
    });

    client.emit("answer", result);
    return result;
  }

  @SubscribeMessage("stream")
  async stream(
    @MessageBody() dto: WsSupportRequestDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    for await (const chunk of this.orchestrator.stream<WsSupportResponseDto>({
      target: this.supportAi,
      methodName: "answer",
      input: dto.question,
    })) {
      client.emit("chunk", chunk);
    }

    client.emit("stream:done");
  }
}
```

## 5. App Module

```ts
// app.module.ts
import { Module } from "@nestjs/common";

import { AiModule } from "../src/module/ai.module";
import { demoWsSupportProvider } from "./demo-ws-support.provider";
import { WsSupportAiService } from "./ws-support-ai.service";
import { WsSupportGateway } from "./ws-support.gateway";

@Module({
  imports: [
    AiModule.forRoot({
      providers: [demoWsSupportProvider],
    }),
  ],
  providers: [WsSupportAiService, WsSupportGateway],
})
export class AppModule {}
```

## 6. Example Client Messages

Client emits:

```json
{
  "event": "ask",
  "data": {
    "question": "How do I connect Nestelligence to WebSocket?"
  }
}
```

Expected `answer` event:

```json
{
  "answer": "WebSocket answer for: How do I connect Nestelligence to WebSocket?"
}
```

Streaming client emits:

```json
{
  "event": "stream",
  "data": {
    "question": "Give me progress chunks."
  }
}
```

Example chunk events:

```json
{
  "type": "delta",
  "value": "Preparing socket response..."
}
```

```json
{
  "type": "done",
  "output": {
    "answer": "WebSocket answer for: Give me progress chunks."
  }
}
```

## Notes

- WebSocket gateways should stay transport-focused; the orchestrator does the AI heavy lifting.
- Use `stream` when you want chunked progress updates back to the socket client.
- `@AI` and `@Chat` keep the AI contract declarative and testable.
