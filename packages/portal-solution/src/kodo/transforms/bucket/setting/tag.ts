/**
 * @desc Transform for bucket tag manage.
 * @author hovenjay <hovenjay@outlook.com>
 */

import { escapeRegExp } from 'lodash'

import { encodeUrlSafeBase64 } from 'kodo/transforms/base64'
import { countByte } from 'kodo/transforms/byte'

import { specialCharacter } from 'kodo/constants/bucket/setting/tag'

import { ITag } from 'kodo/apis/bucket/setting/tag'

export function validateTagKeyPrefix(value: string) {
  return /^kodo/i.test(value) && '不能以 kodo 为前缀'
}

export function validateTagFormat(value: string) {
  if (!value) { return '不能为空' }

  const allowedChars = specialCharacter.split('').map(escapeRegExp).join('|')
  return !RegExp(`^([a-zA-Z0-9]|${allowedChars})+$`).test(value) && '格式不正确'
}

export function createTagSizeValidator(size: number, prefix = '') {
  return (value: string) => countByte(value) > size && `${prefix}超过 ${size} 字节`
}

const tagSeparator = ';'

/**
 * 将 ITag 类型的数据转换为 `tagSeparator` 分隔的字符串
 * @param Key
 * @param Value
 */
export function tagToString({ Key, Value }: Partial<ITag>) {
  if (Key && Value) {
    return Key + tagSeparator + Value
  }

  if (Key) {
    return Key + tagSeparator
  }

  if (Value) {
    return tagSeparator + Value
  }

  return null
}

/**
 * 将 `tagSeparator` 分隔的字符串转换为 ITag 类型的数据，仅处理标签的键值同时存在的情况。
 * @param tagString
 */
export function tagStringToTag(tagString: string | null | undefined): ITag | null {
  if (tagString) {
    const [Key, Value] = tagString && tagString.split(tagSeparator)
    return { Key, Value }
  }

  return null
}

/**
 * 将 tag 字符串数组或者 ITag 类型的对象数组转换成 Base64 编码的字符串，主要用于请求时作为查询参数
 * @param tags
 */
export function tagToBase64String(tags: Array<string | ITag>) {
  const tagStr = tags.map(
    tag => (typeof tag === 'string' ? `key=${tag}&` : `key=${tag.Key}&value=${tag.Value}`)
  ).join(';')

  return encodeUrlSafeBase64(tagStr)
}
