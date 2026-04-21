import type { Config } from "jest";

const config: Config = {
  displayName: "integration",
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: [
    "<rootDir>/test/integration/**/*.spec.ts",
    "<rootDir>/test/integration/**/*.int-spec.ts",
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  clearMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;
