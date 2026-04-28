import { AiProviderExecuteResult, AiProviderRequest, AiStreamChunk } from "../types/ai.types";
export interface AiProvider {
    readonly name: string;
    execute<TOutput = unknown>(request: AiProviderRequest<TOutput>): Promise<AiProviderExecuteResult<TOutput>>;
    stream?<TOutput = unknown>(request: AiProviderRequest<TOutput>): AsyncIterable<AiStreamChunk<TOutput>>;
}
//# sourceMappingURL=ai-provider.interface.d.ts.map