/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./test/jest-setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/lsrs/core/**/*.ts",
    "src/lsrs/helper/**/*.ts",
    "src/lsrs/web/**/*.ts"
  ],
  coverageReporters: ["text", "html"],
  coverageThreshold: {global: {lines: 90, branches: 80}}
};
