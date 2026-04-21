# GraphQL Example

This document shows how to use Nestelligence in a NestJS GraphQL API.

The pattern is the same as the REST example: keep the AI metadata in a decorated service, then have the resolver call the orchestrator explicitly.

## What This Example Covers

- `@AI` on a service class.
- `@Agent` for a GraphQL-oriented interaction.
- `AiOrchestratorService` inside a resolver.
- Query, mutation, and subscription examples.
- Provider registration with `AiModule.forRoot()`.

## Suggested Structure

```text
src/
  gql-support/
    gql-support-ai.service.ts
    gql-support.resolver.ts
    gql-support.types.ts
    demo-gql-support.provider.ts
    app.module.ts
```

## 1. GraphQL Types

```ts
// gql-support.types.ts
import { Field, InputType, ObjectType } from "@nestjs/graphql";

@InputType()
export class AskSupportInput {
  @Field()
  question!: string;
}

@ObjectType()
export class SupportAnswer {
  @Field()
  answer!: string;
}
```

## 2. AI Contract Service

The service keeps the AI contract and schema metadata. The resolver invokes the orchestrator.

```ts
// gql-support-ai.service.ts
import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { AI, Agent } from "../src/decorators";

const SupportAnswerSchema = z.object({
  answer: z.string(),
});

@AI({
  provider: "demo-gql-support",
  model: "demo-model",
})
@Injectable()
export class GqlSupportAiService {
  @Agent({
    schema: SupportAnswerSchema,
    autoRun: true,
  })
  answer(question: string): { answer: string } {
    return { answer: question };
  }
}
```

## 3. Provider

This local provider keeps the example independent of external services.

```ts
// demo-gql-support.provider.ts
import { AiProvider } from "../src/providers/ai-provider.interface";

export const demoGqlSupportProvider: AiProvider = {
  name: "demo-gql-support",

  async execute(request) {
    const question = String(request.input ?? "");

    return {
      output: {
        answer: `GraphQL answer for: ${question}`,
      },
    };
  },

  async *stream(request) {
    const question = String(request.input ?? "");

    yield {
      type: "delta",
      value: "Resolving GraphQL answer...",
    };

    yield {
      type: "done",
      output: {
        answer: `GraphQL answer for: ${question}`,
      },
    };
  },
};
```

## 4. Resolver

```ts
// gql-support.resolver.ts
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { MessageEvent } from "@nestjs/common";
import { from, map, Observable } from "rxjs";

import { AiOrchestratorService } from "../src/orchestrator/ai-orchestrator.service";
import { GqlSupportAiService } from "./gql-support-ai.service";
import { AskSupportInput, SupportAnswer } from "./gql-support.types";

@Resolver(() => SupportAnswer)
export class GqlSupportResolver {
  constructor(
    private readonly orchestrator: AiOrchestratorService,
    private readonly supportAi: GqlSupportAiService,
  ) {}

  @Query(() => SupportAnswer)
  async supportAnswer(
    @Args("input") input: AskSupportInput,
  ): Promise<SupportAnswer> {
    return this.orchestrator.execute<SupportAnswer>({
      target: this.supportAi,
      methodName: "answer",
      input: input.question,
    });
  }

  @Mutation(() => SupportAnswer)
  async askSupport(
    @Args("input") input: AskSupportInput,
  ): Promise<SupportAnswer> {
    return this.orchestrator.execute<SupportAnswer>({
      target: this.supportAi,
      methodName: "answer",
      input: input.question,
    });
  }

  @Subscription(() => String, {
    resolve: (payload: string) => payload,
  })
  answerStream(@Args("input") input: AskSupportInput): Observable<string> {
    return from(
      this.orchestrator.stream<SupportAnswer>({
        target: this.supportAi,
        methodName: "answer",
        input: input.question,
      }),
    ).pipe(map((chunk) => JSON.stringify(chunk)));
  }
}
```

## 5. App Module

```ts
// app.module.ts
import { Module } from "@nestjs/common";

import { AiModule } from "../src/module/ai.module";
import { demoGqlSupportProvider } from "./demo-gql-support.provider";
import { GqlSupportAiService } from "./gql-support-ai.service";
import { GqlSupportResolver } from "./gql-support.resolver";

@Module({
  imports: [
    AiModule.forRoot({
      providers: [demoGqlSupportProvider],
    }),
  ],
  providers: [GqlSupportAiService, GqlSupportResolver],
})
export class AppModule {}
```

## 6. Example Request

GraphQL mutation:

```graphql
mutation AskSupport($input: AskSupportInput!) {
  askSupport(input: $input) {
    answer
  }
}
```

Variables:

```json
{
  "input": {
    "question": "How do I use Nestelligence in GraphQL?"
  }
}
```

Expected response:

```json
{
  "data": {
    "askSupport": {
      "answer": "GraphQL answer for: How do I use Nestelligence in GraphQL?"
    }
  }
}
```

## Notes

- GraphQL is modeled exactly like REST: the resolver remains standard NestJS, and the orchestrator owns AI execution.
- `@Agent` is a good fit when you want a more workflow-like GraphQL operation.
- Subscriptions can be used to surface streamed chunks or a final stream summary.
