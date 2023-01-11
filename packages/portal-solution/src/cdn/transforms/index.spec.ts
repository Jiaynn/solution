import { atoi, atof, trimAndFilter, splitLines, filterQuery } from '.'

describe('atoi', () => {
  it('works correctly', () => {
    expect(atoi('-1')).toBe(-1)
    expect(atoi('0')).toBe(0)
    expect(atoi('1')).toBe(1)
    expect(atoi('1.2')).toBe(1)
    expect(atoi('0.0')).toBe(0)
    expect(atoi('10')).toBe(10)
    expect(atoi('100')).toBe(100)
    expect(atoi('0x16')).toBe(0)
    expect(atoi('aaa')).toBe(0)
  })

  it('works correctly with given valueForInvalidInput', () => {
    expect(atoi('-1', -1)).toBe(-1)
    expect(atoi('0', -1)).toBe(0)
    expect(atoi('1', -1)).toBe(1)
    expect(atoi('1.2', -1)).toBe(1)
    expect(atoi('0.0', -1)).toBe(0)
    expect(atoi('10', -1)).toBe(10)
    expect(atoi('100', -1)).toBe(100)
    expect(atoi('0x16', -1)).toBe(0)
    expect(atoi('aaa', -1)).toBe(-1)
  })
})

describe('atof', () => {
  it('works correctly', () => {
    expect(atof('-1')).toBe(-1)
    expect(atof('0')).toBe(0)
    expect(atof('1')).toBe(1)
    expect(atof('1.2')).toBe(1.2)
    expect(atof('0.0')).toBe(0)
    expect(atof('10')).toBe(10)
    expect(atof('100')).toBe(100)
    expect(atof('0x16')).toBe(0)
    expect(atof('aaa')).toBe(0)
  })

  it('works correctly with given valueForInvalidInput', () => {
    expect(atof('-1', -1)).toBe(-1)
    expect(atof('0', -1)).toBe(0)
    expect(atof('1', -1)).toBe(1)
    expect(atof('1.2', -1)).toBe(1.2)
    expect(atof('0.0', -1)).toBe(0)
    expect(atof('10', -1)).toBe(10)
    expect(atof('100', -1)).toBe(100)
    expect(atof('0x16', -1)).toBe(0)
    expect(atof('aaa', -1)).toBe(-1)
  })
})

describe('trimAndFilter', () => {
  it('works correctly', () => {
    expect(trimAndFilter([])).toEqual([])
    expect(trimAndFilter([''])).toEqual([])
    expect(trimAndFilter(['', '  '])).toEqual([])
    expect(trimAndFilter(['1', '2', '', '  ', '3 ', '\n4', ' 5 \n '])).toEqual(['1', '2', '3', '4', '5'])
  })
})

describe('splitLines', () => {
  it('works correctly', () => {
    expect(splitLines('')).toEqual([])
    expect(splitLines(null)).toEqual([])
    expect(splitLines(undefined)).toEqual([])
    expect(splitLines('1')).toEqual(['1'])
    expect(splitLines('1 2')).toEqual(['1 2'])
    expect(splitLines('1 2\n3')).toEqual(['1 2', '3'])
  })
})

describe('filterQuery', () => {
  it('should work correctly', () => {
    expect(filterQuery(undefined)).toBe(undefined)
    expect(filterQuery({})).toEqual({})
    expect(filterQuery({ a: 'a' })).toEqual({ a: 'a' })
    expect(filterQuery({ a: 'a', b: '', c: 'c' })).toEqual({ a: 'a', c: 'c' })
  })
})
