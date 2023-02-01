import { RawLocaleMessage, TranslateFn } from 'portal-base/common/i18n'

export function timeout(delay: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delay))
}

// 给定一个 input/output ioArray，遍历键值对验证
export function validateWithMap(fn: (...args: any) => any, ioArray: Array<{ input: any[], output: any }>) {
  ioArray.forEach(({ input, output }) => {
    const result = fn(...input)
    expect(result).toEqual(output)
  })
}

// FIXME
export function validateWithMessageMap(
  t: TranslateFn,
  fn: (...args: any) => any,
  ioArray: Array<{ input: any[], output: any }>
) {
  ioArray.forEach(({ input, output }) => {
    const result = t(fn(...input))
    expect(result).toEqual(output)
  })
}

// 给定一个 nameMap，验证 humanize 函数
export function validateHumanizeFN(fn: (...args: any) => any, nameMap: Record<string, string>) {
  Object.keys(nameMap).forEach(key => {
    const name = fn(key)
    expect(name).toBe(nameMap[key])
  })
}

// FIXME
export function validateHumanizeMessageFN(
  t: TranslateFn,
  fn: (...args: any) => any,
  msgMap: Record<string, RawLocaleMessage>
) {
  Object.keys(msgMap).forEach(key => {
    const name = t(fn(key))
    expect(name).toBe(t(msgMap[key]))
  })
}

// copy from kodo-web
type AnyWrapper = ((this: any, ...args: any[]) => (void | Promise<any>))
function isPromise(fn: any): fn is Promise<any> {
  return fn && fn instanceof Promise
}

export class AsyncMocker {
  constructor(public wrap: AnyWrapper, public unwrap: AnyWrapper) {
    // do nothing
  }

  // TODO FIXME 无法保证各种 “并发” 情况下的正确性
  private async runAsync(...args: any) {
    let callback: any
    let wrapResult: any
    let result: any
    let unwrapResult: any

    switch (args.length) {
      case 2:
        [wrapResult, callback] = args
        break
      case 3:
        [wrapResult, result, callback] = args
        break
      case 4:
        [wrapResult, result, unwrapResult, callback] = args
        break
      default:
    }

    if (wrapResult) {
      wrapResult = await wrapResult
    }

    result = result || callback()
    if (isPromise(result)) {
      result = await result
    }

    unwrapResult = unwrapResult || this.unwrap()
    if (isPromise(unwrapResult)) {
      unwrapResult = await unwrapResult
    }

    return result
  }

  // 如果全部过程都是同步的，那么就尽可能同步地处理
  // TODO 丑陋的实现……
  mock(callback: AnyWrapper): any {
    const wrapResult = this.wrap()
    if (isPromise(wrapResult)) {
      return this.runAsync(wrapResult, callback)
    }

    const result = callback()
    if (isPromise(result)) {
      return this.runAsync(wrapResult, result, callback)
    }

    const unwrapResult = this.unwrap()
    if (isPromise(unwrapResult)) {
      return this.runAsync(wrapResult, result, unwrapResult, callback)
    }

    return result
  }
}

// mock Date for stable snapshot
export class DateMocker extends AsyncMocker {
  static now = Date.now
  static defaultFaker = jest.fn(() => 1517414400000) // magic number

  constructor(faker?: () => number) {
    super(
      () => { Date.now = faker || DateMocker.defaultFaker },
      () => { Date.now = DateMocker.now }
    )
  }
}
