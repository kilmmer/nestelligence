import { Injectable } from "@nestjs/common";

import {
  AiAbortError,
  AiConfigurationError,
  AiError,
  AiProviderExecutionError,
  AiSchemaValidationError,
  AiStreamNotSupportedError,
} from "../errors/ai.error";
import { MetadataResolver } from "../metadata/metadata.resolver";
import { AiProviderRegistry } from "../providers/ai-provider.registry";
import {
  AiExecutionRequest,
  AiSchema,
  AiStreamChunk,
  ResolvedAiInvocationOptions,
} from "../types/ai.types";

@Injectable()
export class AiOrchestratorService {
  constructor(
    private readonly metadataResolver: MetadataResolver,
    private readonly providerRegistry: AiProviderRegistry,
  ) {}

  async execute<TOutput = unknown>(
    request: AiExecutionRequest<TOutput>,
  ): Promise<TOutput> {
    const resolved = this.metadataResolver.resolveMethodMetadata(
      request.target,
      request.methodName,
      request.options,
    );

    this.assertNotAborted(resolved.options.abortSignal);

    const providerName = resolved.options.provider;
    if (!providerName) {
      throw new AiConfigurationError(
        "No AI provider configured for invocation.",
        {
          methodName: String(request.methodName),
        },
      );
    }

    const provider = this.providerRegistry.get(providerName);

    try {
      const result = await provider.execute<TOutput>({
        kind: resolved.kind,
        target: request.target,
        methodName: request.methodName,
        input: request.input,
        options: resolved.options,
        tools: resolved.tools,
        memory: resolved.memory,
        context: resolved.context,
      });

      this.assertNotAborted(resolved.options.abortSignal);
      return this.validateOutput(result.output, resolved.options.schema);
    } catch (error: unknown) {
      if (error instanceof AiError) {
        throw error;
      }

      throw new AiProviderExecutionError(
        providerName,
        {
          methodName: String(request.methodName),
          stream: false,
        },
        error,
      );
    }
  }

  async *stream<TOutput = unknown>(
    request: AiExecutionRequest<TOutput>,
  ): AsyncGenerator<AiStreamChunk<TOutput>, void, unknown> {
    const resolved = this.metadataResolver.resolveMethodMetadata(
      request.target,
      request.methodName,
      request.options,
    );

    const options: ResolvedAiInvocationOptions<TOutput> = {
      ...resolved.options,
      stream: true,
    };

    this.assertNotAborted(options.abortSignal);

    const providerName = options.provider;
    if (!providerName) {
      throw new AiConfigurationError(
        "No AI provider configured for streaming.",
        {
          methodName: String(request.methodName),
        },
      );
    }

    const provider = this.providerRegistry.get(providerName);
    if (!provider.stream) {
      throw new AiStreamNotSupportedError(providerName);
    }

    try {
      const chunks = provider.stream<TOutput>({
        kind: resolved.kind,
        target: request.target,
        methodName: request.methodName,
        input: request.input,
        options,
        tools: resolved.tools,
        memory: resolved.memory,
        context: resolved.context,
      });

      for await (const chunk of chunks) {
        this.assertNotAborted(options.abortSignal);

        if (chunk.type === "done" && chunk.output !== undefined) {
          yield {
            ...chunk,
            output: this.validateOutput(chunk.output, options.schema),
          };
          continue;
        }

        yield chunk;
      }

      this.assertNotAborted(options.abortSignal);
    } catch (error: unknown) {
      if (error instanceof AiError) {
        throw error;
      }

      throw new AiProviderExecutionError(
        providerName,
        {
          methodName: String(request.methodName),
          stream: true,
        },
        error,
      );
    }
  }

  private validateOutput<TOutput>(
    output: TOutput,
    schema?: AiSchema<TOutput>,
  ): TOutput {
    if (!schema) {
      return output;
    }

    const result = schema.safeParse(output);
    if (!result.success) {
      throw new AiSchemaValidationError(result.error.issues, result.error);
    }

    return result.data;
  }

  private assertNotAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
      throw new AiAbortError();
    }
  }
}
