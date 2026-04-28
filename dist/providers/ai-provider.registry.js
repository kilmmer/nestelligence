"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProviderRegistry = void 0;
const common_1 = require("@nestjs/common");
const ai_error_1 = require("../errors/ai.error");
let AiProviderRegistry = class AiProviderRegistry {
    providers = new Map();
    register(provider) {
        const key = this.normalize(provider.name);
        if (this.providers.has(key)) {
            throw new ai_error_1.AiConfigurationError(`AI provider "${provider.name}" is already registered.`);
        }
        this.providers.set(key, provider);
    }
    registerMany(providers) {
        for (const provider of providers) {
            this.register(provider);
        }
    }
    has(name) {
        return this.providers.has(this.normalize(name));
    }
    get(name) {
        const provider = this.providers.get(this.normalize(name));
        if (!provider) {
            throw new ai_error_1.AiProviderNotFoundError(name);
        }
        return provider;
    }
    unregister(name) {
        return this.providers.delete(this.normalize(name));
    }
    list() {
        return [...this.providers.keys()];
    }
    clear() {
        this.providers.clear();
    }
    normalize(name) {
        const normalized = name.trim().toLowerCase();
        if (!normalized) {
            throw new ai_error_1.AiConfigurationError("AI provider name cannot be empty.");
        }
        return normalized;
    }
};
exports.AiProviderRegistry = AiProviderRegistry;
exports.AiProviderRegistry = AiProviderRegistry = __decorate([
    (0, common_1.Injectable)()
], AiProviderRegistry);
//# sourceMappingURL=ai-provider.registry.js.map