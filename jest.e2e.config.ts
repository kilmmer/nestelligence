import type { Config } from "jest";

const config: Config = {
  displayName: "e2e",
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: [
    "<rootDir>/test/e2e/**/*.e2e-spec.ts",
    "<rootDir>/test/e2e/**/*.spec.ts",
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  clearMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;
