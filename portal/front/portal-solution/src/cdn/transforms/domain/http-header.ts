import {
  and, listOf, textRequired
} from 'cdn/transforms/form'

import { ResponseHeaderControlOp } from 'cdn/constants/domain'

import { IResponseHeaderControl } from 'cdn/apis/domain'

// 产品感觉用 ascii 可见字符做白名单比较可以接受
const rResponseHeaderValue = /^[\x20-\x7e]+$/

export const maxLetters = 4096

export const validateValue = and(
  (v: IResponseHeaderControl) => (
    (v.value && v.value.length !== 0 || v.op === ResponseHeaderControlOp.Del)
    ? null
    : '不能为空'
  ),
  (v: IResponseHeaderControl) => (v.value && v.value.length > maxLetters ? `不能超过 ${maxLetters} 个字符` : null),
  (v: IResponseHeaderControl) => (
    rResponseHeaderValue.test(v.value) || v.op === ResponseHeaderControlOp.Del
    ? null
    : '数格式错误'
  )
)

export const validateHttpHeader = and<IResponseHeaderControl>(
  v => textRequired(v.key, '不能为空'),
  v => textRequired(v.op, '不能为空'),
  v => validateValue(v)
)

export const validateHttpHeaders = () => listOf(validateHttpHeader)

