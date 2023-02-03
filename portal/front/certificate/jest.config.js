module.exports = {
  setupFiles: [
    '<rootDir>/test/setup.js'
  ],
  modulePaths: ['<rootDir>'],
  globals: {
    'ts-jest': {
      babelConfig: false
    }
  },
  transform: {
    '.(ts|tsx)': 'ts-jest'
  },
  testRegex: '.+\\.spec\\.(ts|tsx|js)$',
  testPathIgnorePatterns: [
    'node_modules',
    'spock',
    'test'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/test/file-mock.js',
    '\\.svg(\\?.*|$)': '<rootDir>/test/svg-sprite-mock.js',
    '\\.(css|less)$': '<rootDir>/test/style-mock.js',
    '^react\\-dom$': '<rootDir>/test/react-dom-mock.js',
    '^react\\-dom\\/lib\\/ReactDOM$': '<rootDir>/test/react-dom-mock.js',
    '^react\\-dom\\/lib\\/getVendorPrefixedEventName$': '<rootDir>/test/react-dom-getVendorPrefixedEventName-mock.js',
    '^icecream\\-base$': '<rootDir>/node_modules/icecream-base/lib',
    '^react\\-icecream\\-2\\/icons$': '<rootDir>/node_modules/react-icecream-2/lib/icons/index.js',
    '^react\\-icecream\\-2\\/form\\-x$': '<rootDir>/node_modules/react-icecream-2/lib/form-x/index.js',
    '^react\\-icecream\\-2$': '<rootDir>/node_modules/react-icecream-2/lib',
    '^qn\\-fe\\-core/(.*)$': '<rootDir>/node_modules/qn-fe-core/lib/$1',
    '^portal\\-base/(.*)$': '<rootDir>/node_modules/portal-base/lib/$1',
    '^copy\\-text\\-to\\-clipboard(.*)$': '<rootDir>/test/copy-text-to-clipboard.js'
  },
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}'
  ],
  coverageDirectory: '__coverage__',
  coverageReporters: ['lcov', 'text', 'cobertura'],
  coveragePathIgnorePatterns: [
    '<rootDir>/test/'
  ],
  testURL: 'https://portal.qiniu.com'
}
