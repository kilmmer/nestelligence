"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataResolver = void 0;
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const metadata_keys_1 = require("../constants/metadata-keys");
const ai_error_1 = require("../errors/ai.error");
let MetadataResolver = class MetadataResolver {
    resolveMethodMetadata(target, methodName, runtimeOptions = {}) {
        const classTarget = this.resolveClassTarget(target);
        const methodTarget = this.resolveMethodTarget(target, methodName);
        const classOptions = Reflect.getMetadata(metadata_keys_1.AI_METADATA_KEYS.CLASS_AI, classTarget) ?? undefined;
        const methodMetadata = Reflect.getMetadata(metadata_keys_1.AI_METADATA_KEYS.METHOD_INVOCATION, methodTarget, methodName);
        if (!methodMetadata) {
            throw new ai_error_1.AiMetadataError(`No AI invocation metadata found on method "${String(methodName)}".`, {
                methodName: String(methodName),
            });
        }
        if (!classOptions) {
            throw new ai_error_1.AiMetadataError(`@AI() is required on class "${classTarget.name}" for AI method decorators.`, {
                className: classTarget.name,
                methodName: String(methodName),
            });
        }
        const options = this.mergeInvocationOptions(classOptions, methodMetadata.options, runtimeOptions);
        const classTools = this.getMetadataList(metadata_keys_1.AI_METADATA_KEYS.CLASS_TOOL, classTarget);
        const methodTools = this.getMetadataList(metadata_keys_1.AI_METADATA_KEYS.METHOD_TOOL, methodTarget, methodName);
        const classMemory = this.getMetadataList(metadata_keys_1.AI_METADATA_KEYS.CLASS_MEMORY, classTarget);
        const methodMemory = this.getMetadataList(metadata_keys_1.AI_METADATA_KEYS.METHOD_MEMORY, methodTarget, methodName);
        const classContext = this.getMetadataList(metadata_keys_1.AI_METADATA_KEYS.CLASS_CONTEXT, classTarget);
        const methodContext = this.getMetadataList(metadata_keys_1.AI_METADATA_KEYS.METHOD_CONTEXT, methodTarget, methodName);
        return {
            kind: methodMetadata.kind,
            options,
            classOptions,
            tools: [...classTools, ...methodTools],
            memory: [...classMemory, ...methodMemory],
            context: [...classContext, ...methodContext],
        };
    }
    mergeInvocationOptions(classOptions, methodOptions, runtimeOptions) {
        return {
            ...classOptions,
            ...methodOptions,
            ...runtimeOptions,
            stream: runtimeOptions.stream ??
                methodOptions.stream ??
                classOptions.stream ??
                false,
            autoRun: runtimeOptions.autoRun ??
                methodOptions.autoRun ??
                classOptions.autoRun ??
                false,
        };
    }
    getMetadataList(key, target, propertyKey) {
        const value = propertyKey
            ? Reflect.getMetadata(key, target, propertyKey)
            : Reflect.getMetadata(key, target);
        if (!value) {
            return [];
        }
        return Array.isArray(value) ? value : [value];
    }
    resolveClassTarget(target) {
        if (typeof target === "function") {
            return target;
        }
        const prototype = Object.getPrototypeOf(target);
        const classTarget = prototype?.constructor;
        if (!classTarget) {
            throw new ai_error_1.AiMetadataError("Unable to resolve class target for metadata.");
        }
        return classTarget;
    }
    resolveMethodTarget(target, methodName) {
        if (typeof target === "function") {
            return target.prototype;
        }
        if (Object.prototype.hasOwnProperty.call(target, methodName)) {
            return target;
        }
        return Object.getPrototypeOf(target) ?? target;
    }
};
exports.MetadataResolver = MetadataResolver;
exports.MetadataResolver = MetadataResolver = __decorate([
    (0, common_1.Injectable)()
], MetadataResolver);
//# sourceMappingURL=metadata.resolver.js.map