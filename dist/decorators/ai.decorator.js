"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI = AI;
require("reflect-metadata");
const metadata_keys_1 = require("../constants/metadata-keys");
function AI(options = {}) {
    return (target) => {
        Reflect.defineMetadata(metadata_keys_1.AI_METADATA_KEYS.CLASS_AI, options, target);
    };
}
//# sourceMappingURL=ai.decorator.js.map