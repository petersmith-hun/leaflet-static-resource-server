/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: [
    "src/lsrs/core/**/*.ts",
    "src/lsrs/helper/**/*.ts",
    "src/lsrs/web/**/*.ts"
  ],
  coverageReporters: ["text", "html"],
  coverageThreshold: {global: {lines: 90, branches: 80}},
  maxWorkers: 2,
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/lsrs/$1',
    '@package': '<rootDir>/package.json',
    '@build-time': '<rootDir>/build-time.json',
    '@testdata/dao': '<rootDir>/tests/lsrs/core/dao/uploaded-file-dao.testdata',
    '@testdata/service': '<rootDir>/tests/lsrs/core/service/service.testdata',
    '@testdata/web': '<rootDir>/tests/lsrs/web/web.testdata',
  }
};
