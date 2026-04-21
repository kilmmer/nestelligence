export const AI_METADATA_KEYS = {
  CLASS_AI: "nestelligence:class:ai",
  METHOD_CHAT: "nestelligence:method:chat",
  METHOD_COMPLETION: "nestelligence:method:completion",
  METHOD_EMBED: "nestelligence:method:embed",
  METHOD_AGENT: "nestelligence:method:agent",
  METHOD_INVOCATION: "nestelligence:method:invocation",
  CLASS_TOOL: "nestelligence:class:tool",
  METHOD_TOOL: "nestelligence:method:tool",
  CLASS_MEMORY: "nestelligence:class:memory",
  METHOD_MEMORY: "nestelligence:method:memory",
  PROPERTY_MEMORY: "nestelligence:property:memory",
  CLASS_CONTEXT: "nestelligence:class:context",
  METHOD_CONTEXT: "nestelligence:method:context",
  PROPERTY_CONTEXT: "nestelligence:property:context",
} as const;

export type AiMetadataKey =
  (typeof AI_METADATA_KEYS)[keyof typeof AI_METADATA_KEYS];
