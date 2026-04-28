"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = Memory;
require("reflect-metadata");
const metadata_keys_1 = require("../constants/metadata-keys");
function appendMetadataList(key, value, target, propertyKey) {
    const current = propertyKey
        ? (Reflect.getMetadata(key, target, propertyKey) ?? [])
        : (Reflect.getMetadata(key, target) ?? []);
    const next = [...current, value];
    if (propertyKey) {
        Reflect.defineMetadata(key, next, target, propertyKey);
        return;
    }
    Reflect.defineMetadata(key, next, target);
}
function Memory(options = {}) {
    return (target, propertyKey, descriptor) => {
        if (!propertyKey) {
            appendMetadataList(metadata_keys_1.AI_METADATA_KEYS.CLASS_MEMORY, options, target);
            return;
        }
        if (typeof descriptor?.value === "function") {
            appendMetadataList(metadata_keys_1.AI_METADATA_KEYS.METHOD_MEMORY, options, target, propertyKey);
            return;
        }
        appendMetadataList(metadata_keys_1.AI_METADATA_KEYS.PROPERTY_MEMORY, options, target, propertyKey);
    };
}
//# sourceMappingURL=memory.decorator.js.map