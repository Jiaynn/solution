/**
 * @file 静态封面 - 指令
 * @link https://developer.qiniu.com/dora/1313/video-frame-thumbnails-vframe
 */

import { chunk, isObject } from 'lodash'

import { ensureWidthAndHeightValid, toNumber } from './utils'

export type Command = {
  type: 'vframe'
  format: Format
  // 指定截取视频的时刻，单位：秒，精确到毫秒。
  offset: number
  // 缩略图宽度，单位：像素（px）
  w: number | null
  // 缩略图高度，单位：像素（px）
  h: number | null
}

export type Format = 'jpg' | 'png'

export function areAllKeysPermitted(input: unknown) {
  const validNames = ['vframe', 'offset', 'w', 'h']
  if (isVframeCommand(input)) {
    return Object.keys(input).filter(name => name !== 'type').every(name => validNames.includes(name))
  }
  if (typeof input === 'string') {
    const names = chunk(input.split('/').filter(v => v !== ''), 2).map(([parameter]) => parameter)
    return names.every(name => validNames.includes(name)) && input.startsWith('vframe')
  }
  return false
}

export function isVframeCommand(obj: unknown): obj is Command {
  return isObject(obj) && (obj as any).type === 'vframe'
}

export function decode(str: string): Command {
  if (areAllKeysPermitted(str) === false) {
    throw new Error('Unable to decode')
  }
  const command: Command = {
    type: 'vframe' as const,
    format: decodeFormat(str),
    offset: decodeOffset(str),
    w: decodeW(str),
    h: decodeH(str)
  }

  ensureWidthAndHeightValid(command.w, command.h)

  return command
}

export function encode(command: Command): string {
  return [
    encodeFormat(command.format),
    command.w && encodeW(command.w),
    command.h && encodeH(command.h),
    encodeOffset(command.offset)
  ].filter(v => v != null).join('')
}

export function decodeFormat(str: string): Format {
  const availableFormats: Format[] = ['jpg', 'png']
  const pattern = new RegExp('^vframe/([^/]+)')

  const format = pattern.exec(str)?.[1]

  if (format == null) {
    throw new Error('format not found')
  }

  if (!availableFormats.includes(format as Format)) {
    throw new Error('unsupported format')
  }

  return format as Format
}

export function encodeFormat(format: string) {
  return `vframe/${format}`
}

export function decodeOffset(str: string): number {
  const pattern = new RegExp('/offset/([^/]+)')

  const offset = pattern.exec(str)?.[1]

  if (offset == null) {
    throw new Error('offset not found')
  }

  return toNumber(offset, { decimalsLimit: 3, min: 0 })
}

export function encodeOffset(offset: number) {
  return `/offset/${offset}`
}

export function decodeW(str: string): number | null {
  const pattern = new RegExp('/w/([^/]+)')

  const w = pattern.exec(str)?.[1]

  if (w == null) {
    return null
  }

  return toNumber(w, { decimalsLimit: 0, max: 3840, min: 20 })
}

export function encodeW(w: number) {
  return `/w/${w}`
}

export function decodeH(str: string): number | null {
  const pattern = new RegExp('/h/([^/]+)')

  const h = pattern.exec(str)?.[1]

  if (h == null) {
    return null
  }

  return toNumber(h, { decimalsLimit: 0, max: 3840, min: 20 })
}

export function encodeH(h: number) {
  return `/h/${h}`
}
