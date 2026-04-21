import "reflect-metadata";

import { AI_METADATA_KEYS } from "../constants/metadata-keys";
import { AiChatOptions, AiMethodInvocationMetadata } from "../types/ai.types";

export function Chat<TInput = unknown, TOutput = string>(
  options: AiChatOptions<TInput, TOutput> = {},
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
      kind: "chat",
      options: methodOptions,
    };

    Reflect.defineMetadata(
      AI_METADATA_KEYS.METHOD_CHAT,
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
