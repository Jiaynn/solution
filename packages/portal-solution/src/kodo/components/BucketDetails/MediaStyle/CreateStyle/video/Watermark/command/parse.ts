/**
 * @description parser of watermark command
 * @author duli <duli@qiniu.com>
 */

import { chunk, uniq } from 'lodash'

import { decodeUrlSafeBase64 } from 'kodo/transforms/base64'

import { Origin, watermarkFontFamily } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/constants'
import { decodeKodoURI } from '../../utils'
import { toNumber } from '../../commands/utils'

export const endPosSymbol = '$(end)'

export type CommonCommand = {
  wmOffsetX?: number // 横向/水平偏移量
  wmOffsetY?: number // 纵向/垂直偏移量
  wmPos?: number | typeof endPosSymbol // 水印显示的起始时间
  wmDuration?: number // 水印显示的持续时长，正数表示时间增长方向，负数表示时间递减方向
  // 值为 1，wmPos+wmDuration>视频时长时，会把 wmDuration 调小至视频时长范围内
  // 值为 0，不做处理，wmPos+wmDuration>视频时时，任务处理会失败，界面要有警示文案
  wmShortest?: 0 | 1 // 是否调整到视频范围内
}

export const commonCommandNameMap = {
  wmOffsetX: 'wmOffsetX',
  wmOffsetY: 'wmOffsetY',
  wmPos: 'wmPos',
  wmDuration: 'wmDuration',
  wmShortest: 'wmShortest'
}

export type WordsCommand = CommonCommand & {
  wmText: string // 文字
  wmFont?: string
  wmFontSize?: number
  wmAlpha?: 1 // 界面不支持，默认值为 1，只解析为 1 的情况
  wmFontColor?: string
  wmGravityText?: Origin // 基准方位
}

export const wordsCommandNameMap: { [k in keyof Omit<WordsCommand, keyof CommonCommand>]-?: k } = {
  wmText: 'wmText',
  wmFont: 'wmFont',
  wmFontSize: 'wmFontSize',
  wmAlpha: 'wmAlpha',
  wmFontColor: 'wmFontColor',
  wmGravityText: 'wmGravityText'
} as const

export type PictureCommand = CommonCommand & {
  wmImage: string
  wmScale?: number // 自适应缩放 (0, 1]
  wmScaleType?: 0 // 自适应缩放方式，界面不支持
  wmIgnoreLoop?: 0 | 1 // 忽略动图循环
  wmGravity?: Origin
}

export const picCommandNameMap: { [k in keyof Omit<PictureCommand, keyof CommonCommand>]-?: k } = {
  wmImage: 'wmImage',
  wmScale: 'wmScale',
  wmScaleType: 'wmScaleType',
  wmIgnoreLoop: 'wmIgnoreLoop',
  wmGravity: 'wmGravity'
} as const

function isOrigin(val: unknown): val is Origin {
  return typeof val === 'string' && Object.keys(Origin).includes(val)
}

/**
 * 检查必要命令
 * @param pairs 命令对，command - value
 */
function checkRequiredCommands(pairs: string[][], required: string[]) {
  if (
    !required.every(
      commandName => pairs.some(([exist]) => exist === commandName)
    )
  ) {
    throw new Error('缺少图形化界面必要命令')
  }
}

/**
 * 解析公共命令部分
 */
function parseCommonCommand(pair: string[]): Partial<CommonCommand> | null {
  const [commandName, value] = pair
  switch (commandName as keyof (PictureCommand & WordsCommand)) {
    case 'wmOffsetX':
      return { wmOffsetX: toNumber(value, { decimalsLimit: 0, allowSign: '-' }) } // 参数是不是改成 Number.MAX_SAFE_INTEGER 更好
    case 'wmOffsetY':
      return { wmOffsetY: toNumber(value, { decimalsLimit: 0, allowSign: '-' }) }
    case 'wmPos':
      if (value === endPosSymbol) return { wmPos: endPosSymbol }
      return { wmPos: toNumber(value, { decimalsLimit: 0, min: 0, max: 50 * 3600 }) }
    case 'wmDuration':
      return { wmDuration: toNumber(value, { decimalsLimit: 0, allowSign: '-' }) }
    case 'wmShortest':
      return { wmShortest: toNumber(value, { decimalsLimit: 0, min: 0, max: 1 }) as 0 | 1 }
    default:
      return null
  }
}

/**
 * 检查公共部分的命令的格式
 */
function checkCommonCommand(common: CommonCommand) {
  if (
    (common.wmPos != null && common.wmDuration == null)
    || (common.wmPos == null && common.wmDuration != null)
  ) {
    throw new Error('wmPos 必须和 wmDuration 同时存在或者不存在')
  }

  if (typeof common.wmPos === 'number' && common.wmDuration! < 0) {
    throw new Error('从片头开始时，wmDuration 应为正数')
  }
}

