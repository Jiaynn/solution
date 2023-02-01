import { OutputFormat } from '../utils'
import { decodeAutoScale, decodeDuration, decodeFormat, decodeOffset, decode, decodeResolution, encodeAutoScale, encodeDuration, encodeFormat, encodeOffset, encodeResolution } from './avthumb'

describe('decode', () => {
  it('decodeQuery should work well', () => {
    expect(decode('avthumb/gif/ss/0.1/s/100x100/t/5/autoscale/2')).toEqual({
      type: 'avthumb',
      format: 'gif',
      offset: 0.1,
      duration: 5,
      w: 100,
      h: 100,
      autoScale: 2
    })
    // 宽度和高度只有一个能在 2160 到 3840 之间
    expect(() => decode('avthumb/gif/ss/0.1/s/2200x2200/t/5/autoscale/2')).toThrow()
    // 不支持的参数 q
    expect(() => decode('avthumb/gif/ss/0.1/s/2200x2200/t/5/autoscale/2/q/100')).toThrow()
  })

  it('decodeFormat should work well', () => {
    expect(decodeFormat('avthumb/gif')).toEqual('gif')
    expect(() => decodeFormat('avthumb/png')).toThrow()
  })

  it('decodeOffset should work well', () => {
    expect(decodeOffset('/ss/0/')).toBe(0)
    expect(decodeOffset('/ss/0')).toBe(0)
    // 小数
    expect(decodeOffset('/ss/0.111')).toBe(0.111)
    // 超过3位小数报错
    expect(() => decodeOffset('/ss/0.1111')).toThrow()
    // 负数报错
    expect(() => decodeOffset('/ss/-1')).toThrow()
    // 不是数字报错
    expect(() => decodeOffset('/ss/!1')).toThrow()
    expect(() => decodeOffset('/ss/+1')).toThrow()
  })

  it('decodeResolution should work well', () => {
    expect(decodeResolution('/s/100x100/')).toEqual([100, 100])
    expect(decodeResolution('/s/100x100/')).toEqual([100, 100])
    expect(decodeResolution('/s/100x/')).toEqual([100, null])
    expect(decodeResolution('/s/x100/')).toEqual([null, 100])
    // 小数报错
    expect(() => decodeResolution('/s/20.1')).toThrow()
    expect(() => decodeResolution('/s/20')).toThrow()
    expect(() => decodeResolution('/s/20xx20')).toThrow()
    expect(() => decodeResolution('/s/+100x')).toThrow()
    // 负数报错
    expect(() => decodeResolution('/s/-20x')).toThrow()
    // 不是数字报错
    expect(() => decodeResolution('/s/!20x')).toThrow()
    // 小于 20 报错
    expect(() => decodeResolution('/s/19x')).toThrow()
    // 大于 3840 报错
    expect(() => decodeResolution('/s/4000')).toThrow()
  })

  it('decodeDuration should work well', () => {
    expect(decodeDuration('/t/2/')).toBe(2)
    expect(decodeDuration('/t/2')).toBe(2)
    expect(decodeDuration('/t/0.1')).toBe(0.1)
    expect(decodeDuration('/t/5')).toBe(5)
    // 超过3位小数报错
    expect(() => decodeDuration('/t/0.1111')).toThrow()
    // 大于5报错
    expect(() => decodeDuration('/t/5.1')).toThrow()
    // 等于0报错
    expect(() => decodeDuration('/t/0')).toThrow()
    // 负数报错
    expect(() => decodeDuration('/t/-1')).toThrow()
    // 不是数字报错
    expect(() => decodeDuration('/t/!1')).toThrow()
    expect(() => decodeDuration('/t/+1')).toThrow()
  })

  it('decodeAutoScale should work well', () => {
    expect(decodeAutoScale('/autoscale/2/')).toBe(2)
    expect(decodeAutoScale('/autoscale/2')).toBe(2)
    expect(decodeAutoScale('/autoscale/1')).toBe(1)
    expect(decodeAutoScale('/autoscale/0')).toBe(0)
    // 非数字报错
    expect(() => decodeAutoScale('/autoscale/a')).toThrow()
    // 非 1、2、3 报错
    expect(() => decodeAutoScale('/autoscale/4')).toThrow()
    expect(() => decodeAutoScale('/autoscale/0.1')).toThrow()
    // 负数报错
    expect(() => decodeAutoScale('/autoscale/-1')).toThrow()
    // 不是数字报错
    expect(() => decodeAutoScale('/autoscale/!1')).toThrow()
    expect(() => decodeAutoScale('/autoscale/+1')).toThrow()
  })
})

// encode 没有再做参数校验，如果有必要再补上
describe('encode', () => {
  it('encode shoud work well', () => {
    expect(encodeFormat(OutputFormat.Gif)).toBe('avthumb/gif')
    expect(encodeOffset(null)).toBe('')
    expect(encodeOffset(10)).toBe('/ss/10')
    expect(encodeResolution(null, null)).toBe('')
    expect(encodeResolution(20, null)).toBe('/s/20x')
    expect(encodeResolution(null, 20)).toBe('/s/x20')
    expect(encodeResolution(20, 20)).toBe('/s/20x20')
    expect(encodeDuration(null)).toBe('')
    expect(encodeDuration(2)).toBe('/t/2')
    expect(encodeAutoScale(null)).toBe('')
    expect(encodeAutoScale(2)).toBe('/autoscale/2')
  })
})
