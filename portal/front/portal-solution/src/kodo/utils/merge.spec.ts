/**
 * @file unit tests for deep merge utils
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import merge, { pureMergeAll } from './merge'

describe('test mergeAll', () => {
  it('test undefined', () => {
    expect(undefined).toBeUndefined()
    // eslint-disable-next-line no-void
    expect(undefined).toBe(void 0)
    expect(typeof undefined).toBe('undefined')
  })

  it('normal merge correctly', () => {
    class Obj {
      x = 8
      static x = 9
    }
    Obj.prototype = { x: 7 }

    const o1 = {
      // [Symbol()]: 'emmm',  // TODO: 好像生效了… 跟 immer 有关？
      a: 1,
      bb: {
        b: {
          x: 1,
          m: 1
        },
        q1: {},
        q2: {}
      },
      c: {
        y: 1
      },
      d: {
        p: 1
      },
      m: {
        bbb: 1
      },
      // eslint-disable-next-line
      list: [, null, 1, undefined, { g: { gg: 1, hg: 1 } }, , , ],
      obj: new Obj()
    }

    const o2 = {
      // eslint-disable-next-line symbol-description
      [Symbol()]: '~~~',
      a: undefined,
      bb: {
        b: {
          x: 2,
          n: 2
        },
        q1: {},
        q3: {}
      },
      c: {
        z: 2
      },
      e: {
        p: 2
      },
      m: {
        __proto__: {
          bbb: 2
        }
      },
      f: () => 2,
      // eslint-disable-next-line
      list: [, undefined, , { hh: 2 }, { g: { gg: 2, gh: 2 } }, , , , , , ],
      arr: new (class extends Array { gg: 1 })(),
      // eslint-disable-next-line no-new-wrappers
      s: new String('123')
    }

    const result = {
      a: undefined,
      bb: {
        b: {
          x: 2,
          m: 1,
          n: 2
        },
        q1: {},
        q2: {},
        q3: {}
      },
      c: {
        y: 1,
        z: 2
      },
      d: {
        p: 1
      },
      e: {
        p: 2
      },
      m: o2.m,
      f: o2.f,
      // eslint-disable-next-line
      list: [, undefined, 1, { hh: 2 }, { g: { hg: 1, gg: 2, gh: 2 } }, , , , , , ],
      arr: [],
      obj: o1.obj,
      s: o2.s,
      abc: 123
    }

    const o: any = merge(o1, o2, { abc: 123 })

    // 结构和内容的基本正确性
    expect(o).toEqual(result)

    // 无副作用
    expect(o1.bb.b.x).toBe(1)
    expect((o1 as any).e).toBeUndefined()
    expect((o1 as any).f).toBeUndefined()
    expect((o2 as any).d).toBeUndefined()

    // 路经分裂检测
    expect(o).not.toBe(o1)
    expect(o).not.toBe(o2)
    expect(o1).not.toBe(o2)
    expect(o1.bb).not.toBe(o2.bb)
    expect(o.bb).not.toBe(o1.bb)
    expect(o.bb).not.toBe(o2.bb)
    expect(o1.bb.b).not.toBe(o2.bb.b)
    expect(o.bb.b).not.toBe(o1.bb.b)
    expect(o.bb.b).not.toBe(o2.bb.b)
    expect(o.bb.q1).not.toBe(o2.bb.q1)

    // 复用引用检测：not deep clone
    expect(o.d).toBe(o1.d)
    expect(o.e).toBe(o2.e)
    expect(o.f).toBe(o2.f)
    expect(o.bb.q1).toBe(o1.bb.q1) // 反直觉吗？
    expect(o.bb.q2).toBe(o1.bb.q2)
    expect(o.bb.q3).toBe(o2.bb.q3)
    expect(o.f).toBe(o2.f)
    expect(o.m).toBe(o2.m)

    // 空值检测
    expect(o.a).toBeUndefined()
    expect(o.list.length).toEqual(result.list.length)
    expect(Object.prototype.hasOwnProperty.call(o.list, 0)).toBeFalsy()
    expect(Object.prototype.hasOwnProperty.call(o.list, 1)).toBeTruthy()
    expect(o.list[1]).toBeUndefined()
    expect(o.list[2]).toBe(1)

    // 原型
    expect(o.m.bbb).toBe(2) // 其实已经被视为非 plain object 了
    // eslint-disable-next-line no-proto
    expect(o.m.__proto__.bbb).toBe(2)
    expect(Object.keys(o.m).some(key => key === 'bbb')).toBeFalsy()

    // 奇怪的数组、字符串等
    expect(o.arr.length).toBe(0)
    expect(o.arr.gg).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(o.arr, 'gg')).toBeFalsy()
    expect(o.s).not.toBe('123')
    // eslint-disable-next-line no-new-wrappers
    expect(o.s).not.toBe(new String('123'))
    expect(o.s).toBe(o2.s)
  })

  it('overwrite arguments correctly', () => {
    expect(merge({ x: 1 }, undefined)).toBeUndefined()
    expect(merge({ x: 1 }, null)).toBeNull()
    expect(merge({ x: 1 }, undefined, null)).toBeNull()
    expect(merge({ x: 1 }, Date)).toBe(Date)
  })

  // TODO: 完善
  it('handle base diamond dependency correctly', () => {
    const base = { mm: 'gg' }
    const o1 = { x: 1, y: 1, z: 1 }
    const o2 = { x: base, y: base }
    const result = { x: base, y: base, z: 1 }

    const o = merge(o1, o2)

    expect(o).toEqual(result)
    expect(o.x).toBe(o.y) // 其实会很奇怪…
  })

  it('handle normal circular dependency correctly', () => {
    const o1 = { x: { y: {} } }
    const o2 = { mm: 'gg', x: {} as any }
    o2.x.y = o2.x

    expect(() => pureMergeAll(o1, o2)).toThrowError()
    expect(() => merge(o1, o2)).toThrowError()
  })

  it('handle circular dependency by itself correctly', () => {
    const o1 = { x: {} }
    const o2 = { x: null as any }
    o2.x = o2

    expect(() => pureMergeAll(o1, o2)).toThrowError()
    expect(() => merge(o1, o2)).toThrowError()
  })

  // TODO: 完善
  it('handle strange circular dependency correctly', () => {
    const o1 = {}
    const o2 = { mm: 'gg', x: null as any }
    o2.x = o2

    expect(() => pureMergeAll(o1, o2)).not.toThrowError() // FIXME: 没检测出来（虽然也是合理的）
    expect(() => merge(o1, o2)).toThrowError() // FIXME: immer 赶在我之前挂了…
  })

  // TODO: 考虑这种依赖：
  // const share = { x: 1 }
  // merge(
  //   {
  //     a: share,
  //     b: {
  //       c: share
  //     }
  //   },
  //   {
  //     a: { y: 1 },
  //     b: {
  //       c: { z: 1 }
  //     }
  //   }
  // )
})
