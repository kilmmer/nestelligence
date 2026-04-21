import "reflect-metadata";

import { AI_METADATA_KEYS } from "../constants/metadata-keys";
import {
  AiCompletionOptions,
  AiMethodInvocationMetadata,
} from "../types/ai.types";

export function Completion<TInput = unknown, TOutput = string>(
  options: AiCompletionOptions<TInput, TOutput> = {},
): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void => {
    if (typeof descriptor?.value !== "function") {
      return;
    }

    const methodOptions = {
      ...options,
      stream: options.stream ?? false,
    };

    const metadata: AiMethodInvocationMetadata<TOutput> = {
      kind: "completion",
      options: methodOptions,
    };

    Reflect.defineMetadata(
      AI_METADATA_KEYS.METHOD_COMPLETION,
      methodOptions,
      target,
      propertyKey,
    );
    Reflect.defineMetadata(
      AI_METADATA_KEYS.METHOD_INVOCATION,
      metadata,
      target,
      propertyKey,
    );
  };
}
