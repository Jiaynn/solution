/**
 * @file common function about command
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React, { useCallback, useMemo } from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ValidatorResponse } from 'formstate-x'

import { MediaStyle } from 'kodo/apis/bucket/image-style'
import { MediaStyleType } from './constants'

import { ImageCommand } from '../image'
import { VideoCoverCommand } from '../video/Cover'
import { WatermarkCommand } from '../video/Watermark'
import { TranscodeCommand } from '../video/Transcode'

/**
 * @param  {string} styleCommands
 * @returns string | null
 * @description 从样式命令中获取 sourceFormat 参数
 */
export function getSourceFormat<T extends string = string>(styleCommands: string): T | null {
  // 命令格式如下：[$0.sourceFormat?]doraCommand
  const execResult = /^\$0\.([^?]*)/.exec(styleCommands || '')
  if (execResult && execResult[1]) {
    return execResult[1] as T
  }

  return null
}

/**
 * @param  {string} styleCommands
 * @returns string
 * @description 从给定的 command 中去除 sourceFormat 后返回
 */
export function getCommandsWithoutSourceFormat(styleCommands?: string): string {
  if (!styleCommands) return ''

  if (styleCommands.includes('?')) return styleCommands.split('?')[1]
  return styleCommands
}

/**
 * @param  {string} styleCommands
 * @returns string[]
 * @description 切割命令
 */
export function splitCommands(styleCommands: string): string[] {
  if (!styleCommands) return []

  if (styleCommands[styleCommands.length - 1] === '/') {
    styleCommands = styleCommands.slice(0, -1)
  }

  return styleCommands.split('|')
}

/**
 * @param  {string[]} commands
 * @returns string
 * @description 组合连接命令
 */
export function joinCommands(commands: string[]): string {
  return commands.join('|')
}

/**
 * @param  {string} commands
 * @returns string
 * @description 获取 commands 中包含的命令名
 */
export function getCommandNameList(commands: string): string[] {
  const commandList = splitCommands(getCommandsWithoutSourceFormat(commands))
  return commandList.map(command => command.split('/')[0])
}

/**
 * @param  {string} a
 * @param  {string} b
 * @returns boolean
 * @description 检查两个 command 是否相似
 */
export function isLikeCommands(a: string, b: string): boolean {
  const aHasSourceFormat = a.includes('?')
  const bHasSourceFormat = b.includes('?')
  const aStyleCommand = aHasSourceFormat ? a.split('?')[1] : a
  const bStyleCommand = bHasSourceFormat ? b.split('?')[1] : b
  return aStyleCommand === bStyleCommand && aHasSourceFormat === bHasSourceFormat
}

/**
 * @param  {string} value
 * @returns ValidatorResponse
 * @description 样式名称校验
 */
export function styleNameValidator(value: string, suffix = ''): ValidatorResponse {
  if (!value) return '样式名不能为空'
  const fullName = suffix ? `${value}.${suffix}` : value
  if (fullName.length > 60 || /[^\da-zA-Z.]/.test(fullName)) return '名称使用数字、字母、小数点、总长度不超过 60 个字符'
}

/**
 * @description 给 commands 添加 sourceFormat
 */
export function appendSourceFormatToCommands(sourceFormat: string | null, commands: string) {
  if (sourceFormat == null || sourceFormat === '') {
    return commands
  }
  return `$0.${sourceFormat}?${commands}`
}

/**
 * @param  {string} styleName
 * @returns string
 * @description 从指定的样式名中解析出后缀和名称
 */

export function parseStyleName<T>(
  styleName: string, allowSuffix: T[]
): { name: string, nameSuffix: T }
export function parseStyleName(
  styleName: string
): { name: string, nameSuffix: string }
export function parseStyleName(
  styleName: string, allowSuffix: string[] = []
): { name: string, nameSuffix: string } {
  const lastPointIndex = styleName.lastIndexOf('.')

  // 没有后缀
  if (lastPointIndex === -1) {
    return { name: styleName, nameSuffix: '' }
  }

  const name = styleName.slice(0, lastPointIndex)
  const nameSuffix = styleName.slice(lastPointIndex)

  // 如果是 name.. 的情况，suffix 是 .，其实是没有后缀
  if (nameSuffix === '.') {
    return { name: styleName, nameSuffix: '' }
  }

  // 去掉 . 之后的是后缀
  const realSuffix = nameSuffix.slice(1)

  // 不支持的后缀判定为无后缀，比如 xxx.ui 判定为无后缀，name 是 xxx.ui
  if (allowSuffix.length > 0 && !allowSuffix.includes(realSuffix)) {
    return { name: styleName, nameSuffix: '' }
  }

  return { name, nameSuffix: realSuffix }
}

