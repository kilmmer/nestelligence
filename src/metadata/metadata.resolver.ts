import "reflect-metadata";

import { Injectable } from "@nestjs/common";

import { AI_METADATA_KEYS } from "../constants/metadata-keys";
import { AiMetadataError } from "../errors/ai.error";
import {
  AiClassOptions,
  AiContextOptions,
  AiInvocationOptions,
  AiMemoryOptions,
  AiMethodInvocationMetadata,
  AiToolOptions,
  ResolvedAiInvocationOptions,
  ResolvedAiMethodMetadata,
} from "../types/ai.types";

@Injectable()
export class MetadataResolver {
  resolveMethodMetadata<TOutput = unknown>(
    target: object,
    methodName: string | symbol,
    runtimeOptions: AiInvocationOptions<unknown, TOutput> = {},
  ): ResolvedAiMethodMetadata<TOutput> {
    const classTarget = this.resolveClassTarget(target);
    const methodTarget = this.resolveMethodTarget(target, methodName);

    const classOptions =
      (Reflect.getMetadata(AI_METADATA_KEYS.CLASS_AI, classTarget) as
        | AiClassOptions<TOutput>
        | undefined) ?? undefined;

    const methodMetadata = Reflect.getMetadata(
      AI_METADATA_KEYS.METHOD_INVOCATION,
      methodTarget,
      methodName,
    ) as AiMethodInvocationMetadata<TOutput> | undefined;

    if (!methodMetadata) {
      throw new AiMetadataError(
        `No AI invocation metadata found on method "${String(methodName)}".`,
        {
          methodName: String(methodName),
        },
      );
    }

    if (!classOptions) {
      throw new AiMetadataError(
        `@AI() is required on class "${classTarget.name}" for AI method decorators.`,
        {
          className: classTarget.name,
          methodName: String(methodName),
        },
      );
    }

    const options = this.mergeInvocationOptions(
      classOptions,
      methodMetadata.options,
      runtimeOptions,
    );

    const classTools = this.getMetadataList<AiToolOptions>(
      AI_METADATA_KEYS.CLASS_TOOL,
      classTarget,
    );
    const methodTools = this.getMetadataList<AiToolOptions>(
      AI_METADATA_KEYS.METHOD_TOOL,
      methodTarget,
      methodName,
    );

    const classMemory = this.getMetadataList<AiMemoryOptions>(
      AI_METADATA_KEYS.CLASS_MEMORY,
      classTarget,
    );
    const methodMemory = this.getMetadataList<AiMemoryOptions>(
      AI_METADATA_KEYS.METHOD_MEMORY,
      methodTarget,
      methodName,
    );

    const classContext = this.getMetadataList<AiContextOptions>(
      AI_METADATA_KEYS.CLASS_CONTEXT,
      classTarget,
    );
    const methodContext = this.getMetadataList<AiContextOptions>(
      AI_METADATA_KEYS.METHOD_CONTEXT,
      methodTarget,
      methodName,
    );

    return {
      kind: methodMetadata.kind,
      options,
      classOptions,
      tools: [...classTools, ...methodTools],
      memory: [...classMemory, ...methodMemory],
      context: [...classContext, ...methodContext],
    };
  }

  private mergeInvocationOptions<TOutput = unknown>(
    classOptions: AiClassOptions<TOutput>,
    methodOptions: AiInvocationOptions<unknown, TOutput>,
    runtimeOptions: AiInvocationOptions<unknown, TOutput>,
  ): ResolvedAiInvocationOptions<TOutput> {
    return {
      ...classOptions,
      ...methodOptions,
      ...runtimeOptions,
      stream:
        runtimeOptions.stream ??
        methodOptions.stream ??
        classOptions.stream ??
        false,
      autoRun:
        runtimeOptions.autoRun ??
        methodOptions.autoRun ??
        classOptions.autoRun ??
        false,
    };
  }

  private getMetadataList<TValue>(
    key: string,
    target: object,
    propertyKey?: string | symbol,
  ): TValue[] {
    const value = propertyKey
      ? (Reflect.getMetadata(key, target, propertyKey) as TValue[] | undefined)
      : (Reflect.getMetadata(key, target) as TValue[] | undefined);

    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }

  private resolveClassTarget(target: object): Function {
    if (typeof target === "function") {
      return target;
    }

    const prototype = Object.getPrototypeOf(target);
    const classTarget = prototype?.constructor as Function | undefined;

    if (!classTarget) {
      throw new AiMetadataError("Unable to resolve class target for metadata.");
    }

    return classTarget;
  }

  private resolveMethodTarget(
    target: object,
    methodName: string | symbol,
  ): object {
    if (typeof target === "function") {
      return target.prototype;
    }

    if (Object.prototype.hasOwnProperty.call(target, methodName)) {
      return target;
    }

    return Object.getPrototypeOf(target) ?? target;
  }
}
