"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiStreamNotSupportedError = exports.AiAbortError = exports.AiSchemaValidationError = exports.AiProviderExecutionError = exports.AiProviderNotFoundError = exports.AiMetadataError = exports.AiConfigurationError = exports.AiError = void 0;
class AiError extends Error {
    code;
    details;
    cause;
    constructor(message, config) {
        super(message);
        this.name = new.target.name;
        this.code = config.code;
        this.details = config.details;
        this.cause = config.cause;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
        };
    }
}
exports.AiError = AiError;
class AiConfigurationError extends AiError {
    constructor(message, details, cause) {
        super(message, {
            code: "AI_CONFIGURATION_ERROR",
            details,
            cause,
        });
    }
}
exports.AiConfigurationError = AiConfigurationError;
class AiMetadataError extends AiError {
    constructor(message, details, cause) {
        super(message, {
            code: "AI_METADATA_ERROR",
            details,
            cause,
        });
    }
}
exports.AiMetadataError = AiMetadataError;
class AiProviderNotFoundError extends AiError {
    constructor(provider) {
        super(`AI provider "${provider}" was not found.`, {
            code: "AI_PROVIDER_NOT_FOUND",
            details: { provider },
        });
    }
}
exports.AiProviderNotFoundError = AiProviderNotFoundError;
class AiProviderExecutionError extends AiError {
    constructor(provider, details, cause) {
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
exports.AiProviderExecutionError = AiProviderExecutionError;
class AiSchemaValidationError extends AiError {
    constructor(details, cause) {
        super("AI output schema validation failed.", {
            code: "AI_SCHEMA_VALIDATION_ERROR",
            details,
            cause,
        });
    }
}
exports.AiSchemaValidationError = AiSchemaValidationError;
class AiAbortError extends AiError {
    constructor() {
        super("AI execution was aborted.", {
            code: "AI_ABORTED",
        });
    }
}
exports.AiAbortError = AiAbortError;
class AiStreamNotSupportedError extends AiError {
    constructor(provider) {
        super(`AI provider "${provider}" does not support streaming.`, {
            code: "AI_STREAM_NOT_SUPPORTED",
            details: { provider },
        });
    }
}
exports.AiStreamNotSupportedError = AiStreamNotSupportedError;
//# sourceMappingURL=ai.error.js.map