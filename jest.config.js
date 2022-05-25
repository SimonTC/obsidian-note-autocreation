/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  silent: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
}
