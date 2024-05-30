import type { Config } from '@jest/types'

const configg: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [".d.ts", ".js"],
  verbose: true,
}
export default configg