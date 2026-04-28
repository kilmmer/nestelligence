import { MetadataResolver } from "../metadata/metadata.resolver";
import { AiProviderRegistry } from "../providers/ai-provider.registry";
import { AiExecutionRequest, AiStreamChunk } from "../types/ai.types";
export declare class AiOrchestratorService {
    private readonly metadataResolver;
    private readonly providerRegistry;
    constructor(metadataResolver: MetadataResolver, providerRegistry: AiProviderRegistry);
    execute<TOutput = unknown>(request: AiExecutionRequest<TOutput>): Promise<TOutput>;
    stream<TOutput = unknown>(request: AiExecutionRequest<TOutput>): AsyncGenerator<AiStreamChunk<TOutput>, void, unknown>;
    private validateOutput;
    private assertNotAborted;
}
//# sourceMappingURL=ai-orchestrator.service.d.ts.map