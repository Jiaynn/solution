import { lexicCompare } from '.'

describe('lexicCompare', () => {
  it('should work correctly', () => {
    expect(lexicCompare('a', 'b')).toBeLessThan(0)
    expect(lexicCompare('b', 'a')).toBeGreaterThan(0)

    expect(lexicCompare('az', 'b')).toBeLessThan(0)
    expect(lexicCompare('b', 'az')).toBeGreaterThan(0)

    expect(lexicCompare('az', 'ba')).toBeLessThan(0)
    expect(lexicCompare('ba', 'az')).toBeGreaterThan(0)

    expect(lexicCompare('abcd', 'abcde')).toBeLessThan(0)
    expect(lexicCompare('abcde', 'abcd')).toBeGreaterThan(0)
  })

  it('should work correctly for numbers', () => {
    expect(lexicCompare('0', '1')).toBeLessThan(0)
    expect(lexicCompare('1', '0')).toBeGreaterThan(0)

    expect(lexicCompare('09', '1')).toBeLessThan(0)
    expect(lexicCompare('1', '09')).toBeGreaterThan(0)

    expect(lexicCompare('0123', '01234')).toBeLessThan(0)
    expect(lexicCompare('01234', '0123')).toBeGreaterThan(0)

    expect(lexicCompare('00001', 'abc')).toBeLessThan(0)
    expect(lexicCompare('abc', '00001')).toBeGreaterThan(0)
  })

  it('should work correctly for sort', () => {
    expect(
      ['1111', 'abc', '0001', 'z01', 'test', 'adsa_sa'].sort(lexicCompare)
    ).toEqual(
      ['0001', '1111', 'abc', 'adsa_sa', 'test', 'z01']
    )
  })
})
