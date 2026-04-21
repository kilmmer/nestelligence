import {
  AiConfigurationError,
  AiProviderNotFoundError,
} from "../../src/errors";
import { AiProvider } from "../../src/providers/ai-provider.interface";
import { AiProviderRegistry } from "../../src/providers/ai-provider.registry";

function createProvider(name: string): AiProvider {
  return {
    name,
    async execute<TOutput = unknown>() {
      return { output: `ok:${name}` as TOutput };
    },
  };
}

describe("AiProviderRegistry", () => {
  it("registers provider, normalizes names and retrieves by normalized key", () => {
    const registry = new AiProviderRegistry();
    const provider = createProvider(" OpenAI ");

    registry.register(provider);

    expect(registry.has("openai")).toBe(true);
    expect(registry.has(" OPENAI ")).toBe(true);
    expect(registry.get("openai")).toBe(provider);
    expect(registry.list()).toEqual(["openai"]);
  });

  it("registers many providers and supports unregister and clear", () => {
    const registry = new AiProviderRegistry();

    registry.registerMany([
      createProvider("openai"),
      createProvider("Gemini"),
      createProvider("anthropic"),
    ]);

    expect(registry.list()).toEqual(["openai", "gemini", "anthropic"]);

    expect(registry.unregister("GEMINI")).toBe(true);
    expect(registry.has("gemini")).toBe(false);
    expect(registry.unregister("gemini")).toBe(false);

    registry.clear();
    expect(registry.list()).toEqual([]);
  });

  it("throws AiConfigurationError for duplicate provider names", () => {
    const registry = new AiProviderRegistry();
    registry.register(createProvider("openai"));

    let thrown: unknown;
    try {
      registry.register(createProvider(" OPENAI "));
    } catch (error: unknown) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AiConfigurationError);
    const aiError = thrown as AiConfigurationError;
    expect(aiError.code).toBe("AI_CONFIGURATION_ERROR");
    expect(aiError.message).toBe(
      'AI provider " OPENAI " is already registered.',
    );
  });

  it("throws AiConfigurationError for empty provider name", () => {
    const registry = new AiProviderRegistry();

    let thrown: unknown;
    try {
      registry.register(createProvider("   "));
    } catch (error: unknown) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AiConfigurationError);
    const aiError = thrown as AiConfigurationError;
    expect(aiError.code).toBe("AI_CONFIGURATION_ERROR");
    expect(aiError.message).toBe("AI provider name cannot be empty.");
  });

  it("throws AiProviderNotFoundError when provider is missing", () => {
    const registry = new AiProviderRegistry();

    let thrown: unknown;
    try {
      registry.get("missing-provider");
    } catch (error: unknown) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AiProviderNotFoundError);
    const aiError = thrown as AiProviderNotFoundError;
    expect(aiError.code).toBe("AI_PROVIDER_NOT_FOUND");
    expect(aiError.message).toBe(
      'AI provider "missing-provider" was not found.',
    );
    expect(aiError.details).toEqual({ provider: "missing-provider" });
  });
});
