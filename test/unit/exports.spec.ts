import * as publicApi from "../../src";
import { AI_METADATA_KEYS } from "../../src/constants/metadata-keys";
import * as decoratorsApi from "../../src/decorators";
import * as errorsApi from "../../src/errors";
import { MetadataResolver } from "../../src/metadata/metadata.resolver";
import { AI_MODULE_OPTIONS, AiModule } from "../../src/module/ai.module";
import { AiOrchestratorService } from "../../src/orchestrator/ai-orchestrator.service";
import { AiProviderRegistry } from "../../src/providers/ai-provider.registry";

describe("Public exports", () => {
  it("re-exports decorators from src/index", () => {
    expect(publicApi.AI).toBe(decoratorsApi.AI);
    expect(publicApi.Chat).toBe(decoratorsApi.Chat);
    expect(publicApi.Completion).toBe(decoratorsApi.Completion);
    expect(publicApi.Embed).toBe(decoratorsApi.Embed);
    expect(publicApi.Agent).toBe(decoratorsApi.Agent);
    expect(publicApi.Tool).toBe(decoratorsApi.Tool);
    expect(publicApi.Memory).toBe(decoratorsApi.Memory);
    expect(publicApi.Context).toBe(decoratorsApi.Context);
  });

  it("re-exports errors from src/index", () => {
    expect(publicApi.AiError).toBe(errorsApi.AiError);
    expect(publicApi.AiConfigurationError).toBe(errorsApi.AiConfigurationError);
    expect(publicApi.AiMetadataError).toBe(errorsApi.AiMetadataError);
    expect(publicApi.AiProviderNotFoundError).toBe(
      errorsApi.AiProviderNotFoundError,
    );
    expect(publicApi.AiProviderExecutionError).toBe(
      errorsApi.AiProviderExecutionError,
    );
    expect(publicApi.AiSchemaValidationError).toBe(
      errorsApi.AiSchemaValidationError,
    );
    expect(publicApi.AiAbortError).toBe(errorsApi.AiAbortError);
    expect(publicApi.AiStreamNotSupportedError).toBe(
      errorsApi.AiStreamNotSupportedError,
    );
  });

  it("re-exports core runtime symbols from src/index", () => {
    expect(publicApi.AI_METADATA_KEYS).toBe(AI_METADATA_KEYS);
    expect(publicApi.MetadataResolver).toBe(MetadataResolver);
    expect(publicApi.AiProviderRegistry).toBe(AiProviderRegistry);
    expect(publicApi.AiOrchestratorService).toBe(AiOrchestratorService);
    expect(publicApi.AiModule).toBe(AiModule);
    expect(publicApi.AI_MODULE_OPTIONS).toBe(AI_MODULE_OPTIONS);
  });

  it("exposes stable metadata keys and keeps key values unique", () => {
    expect(AI_METADATA_KEYS).toEqual({
      CLASS_AI: "nestelligence:class:ai",
      METHOD_CHAT: "nestelligence:method:chat",
      METHOD_COMPLETION: "nestelligence:method:completion",
      METHOD_EMBED: "nestelligence:method:embed",
      METHOD_AGENT: "nestelligence:method:agent",
      METHOD_INVOCATION: "nestelligence:method:invocation",
      CLASS_TOOL: "nestelligence:class:tool",
      METHOD_TOOL: "nestelligence:method:tool",
      CLASS_MEMORY: "nestelligence:class:memory",
      METHOD_MEMORY: "nestelligence:method:memory",
      PROPERTY_MEMORY: "nestelligence:property:memory",
      CLASS_CONTEXT: "nestelligence:class:context",
      METHOD_CONTEXT: "nestelligence:method:context",
      PROPERTY_CONTEXT: "nestelligence:property:context",
    });

    const values = Object.values(AI_METADATA_KEYS);
    expect(new Set(values).size).toBe(values.length);
  });
});
