import { Injectable } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { z } from "zod";

import { AI, Completion } from "../../src/decorators";
import { AiModule } from "../../src/module/ai.module";
import { AiOrchestratorService } from "../../src/orchestrator/ai-orchestrator.service";
import { AiProvider } from "../../src/providers/ai-provider.interface";
import { AiStreamChunk } from "../../src/types/ai.types";

@AI({ provider: "e2e-provider", model: "fixture-model" })
@Injectable()
class E2eDecoratedService {
  @Completion({
    schema: z.object({
      text: z.string(),
    }),
  })
  ask(_prompt: string): { text: string } {
    return { text: "" };
  }
}

async function collectChunks<TOutput>(
  chunks: AsyncIterable<AiStreamChunk<TOutput>>,
): Promise<AiStreamChunk<TOutput>[]> {
  const output: AiStreamChunk<TOutput>[] = [];
  for await (const chunk of chunks) {
    output.push(chunk);
  }

  return output;
}

describe("Nestelligence e2e", () => {
  let moduleRef: TestingModule | undefined;

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
    moduleRef = undefined;
  });

  it("bootstraps testing module and executes decorated service through orchestrator", async () => {
    const execute = jest
      .fn()
      .mockResolvedValue({ output: { text: "hello from execute" } });
    const provider: AiProvider = {
      name: "e2e-provider",
      execute,
    };

    moduleRef = await Test.createTestingModule({
      imports: [AiModule.forRoot({ providers: [provider] })],
      providers: [E2eDecoratedService],
    }).compile();
    await moduleRef.init();

    const orchestrator = moduleRef.get(AiOrchestratorService);
    const target = moduleRef.get(E2eDecoratedService);

    const result = await orchestrator.execute<{ text: string }>({
      target,
      methodName: "ask",
      input: "hello",
    });

    expect(result).toEqual({ text: "hello from execute" });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("streams in a bootstrapped module with decorated service metadata", async () => {
    const provider: AiProvider = {
      name: "e2e-provider",
      execute: jest.fn().mockResolvedValue({ output: { text: "unused" } }),
      async *stream<TOutput>() {
        yield { type: "delta", value: "partial" };
        yield {
          type: "done",
          output: { text: "hello from stream" } as unknown as TOutput,
        };
      },
    };

    moduleRef = await Test.createTestingModule({
      imports: [AiModule.forRoot({ providers: [provider] })],
      providers: [E2eDecoratedService],
    }).compile();
    await moduleRef.init();

    const orchestrator = moduleRef.get(AiOrchestratorService);
    const target = moduleRef.get(E2eDecoratedService);

    const chunks = await collectChunks(
      orchestrator.stream<{ text: string }>({
        target,
        methodName: "ask",
      }),
    );

    expect(chunks).toEqual([
      { type: "delta", value: "partial" },
      { type: "done", output: { text: "hello from stream" } },
    ]);
  });
});