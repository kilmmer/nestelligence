import "reflect-metadata";

import { AI_METADATA_KEYS } from "../constants/metadata-keys";
import { AiEmbedOptions, AiMethodInvocationMetadata } from "../types/ai.types";

export function Embed<TInput = unknown, TOutput = number[]>(
  options: AiEmbedOptions<TInput, TOutput> = {},
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
      kind: "embed",
      options: methodOptions,
    };

    Reflect.defineMetadata(
      AI_METADATA_KEYS.METHOD_EMBED,
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
