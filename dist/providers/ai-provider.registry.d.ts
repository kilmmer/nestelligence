import { AiProvider } from "./ai-provider.interface";
export declare class AiProviderRegistry {
    private readonly providers;
    register(provider: AiProvider): void;
    registerMany(providers: AiProvider[]): void;
    has(name: string): boolean;
    get(name: string): AiProvider;
    unregister(name: string): boolean;
    list(): string[];
    clear(): void;
    private normalize;
}
//# sourceMappingURL=ai-provider.registry.d.ts.map