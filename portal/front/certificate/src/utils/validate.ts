/*
 * @file formstate validate
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { standardDomainRegx, wildcardDomainRegx } from '../constants/domain'

export function validate(criteria: boolean, invalidMsg: string) {
  return criteria ? invalidMsg : null
}

export function notEmpty(value: unknown, name = '') {
  return validate(value == null || !value, `${name}不可以为空`)
}

export function inputValid(value: string) {
  return validate(/[`~～!！@#$%^&*_+<>?:"“”{},，。./;；'‘’[\]]/.test(value), '不得含有非法字符')
}

export function mustContainChinese(value: string, name = '') {
  return validate(!/[\u4e00-\u9fa5]/.test(value), `${name}应包含中文字符`)
}

export function postCodeValid(value: string) {
  return validate(!/^\d{5,6}(?!\d)$/.test(value), '邮编格式不正确')
}

export function areaCodeValid(value: string) {
  return validate(!/^((0\d{2,3}))$/.test(value), '区号格式不正确')
}

export function telephoneValid(value: string) {
  return validate(!/^(\d{7,8})(-(\d{3,}))?$/.test(value), '座机号格式不正确')
}

export function mobilephoneValid(value: string) {
  return validate(!/^\d{11}$/.test(value), '手机号格式不正确')
}

export function emailValid(value: string) {
  return validate(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value), '邮箱格式不正确')
}

export function wildcardDomainValid(value: string) {
  return validate(!wildcardDomainRegx.test(value), '泛域名格式不正确')
}

export function standardDomainValid(value: string) {
  return validate(!standardDomainRegx.test(value), '标准域名格式不正确')
}

export function onlySupportChineseAndCharacter(value: string) {
  return validate(!/^[a-zA-Z0-9_\s\-*.()\u4e00-\u9fa5]+$/.test(value), '仅支持中英文字符、数字、空格、_、-、*、.、()')
}
