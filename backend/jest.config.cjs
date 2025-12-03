module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)',
  ],
  testMatch: [
    '**/tests/**/*.test.js',
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'models/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    'websocket/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  testTimeout: 10000,
  verbose: true,
  moduleFileExtensions: ['js', 'json'],
};
