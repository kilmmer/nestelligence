import {
  AiAbortError,
  AiConfigurationError,
  AiError,
  AiMetadataError,
  AiProviderExecutionError,
  AiProviderNotFoundError,
  AiSchemaValidationError,
  AiStreamNotSupportedError,
} from "../../src/errors";

describe("AiError", () => {
  it("creates base error with code, details, cause and serializes with toJSON", () => {
    const cause = new Error("root cause");
    const error = new AiError("Base failure", {
      code: "AI_BASE_ERROR",
      details: { requestId: "req-1" },
      cause,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AiError");
    expect(error.message).toBe("Base failure");
    expect(error.code).toBe("AI_BASE_ERROR");
    expect(error.details).toEqual({ requestId: "req-1" });
    expect(error.cause).toBe(cause);
    expect(error.toJSON()).toEqual({
      name: "AiError",
      message: "Base failure",
      code: "AI_BASE_ERROR",
      details: { requestId: "req-1" },
    });
  });

  it("creates AiConfigurationError", () => {
    const error = new AiConfigurationError("Invalid config", {
      section: "model",
    });

    expect(error).toBeInstanceOf(AiError);
    expect(error.name).toBe("AiConfigurationError");
    expect(error.code).toBe("AI_CONFIGURATION_ERROR");
    expect(error.message).toBe("Invalid config");
    expect(error.details).toEqual({ section: "model" });
  });

  it("creates AiMetadataError and keeps cause", () => {
    const cause = new Error("missing metadata");
    const error = new AiMetadataError(
      "Metadata is invalid",
      { methodName: "run" },
      cause,
    );

    expect(error).toBeInstanceOf(AiError);
    expect(error.name).toBe("AiMetadataError");
    expect(error.code).toBe("AI_METADATA_ERROR");
    expect(error.message).toBe("Metadata is invalid");
    expect(error.details).toEqual({ methodName: "run" });
    expect(error.cause).toBe(cause);
  });

  it("creates AiProviderNotFoundError", () => {
    const error = new AiProviderNotFoundError("openai");

    expect(error).toBeInstanceOf(AiError);
    expect(error.name).toBe("AiProviderNotFoundError");
    expect(error.code).toBe("AI_PROVIDER_NOT_FOUND");
    expect(error.message).toBe('AI provider "openai" was not found.');
    expect(error.details).toEqual({ provider: "openai" });
  });

  it("creates AiProviderExecutionError", () => {
    const cause = new Error("provider timeout");
    const error = new AiProviderExecutionError(
      "openai",
      { methodName: "chat", stream: false },
      cause,
    );

    expect(error).toBeInstanceOf(AiError);
    expect(error.name).toBe("AiProviderExecutionError");
    expect(error.code).toBe("AI_PROVIDER_EXECUTION_ERROR");
    expect(error.message).toBe(
      'AI provider "openai" failed to execute request.',
    );
    expect(error.details).toEqual({
      provider: "openai",
      details: { methodName: "chat", stream: false },
    });
    expect(error.cause).toBe(cause);
  });

  it("creates AiSchemaValidationError", () => {
    const cause = new Error("schema issue");
    const details = [{ path: ["answer"], message: "Required" }];
    const error = new AiSchemaValidationError(details, cause);

    expect(error).toBeInstanceOf(AiError);
    expect(error.name).toBe("AiSchemaValidationError");
    expect(error.code).toBe("AI_SCHEMA_VALIDATION_ERROR");
    expect(error.message).toBe("AI output schema validation failed.");
    expect(error.details).toEqual(details);
    expect(error.cause).toBe(cause);
  });

  it("creates AiAbortError", () => {
    const error = new AiAbortError();

    expect(error).toBeInstanceOf(AiError);
    expect(error.name).toBe("AiAbortError");
    expect(error.code).toBe("AI_ABORTED");
    expect(error.message).toBe("AI execution was aborted.");
    expect(error.details).toBeUndefined();
  });

  it("creates AiStreamNotSupportedError", () => {
    const error = new AiStreamNotSupportedError("gemini");

    expect(error).toBeInstanceOf(AiError);
    expect(error.name).toBe("AiStreamNotSupportedError");
    expect(error.code).toBe("AI_STREAM_NOT_SUPPORTED");
    expect(error.message).toBe(
      'AI provider "gemini" does not support streaming.',
    );
    expect(error.details).toEqual({ provider: "gemini" });
    expect(error.toJSON()).toEqual({
      name: "AiStreamNotSupportedError",
      message: 'AI provider "gemini" does not support streaming.',
      code: "AI_STREAM_NOT_SUPPORTED",
      details: { provider: "gemini" },
    });
  });
});
