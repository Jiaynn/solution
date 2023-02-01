/**
 * @file base64
 * @description base64 的编码解码
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import { Base64 } from 'js-base64'

export function encodeUrlSafeBase64(str: string): string {
  return Base64.encode(str).replace(
    /[+/]/g,
    (char: string) => ({
      '+': '-',
      '/': '_'
    }[char])
  )
}

export function decodeUrlSafeBase64(str: string): string {
  return Base64.decode(
    str.replace(
      /[_-]/g,
      (char: string) => ({
        '-': '+',
        _: '/'
      }[char] as string)
    )
  )
}
