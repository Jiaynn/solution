import { OutputFormat } from '../utils'
import { decode, decodeOffset, decodeW, decodeFormat, decodeH, encodeFormat, encodeOffset, encodeW, encodeH } from './vframe'

describe('decode', () => {
  it('decode should work well', () => {
    expect(decode('vframe/jpg/offset/0.1/w/100/h/100')).toEqual({
      type: 'vframe',
      format: 'jpg',
      offset: 0.1,
      w: 100,
      h: 100
    })
    expect(decode('vframe/png/offset/0.1/w/100/h/100')).toEqual({
      type: 'vframe',
      format: 'png',
      offset: 0.1,
      w: 100,
      h: 100
    })
    // 宽度和高度只有一个能在 2160 到 3840 之间
    expect(() => decode('vframe/png/offset/0.1/w/2200/h/2200')).toThrow()
    // 不支持的参数 q
    expect(() => decode('vframe/gif/offset/0/w/100/h/100/q/100')).toThrow()
  })

  it('decodeFormat should work well', () => {
    expect(decodeFormat('vframe/jpg')).toEqual('jpg')
    expect(decodeFormat('vframe/png')).toEqual('png')
    expect(() => decodeFormat('vframe/gif')).toThrow()
    expect(() => decodeFormat('abc/jpg')).toThrow()
  })

  it('decodeOffset should work well', () => {
    expect(decodeOffset('/offset/0/')).toBe(0)
    expect(decodeOffset('/offset/0')).toBe(0)
    // 小数
    expect(decodeOffset('/offset/0.111')).toBe(0.111)
    // 超过3位小数报错
    expect(() => decodeOffset('offset/0.1111')).toThrow()
    // 负数报错
    expect(() => decodeOffset('/offset/-1')).toThrow()
    // 不是数字报错
    expect(() => decodeOffset('/offset/!1')).toThrow()
    expect(() => decodeOffset('/offset/+1')).toThrow()
  })

  it('decodeW should work well', () => {
    expect(decodeW('/w/20/')).toBe(20)
    expect(decodeW('/w/20')).toBe(20)
    // 小数报错
    expect(() => decodeW('/w/20.1')).toThrow()
    // 负数报错
    expect(() => decodeW('/w/-20')).toThrow()
    // 不是数字报错
    expect(() => decodeW('/w/!20')).toThrow()
    // 小于 20 报错
    expect(() => decodeW('/w/19')).toThrow()
    // 大于 3840 报错
    expect(() => decodeW('/w/4000')).toThrow()
    expect(() => decodeW('/w/+20')).toThrow()
  })

  it('decodeH should work well', () => {
    expect(decodeH('/h/20/')).toBe(20)
    expect(decodeH('/h/20')).toBe(20)
    // 小数报错
    expect(() => decodeH('/h/20.1')).toThrow()
    // 负数报错
    expect(() => decodeH('/h/-20')).toThrow()
    // 不是数字报错
    expect(() => decodeH('/h/!20')).toThrow()
    // 小于 20 报错
    expect(() => decodeH('/h/19')).toThrow()
    // 大于 3840 报错
    expect(() => decodeH('/h/4000')).toThrow()
    expect(() => decodeH('/h/+20')).toThrow()
  })
})

// encode 没有再做参数校验，如果有必要再补上
describe('encode', () => {
  it('encode shoud work well', () => {
    expect(encodeFormat(OutputFormat.Jpg)).toBe('vframe/jpg')
    expect(encodeOffset(0)).toBe('/offset/0')
    expect(encodeW(10)).toBe('/w/10')
    expect(encodeH(10)).toBe('/h/10')
  })
})
