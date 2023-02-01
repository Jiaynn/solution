/**
 * @file unit tests for isURL utils
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { isURL, parseUrlQuery, upsertUrlQuery } from './url'

const testDataTable = [
  { url: '', want: false },
  { url: ' ', want: false },
  { url: 'http://', want: false },
  { url: 'http://a.com', want: true },
  { url: 'https://a.com', want: true },
  { url: 'htt://a.com', want: false },
  { url: 'htts://a.com', want: false },
  { url: 'httP://a.com', want: true },
  { url: 'httPs://a.com', want: true },
  { url: 'httP://a.b.c.com', want: true },
  { url: 'httP://a. b.c.com', want: false },
  { url: 'https://aaaaaaaa', want: true },
  { url: 'https://a.com:80', want: true },
  { url: 'https://a.com:80#hash=test', want: true },
  { url: 'https://a.com:80?query=test', want: true },
  { url: 'https://我爱.中国', want: true },
  { url: 'https://我爱中国', want: true },
  { url: 'https://.我爱中国', want: false },
  { url: 'https://我爱中国.', want: false },
  { url: 'https://我 爱中国.', want: false },
  { url: 'https://[2001:DB8:0:23:8:800:200C:417A]', want: true },
  { url: 'https://[2001:DB8:0:23:8:800:200C:417A]:80', want: true },
  { url: 'https://我-爱-中.国', want: true },
  { url: 'https://1.2.3.4', want: true },
  { url: 'https://π', want: true }, // 真的合法,可以访问这个网站看看 http://π.com
  { url: 'https://鿏', want: true }, // 这个字是在晚期（Unicode 10.0.0 时间：2017年6月 ）加入的、很多网站都不支持,实际上是合法汉字
  { url: 'https://a', want: true },
  { url: 'https://a::b', want: false },
  { url: 'https://a..b', want: false },
  { url: 'https://a--b', want: true },
  { url: 'https://a.:b', want: false },
  { url: 'https://a.-:b', want: false },
  { url: 'https://a.--:b', want: false },
  // 几种常见空白符号
  { url: 'https://a\n\nb', want: false },
  { url: 'https://a\r\rb', want: false },
  { url: 'https://a\f\fb', want: false },
  { url: 'https://a\t\tb', want: false },
  { url: 'https://a\b\bb', want: false },
  { url: 'https://a\v\vb', want: false },
  { url: 'https://a\u1680\u1680a', want: false },
  { url: 'https://a\u180e\u180eb', want: false },
  { url: 'https://a\u2000\u2000b', want: false },
  { url: 'https://a\u200a\u200ab', want: false },
  { url: 'https://a\u2028\u2028b', want: false },
  { url: 'https://a\u2029\u2029b', want: false },
  { url: 'https://a\u202f\u202fb', want: false },
  { url: 'https://a\u205f\u205fb', want: false },
  { url: 'https://a\u3000\u3000b', want: false },
  { url: 'https://a\0\0b', want: false },

  // node 的 URL 实现与浏览器不一样，node 里 new URL 不会转码
  // 所以单测这里是可以的，但是实际上浏览器里是不行的
  // 白话就是：也就是下面这几个 node 环境可以识别非法
  // 但是浏览器里不行、浏览器脑残直接编码
  // 所以这一部分是硬编码排除的
  { url: 'https://a（（', want: false },
  { url: 'https://a））', want: false },
  { url: 'https://a！', want: false },
  { url: 'https://a|', want: false },
  { url: 'https://a「', want: false },
  { url: 'https://a」', want: false },
  { url: 'https://a—', want: false },

  // 默认不支持 *
  { url: 'https://*.com', want: false },
  { url: 'https://*.a.c.com', want: false },
  { url: 'https://a.*.v.c.c.d', want: false },
  { url: 'https://a.*.v.c.c.*', want: false }
]

// port hash search 几个放一起了
const portHashSearchTestDataTable = [
  // 简单的测试
  { url: 'https://a.com:3030', allowPort: false, want: false },
  { url: 'https://a.com#4444', allowHash: false, want: false },
  { url: 'https://a.com?33&33', allowSearch: false, want: false },
  { url: 'https://a.com:3030', allowPort: true, want: true },
  { url: 'https://a.com#4444', allowHash: true, want: true },
  { url: 'https://a.com?33&33', allowSearch: true, want: true },

  // 与泛域名交叉测试
  { url: 'https://*.com:3030', allowGeneric: true, allowPort: false, want: false },
  { url: 'https://*.com#4444', allowGeneric: true, allowHash: false, want: false },
  { url: 'https://*.com?33&33', allowGeneric: true, allowSearch: false, want: false },
  { url: 'https://*.com:3030', allowGeneric: false, allowPort: true, want: false },
  { url: 'https://*.com#4444', allowGeneric: false, allowHash: true, want: false },
  { url: 'https://*.com?33&33', allowGeneric: false, allowSearch: true, want: false },

  // 泛域名+协议头的交叉测试
  { url: '*.com:3030', ignoreProtocol: true, allowGeneric: true, allowPort: false, want: false },
  { url: '*.com#4444', ignoreProtocol: true, allowGeneric: true, allowHash: false, want: false },
  { url: '*.com?33&33', ignoreProtocol: true, allowGeneric: true, allowSearch: false, want: false },
  { url: '*.com:3030', ignoreProtocol: false, allowGeneric: true, allowPort: true, want: false },
  { url: '*.com#4444', ignoreProtocol: false, allowGeneric: true, allowHash: true, want: false },
  { url: '*.com?33&33', ignoreProtocol: false, allowGeneric: true, allowSearch: true, want: false },

  // 泛域名+相对协议头的交叉测试
  {
    url: '//*.com:3030',
    allowRelativeProtocol: true,
    ignoreProtocol: true,
    allowGeneric: true,
    allowPort: false,
    want: false
  },
  {
    url: '//*.com#4444',
    allowRelativeProtocol: true,
    ignoreProtocol: true,
    allowGeneric: true,
    allowHash: false,
    want: false
  },
  {
    url: '//*.com?33&33',
    allowRelativeProtocol: true,
    ignoreProtocol: true,
    allowGeneric: true,
    allowSearch: false,
    want: false
  },
  {
    url: '//*.com:3030',
    allowRelativeProtocol: true,
    ignoreProtocol: false,
    allowGeneric: true,
    allowPort: true,
    want: true
  },
  {
    url: '//*.com#4444',
    allowRelativeProtocol: true,
    ignoreProtocol: false,
    allowGeneric: true,
    allowHash: true,
    want: true
  },
  {
    url: '//*.com?33&33',
    allowRelativeProtocol: true,
    ignoreProtocol: false,
    allowGeneric: true,
    allowSearch: true,
    want: true
  }
]

const testProtocolCrossDataTable = [
  { url: 'a.com', ignoreProtocol: false, allowRelativeProtocol: true, want: false },
  { url: '//a.com', ignoreProtocol: false, allowRelativeProtocol: true, want: true },
  { url: 'http://a.com', ignoreProtocol: false, allowRelativeProtocol: true, want: true },
  { url: 'https://a.com', ignoreProtocol: false, allowRelativeProtocol: true, want: true },

  { url: 'a.com', ignoreProtocol: true, allowRelativeProtocol: false, want: true },
  { url: '//a.com', ignoreProtocol: true, allowRelativeProtocol: false, want: false },
  { url: 'http://a.com', ignoreProtocol: true, allowRelativeProtocol: false, want: true },
  { url: 'https://a.com', ignoreProtocol: true, allowRelativeProtocol: false, want: true },

  { url: 'a.com', ignoreProtocol: false, allowRelativeProtocol: false, want: false },
  { url: '//a.com', ignoreProtocol: false, allowRelativeProtocol: false, want: false },
  { url: 'http://a.com', ignoreProtocol: false, allowRelativeProtocol: false, want: true },
  { url: 'https://a.com', ignoreProtocol: false, allowRelativeProtocol: false, want: true },

  { url: 'a.com', ignoreProtocol: true, allowRelativeProtocol: true, want: true },
  { url: '//a.com', ignoreProtocol: true, allowRelativeProtocol: true, want: true },
  { url: 'http://a.com', ignoreProtocol: true, allowRelativeProtocol: true, want: true },
  { url: 'https://a.com', ignoreProtocol: true, allowRelativeProtocol: true, want: true }
]

// 替换原来测试数据的协议头来生成一组新的测试数据
const testRelativeProtocolDataTable = testDataTable
  // 先过滤掉原本没有协议或协议不对的，这部分加上协议头 结果会不一样
  .filter(data => /^https?/i.test(data.url))
  .map(data => ({ ...data, url: data.url.replace(/^https?:\/\//i, '//') }))

// 删除测试数据的协议头来生成一组新的测试数据
const testNoProtocolDataTable = testRelativeProtocolDataTable
  .filter(data => /^https?/i.test(data.url))
  .map(data => ({ ...data, url: data.url.replace(/\/\//i, '') }))

// 生成一组新的 原本包含 * 的 want 设成 true
const testPanDataTable = testDataTable.map(data => {
  if (data.url && data.url.includes('*')) {
    return { ...data, want: true }
  }
  return data
})

describe('isURL test', () => {
  it('test table data', () => {
    testDataTable.forEach(testData => {
      expect(isURL(testData.url)).toBe(testData.want)
    })
  })

  it('test pan table data', () => {
    testPanDataTable.forEach(testData => {
      expect(isURL(testData.url, { allowGeneric: true })).toBe(testData.want)
    })
  })

  it('test no protocol header table data', () => {
    testNoProtocolDataTable.forEach(testData => {
      expect(isURL(testData.url, { ignoreProtocol: true })).toBe(testData.want)
    })
  })

  it('test relative protocol header table data', () => {
    testRelativeProtocolDataTable.forEach(testData => {
      expect(isURL(testData.url, { allowRelativeProtocol: true })).toBe(testData.want)
    })
  })

  it('test protocol cross table data', () => {
    testProtocolCrossDataTable.forEach(testData => {
      const { url, want, ...options } = testData
      expect(isURL(url, options)).toBe(want)
    })
  })

  it('test port、hash、search table data', () => {
    portHashSearchTestDataTable.forEach(testData => {
      const { url, want, ...options } = testData
      expect(isURL(url, options)).toBe(want)
    })
  })
})

describe('upsertUrlQuery test', () => {
  const upsertUrlQueryTestDataTable = [
    { url: 'https://a.com:3030', query: { test: '1' }, expected: 'https://a.com:3030?test=1' },
    { url: 'https://a.com:3030?test', query: { test: '1' }, expected: 'https://a.com:3030?test=1' },
    { url: 'https://a.com:3030?test=', query: { test: '1' }, expected: 'https://a.com:3030?test=1' },
    { url: 'https://a.com:3030?test=1', query: { test: '1' }, expected: 'https://a.com:3030?test=1' },
    { url: 'https://a.com:3030?test2=1', query: { test: '1' }, expected: 'https://a.com:3030?test=1&test2=1' },
    { url: 'https://a.com:3030?test=0&test2=1', query: { test: '1' }, expected: 'https://a.com:3030?test=1&test2=1' },

    { url: 'https://a.com/#/hash', query: { test: '1' }, expected: 'https://a.com/?test=1#/hash' },
    { url: 'https://a.com/#/hash?test', query: { test: '1' }, expected: 'https://a.com/#/hash?test=1' },
    { url: 'https://a.com/#/hash?test=', query: { test: '1' }, expected: 'https://a.com/#/hash?test=1' },
    { url: 'https://a.com/#/hash?test=1', query: { test: '1' }, expected: 'https://a.com/#/hash?test=1' },
    { url: 'https://a.com/#/hash?test2=1', query: { test: '1' }, expected: 'https://a.com/#/hash?test=1&test2=1' },
    { url: 'https://a.com/#/hash?test=0&test2=1', query: { test: '1' }, expected: 'https://a.com/#/hash?test=1&test2=1' },
    { url: 'https://a.com/path#/hash?test2=1', query: { test: '1' }, expected: 'https://a.com/path#/hash?test=1&test2=1' },
    { url: 'https://a.com:3030?test2=1#/hash', query: { test: '1' }, expected: 'https://a.com:3030?test=1&test2=1#/hash' },
    { url: 'https://a.com/path/child/#/hash?test2=1', query: { test: '1' }, expected: 'https://a.com/path/child/#/hash?test=1&test2=1' },
    { url: 'https://a.com/path/#/hash/child?test2=1', query: { test: '1' }, expected: 'https://a.com/path/#/hash/child?test=1&test2=1' }
  ]

  it('test table data', () => {
    upsertUrlQueryTestDataTable.forEach(testData => {
      const result = upsertUrlQuery(testData.url, testData.query)
      expect(result).toBe(testData.expected)
    })
  })

  it('test multiple query statement', () => {
    expect(() => upsertUrlQuery('https://a.com:3030/path/child?test2=1#hash/child?test=2', { test: '1' })).toThrow()
  })
})

describe('parseUrlQuery test', () => {
  const parseUrlQueryTestDataTable = [
    { url: 'https://a.com:3030', expected: {} },
    { url: 'https://a.com:3030?test', expected: { test: null } },
    { url: 'https://a.com:3030?test=', expected: { test: '' } },
    { url: 'https://a.com:3030?test=1', expected: { test: '1' } },
    { url: 'https://a.com:3030?test=0&test2=1', expected: { test: '0', test2: '1' } },

    { url: 'https://a.com/#/hash', expected: {} },
    { url: 'https://a.com/#/hash?test', expected: { test: null } },
    { url: 'https://a.com/#/hash?test', expected: { test: null } },
    { url: 'https://a.com/#/hash?test=', expected: { test: '' } },
    { url: 'https://a.com/#/hash?test=1', expected: { test: '1' } },
    { url: 'https://a.com:3030?test2=1/#/hash', expected: { test2: '1/' } },
    { url: 'https://a.com/path/#/hash/child?test2=1', expected: { test2: '1' } },
    { url: 'https://a.com/path/child/#/hash/child?test2=1', expected: { test2: '1' } },
    { url: 'https://a.com/#/hash/child?test=0&test2=1', expected: { test: '0', test2: '1' } }
  ]

  it('test table data', () => {
    parseUrlQueryTestDataTable.forEach(testData => {
      const result = parseUrlQuery(testData.url)
      expect(result).toEqual(testData.expected)
    })
  })

  it('test multiple query statement', () => {
    expect(() => parseUrlQuery('https://a.com:3030/path/child?test2=1#hash/child?test=2')).toThrow()
  })
})