/**
 * @param  {string} rawName
 * @param  {MediaStyle} style
 * @returns string
 * @description 获取指定样式下文件名的访问连接
 */
export function getStyledFileKey(rawName: string, style: MediaStyle, separator = '-'): string {
  // 如果当前有指定源文件格式且当前的访问链接有文件名后缀
  if (getSourceFormat(style.commands) != null && rawName.includes('.')) {
    return rawName.replace(/\.[^.]+$/, `${separator}${style.name}`)
  }

  return `${rawName}${separator}${style.name}`
}

/**
 * @param  {string} commands
 * @returns boolean
 * @description 检查命令是否应该强制开启持久化保存
 */
export function isForcePersistence(commands: string): boolean {
  if (!commands) return false

  const commandList = getCommandNameList(commands)
  return commandList.some(commandName => ([
    // 这些命令运算复杂度较高，要求用户强制开启持久化
    'avthumb',
    'vframe',
    'avhls'
  ].includes(commandName)))
}

/**
 * 插入视频截取命令
 */
export function truncateVideo(
  type: MediaStyleType | null,
  commands: string,
  start: number,
  duration: number
) {
  const c = getCommandsWithoutSourceFormat(commands)

  if (
    type !== MediaStyleType.VideoWatermark
    && type !== MediaStyleType.VideoTranscode
    && type !== MediaStyleType.Manual
  ) {
    return false
  }

  // 拼接方式
  // 发现 format，则拼接在 format 之后
  // 其他，则拼接在 avthumb 之后

  const videoCommandStartReg = /^(avthumb\/[^/]+)(\/)?/

  const videoCommandReg = /(avthumb\/[^/]+)(\/)?/

  // 第一正则判断是否是 avthumb/{any} 开头
  // 第二个正则判断是否包含 ss/{start}/t/{duration} 命令
  const should = videoCommandStartReg.test(c) && !/ss\/[^/]*\/t\/[^/]*/.test(c)

  if (should) {
    // 如果紧跟着的是 preset，则参数插入到 avthumb 后面
    if (c.startsWith('avthumb/preset/')) {
      return commands.replace(/avthumb\//, `avthumb/ss/${start}/t/${duration}/`)
    }

    return commands.replace(videoCommandReg, `$1/ss/${start}/t/${duration}$2`)
  }

  return false
}

export function useCommands() {
  const image = useInjection(ImageCommand)
  const videoCover = useInjection(VideoCoverCommand)
  const videoWatermark = useInjection(WatermarkCommand)
  const videoTranscode = useInjection(TranscodeCommand)

  // 获取多媒体样式的类型
  const getMediaStyleType = React.useCallback(async (style: MediaStyle): Promise<MediaStyleType> => {
    // 检查图片图形化编辑是否支持
    if (await image.isSupported(style)) {
      return MediaStyleType.Image
    }

    if (await videoCover.isSupported(style)) {
      return MediaStyleType.VideoCover
    }

    // if (await videoWatermark.isSupported(style)) {
    //   return MediaStyleType.VideoWatermark
    // }

    if (await videoTranscode.isSupported(style)) {
      return MediaStyleType.VideoTranscode
    }

    return MediaStyleType.Manual
  }, [image, videoCover, videoTranscode])

  const isEqualOutputFormat = useCallback(async (type: MediaStyleType, a: MediaStyle, b: MediaStyle) => {
    if (type === MediaStyleType.Image) return image.isEqualOutputFormat(a, b)
    if (type === MediaStyleType.VideoCover) return videoCover.isEqualOutputFormat(a, b)
    if (type === MediaStyleType.VideoWatermark) return videoWatermark.isEqualOutputFormat(a, b)
    if (type === MediaStyleType.VideoTranscode) return videoTranscode.isEqualOutputFormat(a, b)

    return false
  }, [image, videoCover, videoTranscode, videoWatermark])

  return useMemo(() => ({
    image,
    videoCover,
    videoTranscode,
    videoWatermark,
    getMediaStyleType,
    isEqualOutputFormat
  }), [getMediaStyleType, isEqualOutputFormat, image, videoCover, videoWatermark, videoTranscode])
}
