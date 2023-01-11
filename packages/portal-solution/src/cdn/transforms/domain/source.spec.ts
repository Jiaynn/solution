import { SourceHostConfigType } from 'cdn/constants/domain'

import { ISourceHost } from 'cdn/components/Domain/Inputs/SourceConfigInput'
import { sourceHostApi2Form } from './source'

describe('sourceHostApi2Form', () => {
  it('should work correctly', () => {
    const domainName = 'www.qiniu.com'
    const emptySourceHostName = ''
    const emptySourceDomain = ''
    const domainSourceHostForm: ISourceHost = {
      type: SourceHostConfigType.Domain,
      domainValue: domainName,
      sourceValue: '',
      customValue: ''
    }
    expect(sourceHostApi2Form(emptySourceHostName, emptySourceDomain, domainName)).toEqual(domainSourceHostForm)
    const domainSourceHostName = domainName
    expect(sourceHostApi2Form(domainSourceHostName, emptySourceDomain, domainName)).toEqual(domainSourceHostForm)
    const aSourceHostName = 'a.qiniu.com'
    const aSourceDomain = 'a.qiniu.com'
    const sourceSourceHostForm: ISourceHost = {
      type: SourceHostConfigType.Source,
      domainValue: '',
      sourceValue: 'a.qiniu.com',
      customValue: ''
    }
    expect(sourceHostApi2Form(aSourceHostName, aSourceDomain, domainName)).toEqual(sourceSourceHostForm)
    const customSourceHostName = 'ab.qiniu.com'
    const customSourceHostForm: ISourceHost = {
      type: SourceHostConfigType.Custom,
      domainValue: '',
      sourceValue: '',
      customValue: 'ab.qiniu.com'
    }
    expect(sourceHostApi2Form(customSourceHostName, aSourceDomain, domainName)).toEqual(customSourceHostForm)
  })
})
