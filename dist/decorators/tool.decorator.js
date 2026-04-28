"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tool = Tool;
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
function Tool(options = {}) {
    return (target, propertyKey, descriptor) => {
        if (!propertyKey) {
            appendMetadataList(metadata_keys_1.AI_METADATA_KEYS.CLASS_TOOL, options, target);
            return;
        }
        if (typeof descriptor?.value !== "function") {
            return;
        }
        appendMetadataList(metadata_keys_1.AI_METADATA_KEYS.METHOD_TOOL, options, target, propertyKey);
    };
}
//# sourceMappingURL=tool.decorator.js.map