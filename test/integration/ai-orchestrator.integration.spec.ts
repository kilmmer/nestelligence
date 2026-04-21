import { z } from "zod";

import { AI, Completion } from "../../src/decorators";
import {
  AiAbortError,
  AiConfigurationError,
  AiProviderExecutionError,
  AiSchemaValidationError,
  AiStreamNotSupportedError,
} from "../../src/errors";
import { MetadataResolver } from "../../src/metadata/metadata.resolver";
import { AiOrchestratorService } from "../../src/orchestrator/ai-orchestrator.service";
import { AiProvider } from "../../src/providers/ai-provider.interface";
import { AiProviderRegistry } from "../../src/providers/ai-provider.registry";
import { AiStreamChunk } from "../../src/types/ai.types";

@AI({ provider: "fake-provider", model: "test-model" })
class OrchestratorFixture {
  @Completion()
  complete(_input: string): string {
    return "";
  }

  @Completion()
  structured(): unknown {
    return {};
  }
}

@AI()
class MissingProviderFixture {
  @Completion()
  run(): string {
    return "";
  }
}

@AI({ provider: "no-stream-provider" })
class NoStreamFixture {
  @Completion()
  run(): string {
    return "";
  }
}

function createOrchestrator(providers: AiProvider[]): AiOrchestratorService {
  const metadataResolver = new MetadataResolver();
  const registry = new AiProviderRegistry();
  registry.registerMany(providers);

  return new AiOrchestratorService(metadataResolver, registry);
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

describe("AiOrchestratorService integration", () => {
  it("execute returns output from provider", async () => {
    const execute = jest.fn().mockResolvedValue({ output: "provider-result" });
    const provider: AiProvider = {
      name: "fake-provider",
      execute,
    };
    const orchestrator = createOrchestrator([provider]);

    const result = await orchestrator.execute<string>({
      target: new OrchestratorFixture(),
      methodName: "complete",
      input: "hello",
    });

    expect(result).toBe("provider-result");
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "completion",
        methodName: "complete",
        input: "hello",
        options: expect.objectContaining({
          provider: "fake-provider",
          model: "test-model",
          stream: false,
          autoRun: false,
        }),
      }),
    );
  });

  it("execute wraps unknown provider failures", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("provider boom"));
    const provider: AiProvider = {
      name: "fake-provider",
      execute,
    };
    const orchestrator = createOrchestrator([provider]);

    let thrown: unknown;
    try {
      await orchestrator.execute({
        target: new OrchestratorFixture(),
        methodName: "complete",
      });
    } catch (error: unknown) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AiProviderExecutionError);
    expect(thrown).toMatchObject({
      code: "AI_PROVIDER_EXECUTION_ERROR",
    });
  });

  it("validates execute output with zod schema successfully", async () => {
    const execute = jest.fn().mockResolvedValue({
      output: { value: "ok" },
    });
    const provider: AiProvider = {
      name: "fake-provider",
      execute,
    };
    const orchestrator = createOrchestrator([provider]);

    const result = await orchestrator.execute<{ value: string }>({
      target: new OrchestratorFixture(),
      methodName: "structured",
      options: {
        schema: z.object({ value: z.string() }),
      },
    });

    expect(result).toEqual({ value: "ok" });
  });

  it("throws schema validation error when output does not match zod schema", async () => {
    const execute = jest.fn().mockResolvedValue({
      output: { value: 42 },
    });
    const provider: AiProvider = {
      name: "fake-provider",
      execute,
    };
    const orchestrator = createOrchestrator([provider]);

    await expect(
      orchestrator.execute({
        target: new OrchestratorFixture(),
        methodName: "structured",
        options: {
          schema: z.object({ value: z.string() }),
        },
      }),
    ).rejects.toBeInstanceOf(AiSchemaValidationError);
  });

  it("throws abort error before execute when signal is already aborted", async () => {
    const execute = jest.fn().mockResolvedValue({ output: "ignored" });
    const provider: AiProvider = {
      name: "fake-provider",
      execute,
    };
    const orchestrator = createOrchestrator([provider]);
    const controller = new AbortController();
    controller.abort();

    await expect(
      orchestrator.execute({
        target: new OrchestratorFixture(),
        methodName: "complete",
        options: {
          abortSignal: controller.signal,
        },
      }),
    ).rejects.toBeInstanceOf(AiAbortError);

    expect(execute).not.toHaveBeenCalled();
  });

  it("stream yields chunks when provider supports streaming", async () => {
    const provider: AiProvider = {
      name: "fake-provider",
      execute: jest.fn().mockResolvedValue({ output: "unused" }),
      async *stream<TOutput>() {
        yield { type: "delta", value: "part-1" };
        yield { type: "done", output: "final" as unknown as TOutput };
      },
    };
    const orchestrator = createOrchestrator([provider]);

    const chunks = await collectChunks(
      orchestrator.stream<string>({
        target: new OrchestratorFixture(),
        methodName: "complete",
        options: {
          schema: z.string(),
        },
      }),
    );

    expect(chunks).toEqual([
      { type: "delta", value: "part-1" },
      { type: "done", output: "final" },
    ]);
  });

  it("throws abort error during stream when signal aborts mid-iteration", async () => {
    const controller = new AbortController();
    const provider: AiProvider = {
      name: "fake-provider",
      execute: jest.fn().mockResolvedValue({ output: "unused" }),
      async *stream<TOutput>() {
        yield { type: "delta", value: "first" };
        controller.abort();
        yield { type: "done", output: "second" as unknown as TOutput };
      },
    };
    const orchestrator = createOrchestrator([provider]);

    const iterator = orchestrator
      .stream<string>({
        target: new OrchestratorFixture(),
        methodName: "complete",
        options: {
          abortSignal: controller.signal,
        },
      })
      [Symbol.asyncIterator]();

    const first = await iterator.next();
    expect(first).toEqual({
      done: false,
      value: { type: "delta", value: "first" },
    });

    await expect(iterator.next()).rejects.toBeInstanceOf(AiAbortError);
  });

  it("throws stream-not-supported when provider has no stream implementation", async () => {
    const provider: AiProvider = {
      name: "no-stream-provider",
      execute: jest.fn().mockResolvedValue({ output: "unused" }),
    };
    const orchestrator = createOrchestrator([provider]);

    await expect(
      collectChunks(
        orchestrator.stream({
          target: new NoStreamFixture(),
          methodName: "run",
        }),
      ),
    ).rejects.toBeInstanceOf(AiStreamNotSupportedError);
  });

  it("wraps unknown stream failures from provider.stream", async () => {
    const provider: AiProvider = {
      name: "fake-provider",
      execute: jest.fn().mockResolvedValue({ output: "unused" }),
      async *stream() {
        throw new Error("stream boom");
      },
    };
    const orchestrator = createOrchestrator([provider]);

    await expect(
      collectChunks(
        orchestrator.stream({
          target: new OrchestratorFixture(),
          methodName: "complete",
        }),
      ),
    ).rejects.toMatchObject({
      code: "AI_PROVIDER_EXECUTION_ERROR",
    });
  });

  it("throws configuration error when execute has no configured provider", async () => {
    const orchestrator = createOrchestrator([]);

    await expect(
      orchestrator.execute({
        target: new MissingProviderFixture(),
        methodName: "run",
      }),
    ).rejects.toBeInstanceOf(AiConfigurationError);
  });

  it("throws configuration error when stream has no configured provider", async () => {
    const orchestrator = createOrchestrator([]);

    await expect(
      collectChunks(
        orchestrator.stream({
          target: new MissingProviderFixture(),
          methodName: "run",
        }),
      ),
    ).rejects.toBeInstanceOf(AiConfigurationError);
  });
});
