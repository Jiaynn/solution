import { validateUserAuthUrl } from './bs-auth'

describe('validateUserAuthUrl', () => {
  it('should work well', () => {
    expect(validateUserAuthUrl('')).not.toBeNull()
    expect(validateUserAuthUrl('abc')).not.toBeNull()
    expect(validateUserAuthUrl('http://www.qiniu.com/foo')).toBeNull()
  })
})
