/* eslint-disable */

// polyfill fetch (as client in qn-fe-core uses Response)
require('whatwg-fetch')

const moment = require('moment')
require('moment/locale/zh-cn')
const mt = require('moment-timezone')

moment.locale('zh-cn')
moment.tz.setDefault('Asia/Shanghai')

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

// jest.mock('rc-animate', () => props => props.children)
