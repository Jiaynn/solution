import { urlWithDomainOrIpHost } from './validators'

describe('urlWithDomainOrIpHost', () => {
  it('should work well', () => {
    expect(urlWithDomainOrIpHost('')).not.toBeNull()
    expect(urlWithDomainOrIpHost('aaa')).not.toBeNull()
    expect(urlWithDomainOrIpHost('127.0.0.1')).not.toBeNull()
    expect(urlWithDomainOrIpHost('www.qiniu.com')).not.toBeNull()
    expect(urlWithDomainOrIpHost('localhost:8080')).not.toBeNull()

    expect(urlWithDomainOrIpHost('http://www.qiniu.com')).toBeUndefined()
    expect(urlWithDomainOrIpHost('https://portal.qiniu.com:8080/abc')).toBeUndefined()
    expect(urlWithDomainOrIpHost('https://portal.qiniu.com:8080/abc?foo')).toBeUndefined()
    expect(urlWithDomainOrIpHost('https://portal.qiniu.com:8080/abc?foo#bar')).toBeUndefined()
    expect(urlWithDomainOrIpHost('ftp://192.168.0.1:8090/')).toBeUndefined()
    expect(urlWithDomainOrIpHost('http://[::]/')).toBeUndefined()
    expect(urlWithDomainOrIpHost('http://[fe80::]:80/foo')).toBeUndefined()
  })
})
