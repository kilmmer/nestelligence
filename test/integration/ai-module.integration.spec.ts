import { Injectable } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { AI, Completion } from "../../src/decorators";
import { AiModule } from "../../src/module/ai.module";
import { AiOrchestratorService } from "../../src/orchestrator/ai-orchestrator.service";
import { AiProvider } from "../../src/providers/ai-provider.interface";
import { AiProviderRegistry } from "../../src/providers/ai-provider.registry";

@AI({ provider: "module-provider" })
@Injectable()
class ForRootFixtureService {
  @Completion()
  run(_input: string): string {
    return "";
  }
}

@AI({ provider: "async-provider" })
@Injectable()
class ForRootAsyncFixtureService {
  @Completion()
  run(_input: string): string {
    return "";
  }
}

describe("AiModule integration", () => {
  let moduleRef: TestingModule | undefined;

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
    moduleRef = undefined;
  });

  it("forRoot wires registry and orchestrator with configured providers", async () => {
    const execute = jest.fn().mockResolvedValue({ output: "from-root" });
    const fakeProvider: AiProvider = {
      name: "module-provider",
      execute,
    };

    moduleRef = await Test.createTestingModule({
      imports: [AiModule.forRoot({ providers: [fakeProvider] })],
      providers: [ForRootFixtureService],
    }).compile();
    await moduleRef.init();

    const registry = moduleRef.get(AiProviderRegistry);
    const orchestrator = moduleRef.get(AiOrchestratorService);
    const target = moduleRef.get(ForRootFixtureService);

    expect(registry.get("module-provider")).toBe(fakeProvider);

    const result = await orchestrator.execute<string>({
      target,
      methodName: "run",
      input: "payload",
    });

    expect(result).toBe("from-root");
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("forRootAsync wires registry and orchestrator from async factory", async () => {
    const execute = jest.fn().mockResolvedValue({ output: "from-async-root" });
    const fakeProvider: AiProvider = {
      name: "async-provider",
      execute,
    };

    moduleRef = await Test.createTestingModule({
      imports: [
        AiModule.forRootAsync({
          useFactory: async () => ({
            providers: [fakeProvider],
          }),
        }),
      ],
      providers: [ForRootAsyncFixtureService],
    }).compile();
    await moduleRef.init();

    const registry = moduleRef.get(AiProviderRegistry);
    const orchestrator = moduleRef.get(AiOrchestratorService);
    const target = moduleRef.get(ForRootAsyncFixtureService);

    expect(registry.get("async-provider")).toBe(fakeProvider);

    const result = await orchestrator.execute<string>({
      target,
      methodName: "run",
      input: "payload",
    });

    expect(result).toBe("from-async-root");
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