/**
 * 判断第一个是否是文字水印命令
 */
function isWordsCommand(pairs: string[][]) {
  return pairs[0][0] === 'wmText'
}

/**
 * 判断第一个是否是图片水印命令
 */
function isPicCommand(paris: string[][]) {
  return paris[0][0] === 'wmImage'
}

function parseWordsCommand(pairs: string[][]) {
  const words: Array<keyof WordsCommand> = ['wmText']

  checkRequiredCommands(pairs, words)

  let result: WordsCommand = {
    wmOffsetX: undefined,
    wmOffsetY: undefined,
    wmPos: undefined,
    wmDuration: undefined,
    wmShortest: undefined,

    // --- words ---
    wmText: '',
    wmFont: undefined,
    wmFontSize: undefined,
    wmAlpha: undefined,
    wmFontColor: undefined,
    wmGravityText: undefined
  }

  let common: Partial<CommonCommand> | null = null

  function checkFont(font: string) {
    if (!watermarkFontFamily.includes(font)) {
      throw new Error('无效水印字体')
    }
    return font
  }

  function checkFontColor(color: string) {
    if (!/^#[0-9a-f]{6}$/.test(color)) {
      throw new Error('无效字体颜色')
    }
    return color
  }

  for (const [commandName, value] of pairs) {
    switch (commandName as keyof WordsCommand) {
      case 'wmText':
        result.wmText = decodeUrlSafeBase64(value)
        break
      case 'wmFont':
        result.wmFont = checkFont(decodeUrlSafeBase64(value))
        break
      case 'wmAlpha':
        if (toNumber(value, { min: 0, max: 1 }) !== 1) {
          throw new Error('不支持 wmAlpha 命令')
        }
        break
      case 'wmFontColor':
        result.wmFontColor = checkFontColor(decodeUrlSafeBase64(value))
        break
      case 'wmFontSize':
        result.wmFontSize = toNumber(value, { decimalsLimit: 0, min: 12, max: 100000 })
        if (!Number.isInteger(result.wmFontSize)) throw new Error('字体大小应为整数')
        break
      case 'wmGravityText':
        if (!isOrigin(value)) throw new Error('基准方位命令值不合法')
        result.wmGravityText = value
        break
      default:
        common = parseCommonCommand([commandName, value])
        if (!common) {
          throw new Error('不支持的命令')
        }
        result = { ...result, ...common }
    }
  }

  checkCommonCommand(result)

  return result
}

function parsePicCommand(pairs: string[][]) {
  const picture: Array<keyof PictureCommand> = ['wmImage']

  checkRequiredCommands(pairs, picture)

  let result: PictureCommand = {
    wmOffsetX: undefined,
    wmOffsetY: undefined,
    wmPos: undefined,
    wmDuration: undefined,
    wmShortest: undefined,

    // --- pic ---
    wmImage: '',
    wmScale: undefined,
    wmScaleType: undefined,
    wmIgnoreLoop: undefined,
    wmGravity: undefined
  }

  let common: Partial<CommonCommand> | null = null

  function parseKodoURI(value: string) {
    const [, fileKey] = decodeKodoURI(value)
    if (fileKey === value) {
      throw new Error('wmImage 格式不合法')
    }
    return value
  }

  for (const [commandName, value] of pairs) {
    switch (commandName as keyof PictureCommand) {
      case 'wmImage':
        result.wmImage = parseKodoURI(decodeUrlSafeBase64(value))
        break
      case 'wmScale':
        result.wmScale = toNumber(value, { decimalsLimit: 2, min: 0, max: 1 })
        if (result.wmScale === 0) throw new Error('wmScale值不能为 0')
        break
      case 'wmScaleType':
        if (toNumber(value) !== 0) {
          throw new Error('不支持 wmScaleType 命令')
        }
        break
      case 'wmIgnoreLoop':
        result.wmIgnoreLoop = toNumber(value, { decimalsLimit: 0, min: 0, max: 1 }) as 0 | 1
        break
      case 'wmGravity':
        if (!isOrigin(value)) throw new Error('基准方位命令值不合法')
        result.wmGravity = value
        break
      default:
        common = parseCommonCommand([commandName, value])
        if (!common) {
          throw new Error('不支持的命令')
        }
        result = { ...result, ...common }
    }
  }

  checkCommonCommand(result)

  return result
}

export function parse(command: string) {
  const pairs = chunk(command.split('/'), 2)

  // 为 null || undefined || ''
  if (pairs.some(([_, value]) => !value)) {
    throw new Error('命令值为空')
  }

  const commandNameList = pairs.map(item => item[0])

  if (commandNameList.length !== uniq(commandNameList).length) {
    throw new Error('有重复命令')
  }

  if (isWordsCommand(pairs)) {
    return parseWordsCommand(pairs)
  }

  if (isPicCommand(pairs)) {
    return parsePicCommand(pairs)
  }

  throw new Error('未知水印')
}
