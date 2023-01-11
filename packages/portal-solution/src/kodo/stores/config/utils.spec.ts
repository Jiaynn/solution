import { normalizeEnable } from './utils'

describe('test normalize', () => {
  test('normalizeEnable', () => {
    const testObjectTable = [
      [{ enable: false, a: { b: { enable: false } } }, false],
      [{ enable: false, a: { b: { enable: true } } }, false],
      [{ enable: true, a: { b: { enable: false } } }, false],
      [{ enable: true, a: { b: { enable: true } } }, true]
    ] as const

    for (const [input, expected] of testObjectTable) {
      const result = normalizeEnable(input)
      expect(result === input).toBeFalsy()
      expect(result.a.b.enable).toStrictEqual(expected)
    }

    const testArrayTable = [
      [{ enable: false, a: { b: [{ enable: false }] } }, false],
      [{ enable: false, a: { b: [{ enable: true }] } }, false],
      [{ enable: true, a: { b: [{ enable: false }] } }, false],
      [{ enable: true, a: { b: [{ enable: true }] } }, true]
    ] as const

    for (const [input, expected] of testArrayTable) {
      const result = normalizeEnable(input)
      expect(result === input).toBeFalsy()
      expect(result.a.b[0].enable).toStrictEqual(expected)
    }
  })
})
