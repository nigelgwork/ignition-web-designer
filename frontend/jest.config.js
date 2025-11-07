/**
 * Jest configuration for frontend tests
 *
 * Supports:
 * - TypeScript via ts-jest
 * - React Testing Library
 * - Module path aliases
 * - Coverage reporting
 */
module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // Transform files with ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Module name mapper for path aliases and static assets
  moduleNameMapper: {
    // Path aliases (match tsconfig.json)
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',

    // CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Static assets
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/src/__mocks__/fileMock.js',
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/standalone.tsx',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],

  // Coverage thresholds (enforce minimum coverage)
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],

  // Verbose output
  verbose: true,

  // Globals for ts-jest
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },

  // Max workers (parallel test execution)
  maxWorkers: '50%',

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: true,
}
