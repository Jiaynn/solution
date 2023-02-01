import { validatePort, validatePortText, validateWeight, validateAdvancedSource } from './advanced-source'

it('validatePort should work correctly', () => {
  expect(typeof validatePort(0)).toBe('string')
  expect(validatePort(1)).toBeNull()
  expect(validatePort(3000)).toBeNull()
  expect(validatePort(80)).toBeNull()
  expect(validatePort(8080)).toBeNull()
  expect(validatePort(65535)).toBeNull()
  expect(typeof validatePort(65536)).toBe('string')
  expect(typeof validatePort(100000)).toBe('string')
})

it('validatePortText should work correctly', () => {
  expect(typeof validatePortText('0')).toBe('string')
  expect(validatePortText('1')).toBeNull()
  expect(validatePortText('3000')).toBeNull()
  expect(validatePortText('80')).toBeNull()
  expect(validatePortText('8080')).toBeNull()
  expect(validatePortText('65535')).toBeNull()
  expect(typeof validatePortText('65536')).toBe('string')
  expect(typeof validatePortText('100000')).toBe('string')
  expect(typeof validatePortText('1.5')).toBe('string')
  expect(typeof validatePortText('.5')).toBe('string')
  expect(typeof validatePortText('65535.2')).toBe('string')
  expect(typeof validatePortText('aaa')).toBe('string')
})

it('validateWeight should work correctly', () => {
  expect(typeof validateWeight(-1)).toBe('string')
  expect(typeof validateWeight(0)).toBe('string')
  expect(validateWeight(1)).toBeNull()
  expect(validateWeight(3000)).toBeNull()
  expect(typeof validateWeight(1.3)).toBe('string')
  expect(typeof validateWeight(1.7)).toBe('string')
})

const mockDomain = {
  name: 'mock.com'
} as any

it('validateAdvancedSource should work correctly', () => {
  const validator = validateAdvancedSource([mockDomain])

  expect(validator({
    host: '',
    port: '80',
    weight: 10,
    backup: true
  })).toBe('域名/ip 必填')

  expect(validator({
    host: 'source.mock.com',
    port: '80',
    weight: 10,
    backup: true
  })).toBeNull()

  expect(validator({
    host: 'mock.com',
    port: '80',
    weight: 10,
    backup: true
  })).toBe('回源地址不能与加速域名相同')

  expect(validator({
    host: 'source.mock.com',
    port: 'abc',
    weight: 10,
    backup: true
  })).toBe('请输入正确的端口号')

  expect(validator({
    host: 'source.mock.com',
    port: '-1',
    weight: 10,
    backup: true
  })).toBe('请输入正确的端口号')

  expect(validator({
    host: 'source.mock.com',
    port: '65536',
    weight: 10,
    backup: true
  })).toBe('请输入正确的端口号')

  expect(validator({
    host: 'source.mock.com',
    port: '80',
    weight: -1,
    backup: true
  })).toBe('权重请输入正整数')

  expect(validator({
    host: 'source.mock.com',
    port: '80',
    weight: 0,
    backup: true
  })).toBe('权重请输入正整数')

  expect(validator({
    host: 'source.mock.com',
    port: '80',
    weight: NaN,
    backup: true
  })).toBe('请输入正确的权重')
})
