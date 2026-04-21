import "reflect-metadata";

import { AI_METADATA_KEYS } from "../constants/metadata-keys";
import { AiContextOptions } from "../types/ai.types";

function appendMetadataList<TValue>(
  key: string,
  value: TValue,
  target: object,
  propertyKey?: string | symbol,
): void {
  const current = propertyKey
    ? ((Reflect.getMetadata(key, target, propertyKey) as
        | TValue[]
        | undefined) ?? [])
    : ((Reflect.getMetadata(key, target) as TValue[] | undefined) ?? []);

  const next = [...current, value];

  if (propertyKey) {
    Reflect.defineMetadata(key, next, target, propertyKey);
    return;
  }

  Reflect.defineMetadata(key, next, target);
}

export function Context(
  options: AiContextOptions = {},
): ClassDecorator & MethodDecorator & PropertyDecorator {
  return (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void => {
    if (!propertyKey) {
      appendMetadataList(AI_METADATA_KEYS.CLASS_CONTEXT, options, target);
      return;
    }

    if (typeof descriptor?.value === "function") {
      appendMetadataList(
        AI_METADATA_KEYS.METHOD_CONTEXT,
        options,
        target,
        propertyKey,
      );
      return;
    }

    appendMetadataList(
      AI_METADATA_KEYS.PROPERTY_CONTEXT,
      options,
      target,
      propertyKey,
    );
  };
}
