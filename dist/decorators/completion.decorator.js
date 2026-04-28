"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Completion = Completion;
require("reflect-metadata");
const metadata_keys_1 = require("../constants/metadata-keys");
function Completion(options = {}) {
    return (target, propertyKey, descriptor) => {
        if (typeof descriptor?.value !== "function") {
            return;
        }
        const methodOptions = {
            ...options,
            stream: options.stream ?? false,
        };
        const metadata = {
            kind: "completion",
            options: methodOptions,
        };
        Reflect.defineMetadata(metadata_keys_1.AI_METADATA_KEYS.METHOD_COMPLETION, methodOptions, target, propertyKey);
        Reflect.defineMetadata(metadata_keys_1.AI_METADATA_KEYS.METHOD_INVOCATION, metadata, target, propertyKey);
    };
}
//# sourceMappingURL=completion.decorator.js.map