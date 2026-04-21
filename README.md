# Nestelligence

A provider-agnostic, NestJS-first npm library to integrate AI workflows in backend applications with decorators, DI, and orchestration.

Status: Design and documentation harness in progress.

## Value In One Line

Build AI-enabled backend flows in NestJS with the same DX style as `@Cron()`, `@UseGuards()`, and `@MessagePattern()`, without hard-locking your app to a single vendor.

## Why This Project Exists

Most AI integrations in Node.js backend apps become tightly coupled to one SDK, one API style, or one provider. This project aims to solve that by offering:

- NestJS-native decorators and metadata.
- A pluggable orchestration layer.
- Multi-provider support (cloud and local).
- Strong typing + runtime validation.
- Optional observability, tracing, and cost metrics.

## Product Principles

- NestJS conventions first.
- Declarative API, explicit orchestration entrypoint.
- Provider-agnostic core.
- No required OpenAI coupling.
- Configurable by module, env, DI, and decorator overrides.
- Works in services, gateways, resolvers, jobs, and microservices.
- Stable error model with library-specific exceptions.

## Planned Core Decorators (v1)

- `@AI()` class-level defaults and policy envelope.
- `@Chat()` chat interaction.
- `@Completion()` text completion.
- `@Embed()` embedding generation.
- `@Agent()` agent-style execution with tools and memory hooks.
- `@Tool()` tool declaration and registration.
- `@Memory()` memory adapter binding metadata.
- `@Context()` contextual data binding metadata.

Also planned:

- Method, class, parameter, and property level usage.
- Decorator options for model, temperature, top_p, top_k, max_tokens, response schema, streaming mode, and provider routing.

## Planned Orchestration Capabilities

- Simple model calls.
- Multi-step pipelines.
- Tool/function calling.
- Session and conversation support.
- RAG-ready integration points in MVP.
- Streaming responses.
- Structured outputs with schema validation.

## Provider Strategy (MVP)

Stable adapters in first launch:

- OpenAI
- Google Gemini
- Anthropic
- Ollama (local)

Experimental adapters in first launch:

- vLLM (on-prem/local)

Planned follow-up adapters:

- Qwen
- Grok
- Perplexity

Transport strategy:

- Official SDK adapter path.
- HTTP adapter path when SDK is not ideal.

## Example DX (Target)

```ts
@AI({
  provider: "openai",
  model: "gpt-4.1-mini",
  temperature: 0.2,
})
@Injectable()
export class SupportService {
  @Chat({ stream: true })
  async answer(@Body() input: SupportQuestionDto): Promise<StreamableFile> {
    return input;
  }

  @Embed({ model: "text-embedding-3-large" })
  async vectorize(text: string): Promise<number[]> {
    return text;
  }
}
```

Notes:

- Decorators remain declarative.
- Runtime orchestration is executed by the orchestrator engine.
- Return type inference and schema validation are integrated.

## NestJS Integration Surface

- Pipes
- Guards
- Interceptors
- Exception filters
- Dependency injection tokens and dynamic providers
- Lifecycle hooks (`onModuleInit`, `onApplicationBootstrap`, `onModuleDestroy`)

## Errors and Policies

Library-specific error classes (not forced `HttpException`), for example:

- `AiProviderError`
- `AiTimeoutError`
- `AiRateLimitError`
- `AiSchemaValidationError`
- `AiToolExecutionError`
- `AiOrchestrationError`

Policies can be global and per-decorator.

## Observability

- Optional logs with pluggable sinks (console, file, S3, custom).
- Optional token/cost/latency/error metrics.
- OpenTelemetry-ready hooks.
- Prompt/response/token inspection controlled by config.
- Sensitive data masking controlled by config.

## Testing and Quality Targets

- Unit + integration + e2e coverage.
- Benchmark suite for latency and cost profile.
- Minimum coverage target: 98%.
- CI gates to avoid regressions.

## Monorepo Or Single Package?

Current direction: single package publication for core library, with an `examples/` folder in this repository.

## Documentation Index

- [Project Charter](docs/PROJECT_CHARTER.md)
- [Harness Thinking and Actions](docs/HARNESS_THINKING_ACTIONS.md)
- [Reasoning Summary](docs/REASONING_SUMMARY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API Design](docs/API_DESIGN.md)
- [Providers and Runtime](docs/PROVIDERS_RUNTIME.md)
- [Quality and Testing Strategy](docs/QUALITY_TESTING.md)
- [Observability and Error Model](docs/OBSERVABILITY_ERRORS.md)
- [Examples Plan](docs/EXAMPLES_PLAN.md)
- [REST Example](docs/REST_EXAMPLE.md)
- [GraphQL Example](docs/GRAPHQL_EXAMPLE.md)
- [WebSocket Example](docs/WEBSOCKET_EXAMPLE.md)
- [Roadmap](docs/ROADMAP.md)
- [Open Questions](docs/OPEN_QUESTIONS.md)
- [ADR 0001](docs/adr/0001-nestjs-first.md)
- [ADR 0002](docs/adr/0002-provider-agnostic-core.md)
- [ADR 0003](docs/adr/0003-declarative-decorators-with-orchestrator.md)
- [Contributing](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Code Of Conduct](CODE_OF_CONDUCT.md)

## Final Naming

- Project name: `Nestelligence`
- npm package strategy: unscoped package `nestelligence`

## Current Scope Of This Repository

This repo currently establishes the full planning and execution harness, with explicit requirements, architecture, ADRs, and quality criteria. Implementation can start in the next iteration using this documentation as source of truth.

## License

MIT
