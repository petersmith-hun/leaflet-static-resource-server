/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./test/jest-setup.ts"],
  collectCoverage: true,
  coverageReporters: ["text", "html"],
  coverageThreshold: {global: {lines: 90, branches: 80}}
};
