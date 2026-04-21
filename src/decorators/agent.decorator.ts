import "reflect-metadata";

import { AI_METADATA_KEYS } from "../constants/metadata-keys";
import { AiAgentOptions, AiMethodInvocationMetadata } from "../types/ai.types";

export function Agent<TInput = unknown, TOutput = unknown>(
  options: AiAgentOptions<TInput, TOutput> = {},
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
      kind: "agent",
      options: methodOptions,
    };

    Reflect.defineMetadata(
      AI_METADATA_KEYS.METHOD_AGENT,
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
