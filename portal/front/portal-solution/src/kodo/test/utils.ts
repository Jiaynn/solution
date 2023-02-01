/**
 * @file test utils
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import { unionArrayFrom } from '../utils/ts'
import { ReactComponent } from '../types/react'
import { defaultReactComponent, antdComponents, Highcharts, ScrollableInkTabBar } from './components'

type AnyWrapper = (this: any, ...args: any[]) => void | Promise<any>

export const mockedCurrentTime = 1554048000000

export function isPromise(fn: any): fn is Promise<any> {
  return fn && fn instanceof Promise
}

export class AsyncMocker {
  constructor(public wrap: AnyWrapper, public unwrap: AnyWrapper) {
    // do nothing
  }

  // TODO: 无法保证各种“并发”情况下的正确性
  private async runAsync(...args) {
    let callback: any
    let wrapResult: any
    let result: any
    let unwrapResult: any

    // eslint-disable-next-line default-case
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
  // TODO: 丑陋的实现……
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
  static defaultFaker = jest.fn(() => mockedCurrentTime)

  constructor(faker?: () => number) {
    super(
      () => { Date.now = faker || DateMocker.defaultFaker },
      () => { Date.now = DateMocker.now }
    )
  }
}

export function mockAllDate() {
  const stashValueOf = Date.prototype.valueOf
  const stashNow = Date.now

  beforeAll(() => {
    Date.now = jest.fn().mockReturnValue(mockedCurrentTime)
    Date.prototype.valueOf = jest.fn().mockReturnValue(mockedCurrentTime) // eslint-disable-line no-extend-native
  })

  afterAll(() => {
    Date.now = stashNow
    Date.prototype.valueOf = stashValueOf // eslint-disable-line no-extend-native
  })
}

export function mockEsModule(path: string, module: any = defaultReactComponent) {
  jest.mock(path, () => ({
    default: module,
    __esModule: true
  }))
}

export function mockAntdComponent(name: string, Component: ReactComponent = defaultReactComponent) {
  // TODO: antd/es/**  。。？
  jest.mock(`antd/lib/${name.toLowerCase()}`, () => Component)
}

export function mockAntdComponents(components: { [name: string]: ReactComponent } = antdComponents) {
  Object.keys(components).forEach(name => {
    mockAntdComponent(name, components[name])
  })
}

export function mockHighcharts() {
  jest.mock('highcharts', () => Highcharts)
  jest.mock('react-highcharts', () => Highcharts)
}

export function mockScrollableInkTabBar() {
  jest.mock('rc-tabs/lib/ScrollableInkTabBar', () => ScrollableInkTabBar)
}

const consoleMethods = unionArrayFrom(['log', 'warn', 'info', 'error', 'debug'])
export function ignoreConsole(...types: typeof consoleMethods) {
  types = types.length ? types : consoleMethods
  const spies = types.map(methodName => jest.spyOn(console, methodName).mockImplementation())
  return () => { spies.forEach(spy => spy.mockRestore()) }
}
