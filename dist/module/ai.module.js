"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AiModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = exports.AI_MODULE_OPTIONS = void 0;
const common_1 = require("@nestjs/common");
const metadata_resolver_1 = require("../metadata/metadata.resolver");
const ai_orchestrator_service_1 = require("../orchestrator/ai-orchestrator.service");
const ai_provider_registry_1 = require("../providers/ai-provider.registry");
exports.AI_MODULE_OPTIONS = Symbol("AI_MODULE_OPTIONS");
function createRegistryProvider() {
    return {
        provide: ai_provider_registry_1.AiProviderRegistry,
        useFactory: (options) => {
            const registry = new ai_provider_registry_1.AiProviderRegistry();
            registry.registerMany(options.providers ?? []);
            return registry;
        },
        inject: [exports.AI_MODULE_OPTIONS],
    };
}
let AiModule = AiModule_1 = class AiModule {
    static forRoot(options = {}) {
        return {
            module: AiModule_1,
            providers: [
                {
                    provide: exports.AI_MODULE_OPTIONS,
                    useValue: options,
                },
                createRegistryProvider(),
                metadata_resolver_1.MetadataResolver,
                ai_orchestrator_service_1.AiOrchestratorService,
            ],
            exports: [ai_orchestrator_service_1.AiOrchestratorService, ai_provider_registry_1.AiProviderRegistry, metadata_resolver_1.MetadataResolver],
        };
    }
    static forRootAsync(options) {
        return {
            module: AiModule_1,
            providers: [
                {
                    provide: exports.AI_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject ?? [],
                },
                createRegistryProvider(),
                metadata_resolver_1.MetadataResolver,
                ai_orchestrator_service_1.AiOrchestratorService,
            ],
            exports: [ai_orchestrator_service_1.AiOrchestratorService, ai_provider_registry_1.AiProviderRegistry, metadata_resolver_1.MetadataResolver],
        };
    }
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = AiModule_1 = __decorate([
    (0, common_1.Module)({})
], AiModule);
//# sourceMappingURL=ai.module.js.map