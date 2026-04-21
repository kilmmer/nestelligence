import { DynamicModule, Module, Provider } from "@nestjs/common";

import { MetadataResolver } from "../metadata/metadata.resolver";
import { AiOrchestratorService } from "../orchestrator/ai-orchestrator.service";
import { AiProvider } from "../providers/ai-provider.interface";
import { AiProviderRegistry } from "../providers/ai-provider.registry";

export interface AiModuleOptions {
  providers?: AiProvider[];
}

export interface AiModuleAsyncOptions {
  useFactory: (
    ...args: unknown[]
  ) => Promise<AiModuleOptions> | AiModuleOptions;
  inject?: Array<string | symbol | Function>;
}

export const AI_MODULE_OPTIONS = Symbol("AI_MODULE_OPTIONS");

function createRegistryProvider(): Provider {
  return {
    provide: AiProviderRegistry,
    useFactory: (options: AiModuleOptions): AiProviderRegistry => {
      const registry = new AiProviderRegistry();
      registry.registerMany(options.providers ?? []);
      return registry;
    },
    inject: [AI_MODULE_OPTIONS],
  };
}

@Module({})
export class AiModule {
  static forRoot(options: AiModuleOptions = {}): DynamicModule {
    return {
      module: AiModule,
      providers: [
        {
          provide: AI_MODULE_OPTIONS,
          useValue: options,
        },
        createRegistryProvider(),
        MetadataResolver,
        AiOrchestratorService,
      ],
      exports: [AiOrchestratorService, AiProviderRegistry, MetadataResolver],
    };
  }

  static forRootAsync(options: AiModuleAsyncOptions): DynamicModule {
    return {
      module: AiModule,
      providers: [
        {
          provide: AI_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        createRegistryProvider(),
        MetadataResolver,
        AiOrchestratorService,
      ],
      exports: [AiOrchestratorService, AiProviderRegistry, MetadataResolver],
    };
  }
}
