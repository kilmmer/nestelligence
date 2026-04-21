import type { Config } from "jest";

const config: Config = {
  displayName: "unit",
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/test/unit/**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  clearMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;
