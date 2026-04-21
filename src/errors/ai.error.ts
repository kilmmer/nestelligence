export interface AiErrorConfig {
  code: string;
  details?: unknown;
  cause?: unknown;
}

export class AiError extends Error {
  readonly code: string;
  readonly details?: unknown;
  override readonly cause?: unknown;

  constructor(message: string, config: AiErrorConfig) {
    super(message);
    this.name = new.target.name;
    this.code = config.code;
    this.details = config.details;
    this.cause = config.cause;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

export class AiConfigurationError extends AiError {
  constructor(message: string, details?: unknown, cause?: unknown) {
    super(message, {
      code: "AI_CONFIGURATION_ERROR",
      details,
      cause,
    });
  }
}

export class AiMetadataError extends AiError {
  constructor(message: string, details?: unknown, cause?: unknown) {
    super(message, {
      code: "AI_METADATA_ERROR",
      details,
      cause,
    });
  }
}

export class AiProviderNotFoundError extends AiError {
  constructor(provider: string) {
    super(`AI provider "${provider}" was not found.`, {
      code: "AI_PROVIDER_NOT_FOUND",
      details: { provider },
    });
  }
}

export class AiProviderExecutionError extends AiError {
  constructor(provider: string, details?: unknown, cause?: unknown) {
    super(`AI provider "${provider}" failed to execute request.`, {
      code: "AI_PROVIDER_EXECUTION_ERROR",
      details: {
        provider,
        details,
      },
      cause,
    });
  }
}

export class AiSchemaValidationError extends AiError {
  constructor(details?: unknown, cause?: unknown) {
    super("AI output schema validation failed.", {
      code: "AI_SCHEMA_VALIDATION_ERROR",
      details,
      cause,
    });
  }
}

export class AiAbortError extends AiError {
  constructor() {
    super("AI execution was aborted.", {
      code: "AI_ABORTED",
    });
  }
}

export class AiStreamNotSupportedError extends AiError {
  constructor(provider: string) {
    super(`AI provider "${provider}" does not support streaming.`, {
      code: "AI_STREAM_NOT_SUPPORTED",
      details: { provider },
    });
  }
}
