/**
 * @file 动态封面 - 查询参数
 * @link https://developer.qiniu.com/dora/1248/audio-and-video-transcoding-avthumb
 */

import { chunk, isObject } from 'lodash'

import { ensureWidthAndHeightValid, toNumber } from './utils'

export type Command = {
  type: 'avthumb',
  format: Format
  // 指定截取视频的时刻，单位：秒，精确到毫秒。
  offset: number | null
  // 截取长度
  duration: number | null
  // 缩略图宽度，单位：像素（px）
  w: number | null
  // 缩略图高度，单位：像素（px）
  h: number | null
  // 缩放自适应（视频按比例缩放）
  autoScale: AutoScale | null
}

export type Format = 'gif'

export type AutoScale = 0 | 1 | 2

export function areAllKeysPermitted(input: unknown) {
  const validNames = ['avthumb', 'ss', 't', 's', 'autoscale']
  if (isAvthumb(input)) {
    return Object.keys(input).filter(name => name !== 'type').every(name => validNames.includes(name))
  }
  if (typeof input === 'string') {
    const names = chunk(input.split('/').filter(v => v !== ''), 2).map(([parameter]) => parameter)
    return names.every(name => validNames.includes(name)) && input.startsWith('avthumb')
  }
  return false
}

export function isAvthumb(obj: unknown): obj is Command {
  return isObject(obj) && (obj as any).type === 'avthumb'
}

export function decode(str: string): Command {
  if (areAllKeysPermitted(str) === false) {
    throw new Error('Unable to decode')
  }
  const [w, h] = decodeResolution(str)
  const command: Command = {
    type: 'avthumb' as const,
    format: decodeFormat(str),
    offset: decodeOffset(str),
    duration: decodeDuration(str),
    w,
    h,
    autoScale: decodeAutoScale(str)
  }

  ensureWidthAndHeightValid(command.w, command.h)

  return command
}

export function encode(command: Command): string {
  return [
    encodeFormat(command.format),
    encodeOffset(command.offset),
    encodeDuration(command.duration),
    encodeResolution(command.w, command.h),
    encodeAutoScale(command.autoScale)
  ].filter(v => v != null).join('')
}

export function decodeFormat(str: string): Format {
  const availableFormats: Format[] = ['gif']
  const pattern = new RegExp('^avthumb/([^/]+)')

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
  return `avthumb/${format}`
}

export function decodeOffset(str: string): number | null {
  const pattern = new RegExp('/ss/([^/]+)')

  const offset = pattern.exec(str)?.[1]

  if (offset == null) {
    return null
  }

  return toNumber(offset, { decimalsLimit: 3, min: 0 })
}

export function encodeOffset(offset: number | null) {
  if (offset == null) {
    return ''
  }
  return `/ss/${offset}`
}

export function decodeDuration(str: string) {
  const pattern = new RegExp('/t/([^/]+)')

  const duration = pattern.exec(str)?.[1]

  if (duration == null) {
    return null
  }

  return toNumber(duration, { decimalsLimit: 3, max: 5, min: 0.001 })
}

export function encodeDuration(duration: number | null) {
  if (duration == null) {
    return ''
  }
  return `/t/${duration}`
}

export function decodeResolution(str: string): Array<number | null> {
  const pattern = new RegExp('/s/([^/]+)')

  const resolutionStr = pattern.exec(str)?.[1]

  if (resolutionStr == null) {
    return [null, null]
  }

  // 必须包含x，比如 100x x100 100x100
  if (resolutionStr.indexOf('x') === -1) {
    throw new Error('invalid resolution')
  }

  const resolutions = resolutionStr.split('x')

  if (resolutions.length > 2) {
    throw new Error('invalid resolution')
  }

  const arr = resolutions.map(v => {
    if (v === '') {
      return null
    }

    return toNumber(v, { decimalsLimit: 0, max: 3840, min: 20 })
  })

  if (arr.length === 1) {
    return [arr[0], null]
  }

  return arr
}

export function encodeResolution(w: number | null, h: number | null) {
  if (w == null && h == null) {
    return ''
  }
  return `/s/${w ?? ''}x${h ?? ''}`
}

export function decodeAutoScale(str: string): AutoScale | null {
  const pattern = new RegExp('/autoscale/([^/]+)')

  const autoScale = pattern.exec(str)?.[1]

  if (autoScale == null) {
    return null
  }

  const value = toNumber(autoScale, { decimalsLimit: 0, max: 2, min: 0 })

  return value as AutoScale
}

export function encodeAutoScale(autoScale: AutoScale | null) {
  if (autoScale == null) return ''
  return `/autoscale/${autoScale}`
}
