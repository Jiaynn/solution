/* eslint-disable */

const mt = require('moment-timezone')
const moment = require('moment')

moment.tz.setDefault('Asia/Shanghai')

global.BUILD_TARGET = "qiniu"
global.OEM_CONFIG = { vendor: "" }
global.APP_VERSION = '<BUILD_AT>-<COMMIT_ID>'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})
