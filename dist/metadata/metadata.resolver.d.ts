import "reflect-metadata";
import { AiInvocationOptions, ResolvedAiMethodMetadata } from "../types/ai.types";
export declare class MetadataResolver {
    resolveMethodMetadata<TOutput = unknown>(target: object, methodName: string | symbol, runtimeOptions?: AiInvocationOptions<unknown, TOutput>): ResolvedAiMethodMetadata<TOutput>;
    private mergeInvocationOptions;
    private getMetadataList;
    private resolveClassTarget;
    private resolveMethodTarget;
}
//# sourceMappingURL=metadata.resolver.d.ts.map