# REST Example

This document shows how to use Nestelligence in a standard NestJS REST API.

The example keeps the AI contract inside a decorated service and lets the controller call the orchestrator explicitly, which matches the current runtime design.

## What This Example Covers

- `@AI` on a service class.
- `@Completion` with a `zod` schema.
- `AiOrchestratorService` inside a REST controller.
- JSON and streaming responses.
- Provider registration with `AiModule.forRoot()`.

## Suggested Structure

```text
src/
  support/
    support-ai.service.ts
    support.controller.ts
    support.dto.ts
    demo-support.provider.ts
    app.module.ts
```

## 1. DTOs

```ts
// support.dto.ts
export class AskSupportDto {
  question!: string;
}

export class SupportAnswerDto {
  answer!: string;
}
```

## 2. AI Contract Service

The method body is only a contract anchor for metadata. The orchestrator executes the provider, not this method body directly.

```ts
// support-ai.service.ts
import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { AI, Completion } from "../src/decorators";

const SupportAnswerSchema = z.object({
  answer: z.string(),
});

@AI({
  provider: "demo-support",
  model: "demo-model",
})
@Injectable()
export class SupportAiService {
  @Completion({
    schema: SupportAnswerSchema,
  })
  answer(question: string): { answer: string } {
    return { answer: question };
  }
}
```

## 3. Provider

This example uses a local fake provider so the REST flow is easy to understand without requiring an external API key.

```ts
// demo-support.provider.ts
import { AiProvider } from "../src/providers/ai-provider.interface";

export const demoSupportProvider: AiProvider = {
  name: "demo-support",

  async execute(request) {
    const question = String(request.input ?? "");

    return {
      output: {
        answer: `Demo answer for: ${question}`,
      },
    };
  },

  async *stream(request) {
    const question = String(request.input ?? "");

    yield {
      type: "delta",
      value: "Thinking about the answer...",
    };

    yield {
      type: "done",
      output: {
        answer: `Demo answer for: ${question}`,
      },
    };
  },
};
```

## 4. REST Controller

The controller calls the orchestrator explicitly and passes the decorated service instance plus method name.

```ts
// support.controller.ts
import { Body, Controller, MessageEvent, Post, Sse } from "@nestjs/common";
import { from, map, Observable } from "rxjs";

import { AiOrchestratorService } from "../src/orchestrator/ai-orchestrator.service";
import { AskSupportDto, SupportAnswerDto } from "./support.dto";
import { SupportAiService } from "./support-ai.service";

@Controller("support")
export class SupportController {
  constructor(
    private readonly orchestrator: AiOrchestratorService,
    private readonly supportAi: SupportAiService,
  ) {}

  @Post("answer")
  async answer(@Body() dto: AskSupportDto): Promise<SupportAnswerDto> {
    return this.orchestrator.execute<SupportAnswerDto>({
      target: this.supportAi,
      methodName: "answer",
      input: dto.question,
    });
  }

  @Sse("answer/stream")
  answerStream(@Body() dto: AskSupportDto): Observable<MessageEvent> {
    return from(
      this.orchestrator.stream<SupportAnswerDto>({
        target: this.supportAi,
        methodName: "answer",
        input: dto.question,
      }),
    ).pipe(
      map((chunk) => ({
        data: chunk,
      })),
    );
  }
}
```

## 5. App Module

```ts
// app.module.ts
import { Module } from "@nestjs/common";

import { AiModule } from "../src/module/ai.module";
import { demoSupportProvider } from "./demo-support.provider";
import { SupportAiService } from "./support-ai.service";
import { SupportController } from "./support.controller";

@Module({
  imports: [
    AiModule.forRoot({
      providers: [demoSupportProvider],
    }),
  ],
  controllers: [SupportController],
  providers: [SupportAiService],
})
export class AppModule {}
```

## 6. Example Requests

JSON endpoint:

```bash
curl -X POST http://localhost:3000/support/answer \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I connect Nestelligence to REST?"}'
```

Expected response:

```json
{
  "answer": "Demo answer for: How do I connect Nestelligence to REST?"
}
```

Streaming endpoint:

```bash
curl -N -X POST http://localhost:3000/support/answer/stream \
  -H "Content-Type: application/json" \
  -d '{"question":"Give me the short answer."}'
```

## Notes

- `@AI` is required on the class so the orchestrator can resolve defaults.
- `@Completion` defines the method-level behavior and schema.
- The provider can be swapped later for a real cloud or local adapter.
- The controller stays standard NestJS REST, which keeps the integration easy to adopt.
