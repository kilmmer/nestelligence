import "reflect-metadata";

import {
  Agent,
  AI,
  Chat,
  Completion,
  Context,
  Memory,
  Tool,
} from "../../src/decorators";
import { AiMetadataError } from "../../src/errors";
import { MetadataResolver } from "../../src/metadata/metadata.resolver";

describe("MetadataResolver", () => {
  it("resolves metadata and merges class, method and runtime options", () => {
    @AI({
      provider: "class-provider",
      model: "class-model",
      policy: "safe",
      stream: true,
      autoRun: true,
      metadata: { from: "class" },
    })
    @Tool({ name: "class-tool" })
    @Memory({ store: "class-memory" })
    @Context({ source: "class-context" })
    class Target {
      @Tool({ name: "method-tool" })
      @Memory({ store: "method-memory" })
      @Context({ source: "method-context" })
      @Chat({ model: "method-model", autoRun: false, temperature: 0.2 })
      run(): string {
        return "ok";
      }
    }

    const resolver = new MetadataResolver();
    const resolved = resolver.resolveMethodMetadata(new Target(), "run", {
      provider: "runtime-provider",
      temperature: 0.8,
      metadata: { from: "runtime" },
    });

    expect(resolved.kind).toBe("chat");
    expect(resolved.classOptions).toEqual({
      provider: "class-provider",
      model: "class-model",
      policy: "safe",
      stream: true,
      autoRun: true,
      metadata: { from: "class" },
    });

    expect(resolved.options.provider).toBe("runtime-provider");
    expect(resolved.options.model).toBe("method-model");
    expect(resolved.options.policy).toBe("safe");
    expect(resolved.options.temperature).toBe(0.8);
    expect(resolved.options.metadata).toEqual({ from: "runtime" });
    expect(resolved.options.stream).toBe(false);
    expect(resolved.options.autoRun).toBe(false);

    expect(resolved.tools).toEqual([
      { name: "class-tool" },
      { name: "method-tool" },
    ]);
    expect(resolved.memory).toEqual([
      { store: "class-memory" },
      { store: "method-memory" },
    ]);
    expect(resolved.context).toEqual([
      { source: "class-context" },
      { source: "method-context" },
    ]);
  });

  it("applies stream=false and autoRun=false defaults when not configured", () => {
    @AI({ provider: "default-provider" })
    class Target {
      @Completion()
      run(): string {
        return "ok";
      }
    }

    const resolver = new MetadataResolver();
    const resolved = resolver.resolveMethodMetadata(Target, "run");

    expect(resolved.kind).toBe("completion");
    expect(resolved.options.provider).toBe("default-provider");
    expect(resolved.options.stream).toBe(false);
    expect(resolved.options.autoRun).toBe(false);
  });

  it("respects precedence runtime > method > class", () => {
    @AI({
      provider: "class-provider",
      model: "class-model",
      stream: true,
      autoRun: true,
    })
    class Target {
      @Agent({
        provider: "method-provider",
        model: "method-model",
        stream: false,
        autoRun: false,
      })
      run(): string {
        return "ok";
      }
    }

    const resolver = new MetadataResolver();
    const resolved = resolver.resolveMethodMetadata(new Target(), "run", {
      provider: "runtime-provider",
      stream: true,
      autoRun: true,
    });

    expect(resolved.kind).toBe("agent");
    expect(resolved.options.provider).toBe("runtime-provider");
    expect(resolved.options.model).toBe("method-model");
    expect(resolved.options.stream).toBe(true);
    expect(resolved.options.autoRun).toBe(true);
  });

  it("throws AiMetadataError when invocation metadata is missing", () => {
    @AI({ provider: "openai" })
    class Target {
      run(): string {
        return "ok";
      }
    }

    const resolver = new MetadataResolver();

    let thrown: unknown;
    try {
      resolver.resolveMethodMetadata(new Target(), "run");
    } catch (error: unknown) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AiMetadataError);
    const aiError = thrown as AiMetadataError;
    expect(aiError.code).toBe("AI_METADATA_ERROR");
    expect(aiError.message).toContain(
      'No AI invocation metadata found on method "run".',
    );
    expect(aiError.details).toEqual({ methodName: "run" });
  });

  it("throws AiMetadataError when @AI is missing on class", () => {
    class Target {
      @Chat()
      run(): string {
        return "ok";
      }
    }

    const resolver = new MetadataResolver();

    let thrown: unknown;
    try {
      resolver.resolveMethodMetadata(new Target(), "run");
    } catch (error: unknown) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AiMetadataError);
    const aiError = thrown as AiMetadataError;
    expect(aiError.code).toBe("AI_METADATA_ERROR");
    expect(aiError.message).toContain(
      '@AI() is required on class "Target" for AI method decorators.',
    );
    expect(aiError.details).toEqual({ className: "Target", methodName: "run" });
  });

  it("throws AiMetadataError when class target cannot be resolved", () => {
    const resolver = new MetadataResolver();
    const target = Object.create(null) as object;

    let thrown: unknown;
    try {
      resolver.resolveMethodMetadata(target, "run");
    } catch (error: unknown) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AiMetadataError);
    expect((thrown as AiMetadataError).message).toContain(
      "Unable to resolve class target for metadata.",
    );
  });

  it("resolves metadata when method metadata is stored on an own-property target", () => {
    @AI({ provider: "own-property-provider" })
    class Target {
      run(): string {
        return "ok";
      }
    }

    const instance = new Target();
    instance.run = instance.run.bind(instance);

    Reflect.defineMetadata(
      "nestelligence:method:invocation",
      {
        kind: "chat",
        options: {
          provider: "own-property-provider",
          stream: false,
          autoRun: false,
        },
      },
      instance,
      "run",
    );

    const resolver = new MetadataResolver();
    const resolved = resolver.resolveMethodMetadata(instance, "run");

    expect(resolved.kind).toBe("chat");
    expect(resolved.options.provider).toBe("own-property-provider");
    expect(resolved.options.stream).toBe(false);
    expect(resolved.options.autoRun).toBe(false);
  });

  it("covers resolver fallback branches for nullable metadata and prototype-less targets", () => {
    const resolver = new MetadataResolver() as unknown as {
      mergeInvocationOptions: (
        classOptions: Record<string, unknown>,
        methodOptions: Record<string, unknown>,
        runtimeOptions: Record<string, unknown>,
      ) => { stream: boolean; autoRun: boolean; provider?: string };
      getMetadataList: <TValue>(
        key: string,
        target: object,
        propertyKey?: string | symbol,
      ) => TValue[];
      resolveMethodTarget: (
        target: object,
        methodName: string | symbol,
      ) => object;
    };

    expect(
      resolver.mergeInvocationOptions(
        { provider: "class-provider", stream: true, autoRun: true },
        { provider: "method-provider" },
        { provider: "runtime-provider" },
      ),
    ).toMatchObject({
      provider: "runtime-provider",
      stream: true,
      autoRun: true,
    });

    expect(
      resolver.mergeInvocationOptions(
        { provider: "class-provider", stream: true, autoRun: true },
        { provider: "method-provider", stream: false, autoRun: false },
        { provider: "runtime-provider" },
      ),
    ).toMatchObject({
      provider: "runtime-provider",
      stream: false,
      autoRun: false,
    });

    expect(
      resolver.mergeInvocationOptions(
        { provider: "class-provider", stream: true, autoRun: true },
        { provider: "method-provider", stream: true, autoRun: true },
        { provider: "runtime-provider", stream: false, autoRun: false },
      ),
    ).toMatchObject({
      provider: "runtime-provider",
      stream: false,
      autoRun: false,
    });

    const metadataTarget = {};
    Reflect.defineMetadata("custom:list", { value: 1 }, metadataTarget);
    expect(resolver.getMetadataList("custom:list", metadataTarget)).toEqual([
      { value: 1 },
    ]);

    const prototypeLessTarget = Object.create(null) as object;
    expect(resolver.resolveMethodTarget(prototypeLessTarget, "run")).toBe(
      prototypeLessTarget,
    );
  });
});
