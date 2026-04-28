import { DynamicModule } from "@nestjs/common";
import { AiProvider } from "../providers/ai-provider.interface";
export interface AiModuleOptions {
    providers?: AiProvider[];
}
export interface AiModuleAsyncOptions {
    useFactory: (...args: unknown[]) => Promise<AiModuleOptions> | AiModuleOptions;
    inject?: Array<string | symbol | Function>;
}
export declare const AI_MODULE_OPTIONS: unique symbol;
export declare class AiModule {
    static forRoot(options?: AiModuleOptions): DynamicModule;
    static forRootAsync(options: AiModuleAsyncOptions): DynamicModule;
}
//# sourceMappingURL=ai.module.d.ts.map