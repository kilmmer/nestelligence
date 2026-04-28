"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = Chat;
require("reflect-metadata");
const metadata_keys_1 = require("../constants/metadata-keys");
function Chat(options = {}) {
    return (target, propertyKey, descriptor) => {
        if (typeof descriptor?.value !== "function") {
            return;
        }
        const methodOptions = {
            ...options,
            stream: options.stream ?? false,
        };
        const metadata = {
            kind: "chat",
            options: methodOptions,
        };
        Reflect.defineMetadata(metadata_keys_1.AI_METADATA_KEYS.METHOD_CHAT, methodOptions, target, propertyKey);
        Reflect.defineMetadata(metadata_keys_1.AI_METADATA_KEYS.METHOD_INVOCATION, metadata, target, propertyKey);
    };
}
//# sourceMappingURL=chat.decorator.js.map