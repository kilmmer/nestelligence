import type { Config } from "jest";

const config: Config = {
  projects: [
    "<rootDir>/jest.unit.config.ts",
    "<rootDir>/jest.integration.config.ts",
    "<rootDir>/jest.e2e.config.ts",
  ],
  coverageProvider: "v8",
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/**/*.d.ts",
    "!<rootDir>/src/index.ts",
    "!<rootDir>/src/main.ts",
    "!<rootDir>/src/**/*.module.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "html", "json-summary"],
  coverageThreshold: {
    global: {
      branches: 98,
      functions: 98,
      lines: 98,
      statements: 98,
    },
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;
