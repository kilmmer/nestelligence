"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const ai_error_1 = require("../errors/ai.error");
const metadata_resolver_1 = require("../metadata/metadata.resolver");
const ai_provider_registry_1 = require("../providers/ai-provider.registry");
let AiOrchestratorService = class AiOrchestratorService {
    metadataResolver;
    providerRegistry;
    constructor(metadataResolver, providerRegistry) {
        this.metadataResolver = metadataResolver;
        this.providerRegistry = providerRegistry;
    }
    async execute(request) {
        const resolved = this.metadataResolver.resolveMethodMetadata(request.target, request.methodName, request.options);
        this.assertNotAborted(resolved.options.abortSignal);
        const providerName = resolved.options.provider;
        if (!providerName) {
            throw new ai_error_1.AiConfigurationError("No AI provider configured for invocation.", {
                methodName: String(request.methodName),
            });
        }
        const provider = this.providerRegistry.get(providerName);
        try {
            const result = await provider.execute({
                kind: resolved.kind,
                target: request.target,
                methodName: request.methodName,
                input: request.input,
                options: resolved.options,
                tools: resolved.tools,
                memory: resolved.memory,
                context: resolved.context,
            });
            this.assertNotAborted(resolved.options.abortSignal);
            return this.validateOutput(result.output, resolved.options.schema);
        }
        catch (error) {
            if (error instanceof ai_error_1.AiError) {
                throw error;
            }
            throw new ai_error_1.AiProviderExecutionError(providerName, {
                methodName: String(request.methodName),
                stream: false,
            }, error);
        }
    }
    async *stream(request) {
        const resolved = this.metadataResolver.resolveMethodMetadata(request.target, request.methodName, request.options);
        const options = {
            ...resolved.options,
            stream: true,
        };
        this.assertNotAborted(options.abortSignal);
        const providerName = options.provider;
        if (!providerName) {
            throw new ai_error_1.AiConfigurationError("No AI provider configured for streaming.", {
                methodName: String(request.methodName),
            });
        }
        const provider = this.providerRegistry.get(providerName);
        if (!provider.stream) {
            throw new ai_error_1.AiStreamNotSupportedError(providerName);
        }
        try {
            const chunks = provider.stream({
                kind: resolved.kind,
                target: request.target,
                methodName: request.methodName,
                input: request.input,
                options,
                tools: resolved.tools,
                memory: resolved.memory,
                context: resolved.context,
            });
            for await (const chunk of chunks) {
                this.assertNotAborted(options.abortSignal);
                if (chunk.type === "done" && chunk.output !== undefined) {
                    yield {
                        ...chunk,
                        output: this.validateOutput(chunk.output, options.schema),
                    };
                    continue;
                }
                yield chunk;
            }
            this.assertNotAborted(options.abortSignal);
        }
        catch (error) {
            if (error instanceof ai_error_1.AiError) {
                throw error;
            }
            throw new ai_error_1.AiProviderExecutionError(providerName, {
                methodName: String(request.methodName),
                stream: true,
            }, error);
        }
    }
    validateOutput(output, schema) {
        if (!schema) {
            return output;
        }
        const result = schema.safeParse(output);
        if (!result.success) {
            throw new ai_error_1.AiSchemaValidationError(result.error.issues, result.error);
        }
        return result.data;
    }
    assertNotAborted(signal) {
        if (signal?.aborted) {
            throw new ai_error_1.AiAbortError();
        }
    }
};
exports.AiOrchestratorService = AiOrchestratorService;
exports.AiOrchestratorService = AiOrchestratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metadata_resolver_1.MetadataResolver,
        ai_provider_registry_1.AiProviderRegistry])
], AiOrchestratorService);
//# sourceMappingURL=ai-orchestrator.service.js.map