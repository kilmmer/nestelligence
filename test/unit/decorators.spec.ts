import "reflect-metadata";

import { AI_METADATA_KEYS } from "../../src/constants/metadata-keys";
import {
  AI,
  Agent,
  Chat,
  Completion,
  Context,
  Embed,
  Memory,
  Tool,
} from "../../src/decorators";

describe("Decorators", () => {
  it("assigns class metadata with @AI", () => {
    const options = {
      provider: "openai",
      model: "gpt-4o-mini",
      autoRun: true,
    };

    @AI(options)
    class AiTarget {}

    const metadata = Reflect.getMetadata(AI_METADATA_KEYS.CLASS_AI, AiTarget);
    expect(metadata).toEqual(options);
  });

  it("defaults stream to false for @Chat, @Completion, @Embed and @Agent", () => {
    class InvocationTarget {
      @Chat()
      chat(): string {
        return "chat";
      }

      @Completion()
      completion(): string {
        return "completion";
      }

      @Embed()
      embed(): number[] {
        return [1, 2, 3];
      }

      @Agent()
      agent(): string {
        return "agent";
      }
    }

    const prototype = InvocationTarget.prototype;

    const chatOptions = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_CHAT,
      prototype,
      "chat",
    ) as { stream: boolean };
    expect(chatOptions.stream).toBe(false);

    const completionOptions = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_COMPLETION,
      prototype,
      "completion",
    ) as { stream: boolean };
    expect(completionOptions.stream).toBe(false);

    const embedOptions = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_EMBED,
      prototype,
      "embed",
    ) as { stream: boolean };
    expect(embedOptions.stream).toBe(false);

    const agentOptions = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_AGENT,
      prototype,
      "agent",
    ) as { stream: boolean };
    expect(agentOptions.stream).toBe(false);

    const chatInvocation = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_INVOCATION,
      prototype,
      "chat",
    ) as { kind: string; options: { stream: boolean } };
    expect(chatInvocation).toMatchObject({ kind: "chat" });
    expect(chatInvocation.options.stream).toBe(false);

    const completionInvocation = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_INVOCATION,
      prototype,
      "completion",
    ) as { kind: string; options: { stream: boolean } };
    expect(completionInvocation).toMatchObject({ kind: "completion" });
    expect(completionInvocation.options.stream).toBe(false);

    const embedInvocation = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_INVOCATION,
      prototype,
      "embed",
    ) as { kind: string; options: { stream: boolean } };
    expect(embedInvocation).toMatchObject({ kind: "embed" });
    expect(embedInvocation.options.stream).toBe(false);

    const agentInvocation = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_INVOCATION,
      prototype,
      "agent",
    ) as { kind: string; options: { stream: boolean } };
    expect(agentInvocation).toMatchObject({ kind: "agent" });
    expect(agentInvocation.options.stream).toBe(false);
  });

  it("ignores method decorators when descriptor value is not a function", () => {
    class InvalidDescriptorTarget {
      chat = "chat";
      completion = "completion";
      embed = "embed";
      agent = "agent";
    }

    const target = InvalidDescriptorTarget.prototype;
    const descriptor = { value: 42 } as PropertyDescriptor;

    Chat()(target, "chat", descriptor);
    Completion()(target, "completion", descriptor);
    Embed()(target, "embed", descriptor);
    Agent()(target, "agent", descriptor);

    expect(
      Reflect.getMetadata(AI_METADATA_KEYS.METHOD_CHAT, target, "chat"),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        AI_METADATA_KEYS.METHOD_COMPLETION,
        target,
        "completion",
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(AI_METADATA_KEYS.METHOD_EMBED, target, "embed"),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(AI_METADATA_KEYS.METHOD_AGENT, target, "agent"),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(AI_METADATA_KEYS.METHOD_INVOCATION, target, "chat"),
    ).toBeUndefined();
  });

  it("stores @Tool metadata for class and method and ignores property usage", () => {
    class ToolTarget {
      run(): string {
        return "ok";
      }
    }

    Tool({ name: "class-tool-a" })(ToolTarget);
    Tool({ name: "class-tool-b" })(ToolTarget);

    const descriptor = Object.getOwnPropertyDescriptor(
      ToolTarget.prototype,
      "run",
    );

    if (!descriptor) {
      throw new Error("Expected descriptor for ToolTarget.run");
    }

    Tool({ name: "method-tool-a" })(ToolTarget.prototype, "run", descriptor);
    Tool({ name: "method-tool-b" })(ToolTarget.prototype, "run", descriptor);

    const propertyTool = Tool({ name: "property-tool" }) as unknown as (
      target: object,
      propertyKey: string | symbol,
    ) => void;
    propertyTool(ToolTarget.prototype, "field");

    const classTools = Reflect.getMetadata(
      AI_METADATA_KEYS.CLASS_TOOL,
      ToolTarget,
    ) as Array<{ name?: string }>;
    expect(classTools).toEqual([
      { name: "class-tool-a" },
      { name: "class-tool-b" },
    ]);

    const methodTools = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_TOOL,
      ToolTarget.prototype,
      "run",
    ) as Array<{ name?: string }>;
    expect(methodTools).toEqual([
      { name: "method-tool-a" },
      { name: "method-tool-b" },
    ]);

    const propertyTools = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_TOOL,
      ToolTarget.prototype,
      "field",
    );
    expect(propertyTools).toBeUndefined();
  });

  it("stores @Memory metadata for class, method and property", () => {
    class MemoryTarget {
      field = "value";

      run(): string {
        return "ok";
      }
    }

    Memory({ store: "class-memory-a" })(MemoryTarget);
    Memory({ store: "class-memory-b" })(MemoryTarget);

    const descriptor = Object.getOwnPropertyDescriptor(
      MemoryTarget.prototype,
      "run",
    );

    if (!descriptor) {
      throw new Error("Expected descriptor for MemoryTarget.run");
    }

    Memory({ store: "method-memory-a" })(
      MemoryTarget.prototype,
      "run",
      descriptor,
    );
    Memory({ store: "method-memory-b" })(
      MemoryTarget.prototype,
      "run",
      descriptor,
    );

    const propertyMemory = Memory({
      store: "property-memory-a",
    }) as unknown as (target: object, propertyKey: string | symbol) => void;
    propertyMemory(MemoryTarget.prototype, "field");

    const propertyMemoryB = Memory({
      store: "property-memory-b",
    }) as unknown as (target: object, propertyKey: string | symbol) => void;
    propertyMemoryB(MemoryTarget.prototype, "field");

    const classMemory = Reflect.getMetadata(
      AI_METADATA_KEYS.CLASS_MEMORY,
      MemoryTarget,
    ) as Array<{ store?: string }>;
    expect(classMemory).toEqual([
      { store: "class-memory-a" },
      { store: "class-memory-b" },
    ]);

    const methodMemory = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_MEMORY,
      MemoryTarget.prototype,
      "run",
    ) as Array<{ store?: string }>;
    expect(methodMemory).toEqual([
      { store: "method-memory-a" },
      { store: "method-memory-b" },
    ]);

    const fieldMemory = Reflect.getMetadata(
      AI_METADATA_KEYS.PROPERTY_MEMORY,
      MemoryTarget.prototype,
      "field",
    ) as Array<{ store?: string }>;
    expect(fieldMemory).toEqual([
      { store: "property-memory-a" },
      { store: "property-memory-b" },
    ]);
  });

  it("stores @Context metadata for class, method and property", () => {
    class ContextTarget {
      field = "value";

      run(): string {
        return "ok";
      }
    }

    Context({ source: "class-context-a" })(ContextTarget);
    Context({ source: "class-context-b" })(ContextTarget);

    const descriptor = Object.getOwnPropertyDescriptor(
      ContextTarget.prototype,
      "run",
    );

    if (!descriptor) {
      throw new Error("Expected descriptor for ContextTarget.run");
    }

    Context({ source: "method-context-a" })(
      ContextTarget.prototype,
      "run",
      descriptor,
    );
    Context({ source: "method-context-b" })(
      ContextTarget.prototype,
      "run",
      descriptor,
    );

    const propertyContext = Context({
      source: "property-context-a",
    }) as unknown as (target: object, propertyKey: string | symbol) => void;
    propertyContext(ContextTarget.prototype, "field");

    const propertyContextB = Context({
      source: "property-context-b",
    }) as unknown as (target: object, propertyKey: string | symbol) => void;
    propertyContextB(ContextTarget.prototype, "field");

    const classContext = Reflect.getMetadata(
      AI_METADATA_KEYS.CLASS_CONTEXT,
      ContextTarget,
    ) as Array<{ source?: string }>;
    expect(classContext).toEqual([
      { source: "class-context-a" },
      { source: "class-context-b" },
    ]);

    const methodContext = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_CONTEXT,
      ContextTarget.prototype,
      "run",
    ) as Array<{ source?: string }>;
    expect(methodContext).toEqual([
      { source: "method-context-a" },
      { source: "method-context-b" },
    ]);

    const fieldContext = Reflect.getMetadata(
      AI_METADATA_KEYS.PROPERTY_CONTEXT,
      ContextTarget.prototype,
      "field",
    ) as Array<{ source?: string }>;
    expect(fieldContext).toEqual([
      { source: "property-context-a" },
      { source: "property-context-b" },
    ]);
  });
});
