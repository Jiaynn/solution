/*
 * @file formstate validate test
 * @author zhu hao <zhuhao@qiniu.com>
 */

import {
  notEmpty, inputValid, mustContainChinese, postCodeValid,
  areaCodeValid, telephoneValid, mobilephoneValid, emailValid,
  wildcardDomainValid, standardDomainValid, onlySupportChineseAndCharacter
} from './validate'

describe('notEmpty works correctly', () => {
  it('not empty input', () => {
    const input = 'aa'
    const expected = null
    expect(notEmpty(input)).toBe(expected)
  })

  it('empty input', () => {
    const input = ''
    const expected = '不可以为空'
    expect(notEmpty(input)).toBe(expected)
  })

  it('empty input with name', () => {
    const input = ''
    const name = 'name'
    const expected = `${name}不可以为空`
    expect(notEmpty(input, name)).toBe(expected)
  })
})

describe('inputValid works correctly', () => {
  it('invalid input', () => {
    const input = 'aa;$'
    const expected = '不得含有非法字符'
    expect(inputValid(input)).toBe(expected)
  })

  it('valid input', () => {
    const input = 'aa'
    const expected = null
    expect(notEmpty(input)).toBe(expected)
  })
})

describe('mustContainChinese works correctly', () => {
  it('not contain chinese input', () => {
    const input = 'aa;$'
    const name = '公司名称'
    const expected = '公司名称应包含中文字符'
    expect(mustContainChinese(input, name)).toBe(expected)
  })

  it('contain chinese input', () => {
    const input = 'aa称应包含'
    const name = '公司名称'
    const expected = null
    expect(mustContainChinese(input, name)).toBe(expected)
  })
})

describe('postCodeValid works correctly', () => {
  it('invalid postCode input', () => {
    const input = 'aa2232'
    const expected = '邮编格式不正确'
    expect(postCodeValid(input)).toBe(expected)
  })

  it('valid postCode input', () => {
    const input = '213232'
    const expected = null
    expect(postCodeValid(input)).toBe(expected)
  })
})

describe('areaCodeValid works correctly', () => {
  it('invalid areaCode input', () => {
    const input = '3333'
    const expected = '区号格式不正确'
    expect(areaCodeValid(input)).toBe(expected)
  })

  it('valid areaCode input', () => {
    const input = '020'
    const expected = null
    expect(areaCodeValid(input)).toBe(expected)
  })
})

describe('telephoneValid works correctly', () => {
  it('invalid telephone input', () => {
    const input = '0209434343'
    const expected = '座机号格式不正确'
    expect(telephoneValid(input)).toBe(expected)
  })

  it('valid telephone input', () => {
    const input = '43204323'
    const expected = null
    expect(telephoneValid(input)).toBe(expected)
  })
})

describe('mobilephoneValid works correctly', () => {
  it('invalid mobile phone input', () => {
    const input = '0209434343'
    const expected = '手机号格式不正确'
    expect(mobilephoneValid(input)).toBe(expected)
  })

  it('valid mobile phone input', () => {
    const input = '13987654356'
    const expected = null
    expect(mobilephoneValid(input)).toBe(expected)
  })
})

describe('emailValid works correctly', () => {
  it('invalid email input', () => {
    const input = 'aaqiniu.com'
    const expected = '邮箱格式不正确'
    expect(emailValid(input)).toBe(expected)
  })

  it('valid email input', () => {
    const input = 'aa@qiniu.com'
    const expected = null
    expect(emailValid(input)).toBe(expected)
  })
})

describe('wildcardDomainValid works correctly', () => {
  it('invalid wildcardDomain input', () => {
    const input = 'aaqiniu.com'
    const expected = '泛域名格式不正确'
    expect(wildcardDomainValid(input)).toBe(expected)
  })

  it('valid wildcardDomain input', () => {
    const input = '*.aaqiniu.com'
    const expected = null
    expect(wildcardDomainValid(input)).toBe(expected)
  })
})

describe('standardDomainValid works correctly', () => {
  it('invalid standardDomain input', () => {
    const input = 'aaqiniucom'
    const expected = '标准域名格式不正确'
    expect(standardDomainValid(input)).toBe(expected)
  })

  it('valid standardDomain input', () => {
    const input = 'aaqiniu.com'
    const expected = null
    expect(standardDomainValid(input)).toBe(expected)
  })
})

describe('onlySupportChineseAndCharacter works correctly', () => {
  it('not only chinese digital character input', () => {
    const input = 'aaqiniucom;$@$#@'
    const expected = '仅支持中英文字符、数字、空格、_、-、*、.、()'
    expect(onlySupportChineseAndCharacter(input)).toBe(expected)
  })

  it('only chinese digital character input', () => {
    const input = 'aaqiniu.com'
    const expected = null
    expect(onlySupportChineseAndCharacter(input)).toBe(expected)
  })
})
