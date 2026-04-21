import { z } from "zod";

export type AiInvocationKind = "chat" | "completion" | "embed" | "agent";
export type AiStreamChunkType = "delta" | "data" | "done";

export type AiSchema<TOutput = unknown> = z.ZodType<TOutput>;

export interface AiToolBinding {
  name: string;
  description?: string;
  handler?: (...args: unknown[]) => unknown | Promise<unknown>;
  metadata?: Record<string, unknown>;
}

export interface AiInvocationOptions<TInput = unknown, TOutput = unknown> {
  provider?: string;
  model?: string;
  autoRun?: boolean;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  stream?: boolean;
  abortSignal?: AbortSignal;
  schema?: AiSchema<TOutput>;
  inputSchema?: z.ZodType<TInput>;
  tools?: AiToolBinding[];
  context?: Record<string, unknown>;
  policy?: string;
  metadata?: Record<string, unknown>;
}

export interface AiClassOptions<TOutput = unknown> extends Omit<
  AiInvocationOptions<unknown, TOutput>,
  "abortSignal" | "inputSchema"
> {}

export interface AiChatOptions<
  TInput = unknown,
  TOutput = string,
> extends AiInvocationOptions<TInput, TOutput> {}

export interface AiCompletionOptions<
  TInput = unknown,
  TOutput = string,
> extends AiInvocationOptions<TInput, TOutput> {}

export interface AiEmbedOptions<
  TInput = unknown,
  TOutput = number[],
> extends AiInvocationOptions<TInput, TOutput> {}

export interface AiAgentOptions<
  TInput = unknown,
  TOutput = unknown,
> extends AiInvocationOptions<TInput, TOutput> {}

export interface AiToolOptions {
  name?: string;
  description?: string;
  autoRun?: boolean;
  schema?: z.ZodTypeAny;
  metadata?: Record<string, unknown>;
}

export interface AiMemoryOptions {
  store?: string;
  keyFrom?: string;
  metadata?: Record<string, unknown>;
}

export interface AiContextOptions {
  source?: string;
  key?: string;
  metadata?: Record<string, unknown>;
}

export interface AiMethodInvocationMetadata<TOutput = unknown> {
  kind: AiInvocationKind;
  options: AiInvocationOptions<unknown, TOutput>;
}

export interface ResolvedAiInvocationOptions<
  TOutput = unknown,
> extends AiInvocationOptions<unknown, TOutput> {
  stream: boolean;
  autoRun: boolean;
}

export interface ResolvedAiMethodMetadata<TOutput = unknown> {
  kind: AiInvocationKind;
  options: ResolvedAiInvocationOptions<TOutput>;
  classOptions: AiClassOptions<TOutput>;
  tools: AiToolOptions[];
  memory: AiMemoryOptions[];
  context: AiContextOptions[];
}

export interface AiExecutionRequest<TOutput = unknown> {
  target: object;
  methodName: string | symbol;
  input?: unknown;
  options?: AiInvocationOptions<unknown, TOutput>;
}

export interface AiProviderRequest<TOutput = unknown> {
  kind: AiInvocationKind;
  target: object;
  methodName: string | symbol;
  input?: unknown;
  options: ResolvedAiInvocationOptions<TOutput>;
  tools: AiToolOptions[];
  memory: AiMemoryOptions[];
  context: AiContextOptions[];
}

export interface AiProviderExecuteResult<TOutput = unknown> {
  output: TOutput;
  raw?: unknown;
}

export interface AiStreamChunk<TOutput = unknown> {
  type: AiStreamChunkType;
  value?: unknown;
  output?: TOutput;
}
