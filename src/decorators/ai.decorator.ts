import "reflect-metadata";

import { AI_METADATA_KEYS } from "../constants/metadata-keys";
import { AiClassOptions } from "../types/ai.types";

export function AI(options: AiClassOptions = {}): ClassDecorator {
  return (target: object): void => {
    Reflect.defineMetadata(AI_METADATA_KEYS.CLASS_AI, options, target);
  };
}
