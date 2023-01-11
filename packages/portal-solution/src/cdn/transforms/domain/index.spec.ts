import { getNameForWildcardDomain, shouldRecycle, humanizeRecycleLeftDays } from '.'

describe('getNameForWildcardDomain', () => {
  it('works correctly', () => {
    expect(getNameForWildcardDomain('a.com')).toBe('.a.com')
  })
})

describe('shouldRecycle', () => {
  it('works correctly', () => {
    expect(shouldRecycle('a.qiniu.com')).toBe(false)
    expect(shouldRecycle('clouddn.com')).toBe(false)
    expect(shouldRecycle('pd6e0ta6b.bkt.gdipper.com')).toBe(false)

    expect(shouldRecycle('a.clouddn.com')).toBe(true)
    expect(shouldRecycle('a.qnssl.com')).toBe(true)
    expect(shouldRecycle('a.qiniucdn.com')).toBe(true)
    expect(shouldRecycle('a.qbox.me')).toBe(true)
    expect(shouldRecycle('a.qiniudn.com')).toBe(true)
    expect(shouldRecycle('on7kcemig.bkt.clouddn.com')).toBe(true)
  })
})

describe('humanizeRecycleLeftDays', () => {
  it('works correctly', () => {
    expect(humanizeRecycleLeftDays(-1)).toBe('无')
    expect(humanizeRecycleLeftDays(0)).toBe('回收中')
    expect(humanizeRecycleLeftDays(1)).toBe('1 天')
    expect(humanizeRecycleLeftDays(30)).toBe('30 天')
  })
})
