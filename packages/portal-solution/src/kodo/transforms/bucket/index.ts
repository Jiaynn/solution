/**
 * @file transforms for bucket
 * @author yinxulai <me@yinxulai.com>
 */

import { validateTagFormat } from 'kodo/transforms/bucket/setting/tag'

import { bucketNameLenRule, bucketNameRule, BucketSysTag } from 'kodo/constants/bucket'

export function validateBucketNameWithLabel(name: string) {
  if (!name) {
    return '请输入空间名称'
  }

  const pattern = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

  if (name.length < 3 || name.length > 63) {
    return `请检查空间名称长度，${bucketNameLenRule}`
  }

  if (!pattern.test(name)) {
    return `请检查空间名称格式，${bucketNameRule}`
  }

  return false
}

export function validateSearchTag(prefix = '', val: string) {
  if (val && val.length > 0) {
    const result = validateTagFormat(val)
    if (result) return `${prefix}${result}`
  }

  return false
}

/**
 * 判断一个空间的 systags 字段是否包含 BlockChainP
 * @param sysTags
 */
export function isBlockChainPBucket(sysTags: BucketSysTag[] | undefined) {
  return Array.isArray(sysTags) && sysTags.includes(BucketSysTag.BlockChainP)
}

export function getStringWithSpace(value: string) {
  // utf - 8 空格字符替换所有空白字符
  // 效果：保留空格但是不保留换行
  // 仅用 css white-spce 会保留换行
  return value.replace(/\s/g, '\u0020')
}
