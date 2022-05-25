/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  silent: true,
  setupFilesAfterEnv: ["jest-extended/all"],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
}
