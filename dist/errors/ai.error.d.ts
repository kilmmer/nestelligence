export interface AiErrorConfig {
    code: string;
    details?: unknown;
    cause?: unknown;
}
export declare class AiError extends Error {
    readonly code: string;
    readonly details?: unknown;
    readonly cause?: unknown;
    constructor(message: string, config: AiErrorConfig);
    toJSON(): Record<string, unknown>;
}
export declare class AiConfigurationError extends AiError {
    constructor(message: string, details?: unknown, cause?: unknown);
}
export declare class AiMetadataError extends AiError {
    constructor(message: string, details?: unknown, cause?: unknown);
}
export declare class AiProviderNotFoundError extends AiError {
    constructor(provider: string);
}
export declare class AiProviderExecutionError extends AiError {
    constructor(provider: string, details?: unknown, cause?: unknown);
}
export declare class AiSchemaValidationError extends AiError {
    constructor(details?: unknown, cause?: unknown);
}
export declare class AiAbortError extends AiError {
    constructor();
}
export declare class AiStreamNotSupportedError extends AiError {
    constructor(provider: string);
}
//# sourceMappingURL=ai.error.d.ts.map