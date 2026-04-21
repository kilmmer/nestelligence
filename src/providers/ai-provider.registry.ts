import { Injectable } from "@nestjs/common";

import {
  AiConfigurationError,
  AiProviderNotFoundError,
} from "../errors/ai.error";
import { AiProvider } from "./ai-provider.interface";

@Injectable()
export class AiProviderRegistry {
  private readonly providers = new Map<string, AiProvider>();

  register(provider: AiProvider): void {
    const key = this.normalize(provider.name);

    if (this.providers.has(key)) {
      throw new AiConfigurationError(
        `AI provider "${provider.name}" is already registered.`,
      );
    }

    this.providers.set(key, provider);
  }

  registerMany(providers: AiProvider[]): void {
    for (const provider of providers) {
      this.register(provider);
    }
  }

  has(name: string): boolean {
    return this.providers.has(this.normalize(name));
  }

  get(name: string): AiProvider {
    const provider = this.providers.get(this.normalize(name));

    if (!provider) {
      throw new AiProviderNotFoundError(name);
    }

    return provider;
  }

  unregister(name: string): boolean {
    return this.providers.delete(this.normalize(name));
  }

  list(): string[] {
    return [...this.providers.keys()];
  }

  clear(): void {
    this.providers.clear();
  }

  private normalize(name: string): string {
    const normalized = name.trim().toLowerCase();

    if (!normalized) {
      throw new AiConfigurationError("AI provider name cannot be empty.");
    }

    return normalized;
  }
}
