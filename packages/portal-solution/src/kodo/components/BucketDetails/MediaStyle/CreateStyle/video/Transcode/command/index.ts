/**
 * @description commands of video transcode
 * @author yinxulai <yinxulai@qiniu.com>
 */

import moment from 'moment'
import { injectable } from 'qn-fe-core/di'

import { Nullable } from 'kodo/types/ts'

import { encodeUrlSafeBase64 } from 'kodo/transforms/base64'

import { MediaStyle } from 'kodo/apis/bucket/image-style'

import { CommandModule } from '../../../common/types'
import { appendSourceFormatToCommands, getCommandNameList, getCommandsWithoutSourceFormat, getSourceFormat, parseStyleName } from '../../../common/command'

import { toNumber } from '../../commands/utils'

import { outputFormatList, SourceFormat, sourceFormatList } from '../constants'

export type TranscodeBaseOptions = {
  name: string
  nameSuffix: string
  outputFormat?: 'm3u8'
  sourceFormat: string
}

export type AvhlsParams = {
  segtime?: number // 单位 s（秒）， 2-120s
  ss?: number // 指定视频截取的开始时间，单位为秒，支持精确到毫秒，例如3.345s
  t?: number // 指定进行音视频切片的长度，表示对时间段（0,Duration] 的音视频流进行切片，单位为秒（s），精确到毫秒（ms）
  ab?: number // 静态码率（CBR），单位：比特每秒（bit/s）
  abForce?: boolean // 强制使用制定码率转码
  ar?: number // 音频采样频率，单位：赫兹（Hz）
  r?: number // 视频帧率，每秒显示的帧数，单位：赫兹（Hz），常用帧率：24，25，30等，一般用默认值
  vb?: number // 视频比特率，单位：比特每秒 (bit/s)，常用视频码率有：128k、1.25m、5m等。若指定码率大于原视频码率，则使用原视频码率进行转码，参数末尾使用 ! 可以以强制使用指定码率转码, 如 128k!
  vbForce?: boolean // 强制使用制定码率转码
  vcodec?: 'libx264' | 'libx265'// 视频编码方案，默认采用 libx264
  acodec?: 'libmp3lame' | 'libfdk_aac' // 音频编码方案，支持方案：libmp3lame，libfdk_aac等，默认采用libfdk_aac
  sWidth?: number // 指定视频分辨率，从格式为<width>x<height>的命令中解析得到
  sHeight?: number // 指定视频分辨率，从格式为<width>x<height>的命令中解析得到
  // play?: string // 当转码还未完成时，可以转换直播为点播，从而播放全部已转码的部分（前端未消费）
  destKey?: string // 指定m3u8文件存储时的文件名（base64编码的）
  pattern?: string // 为各音视频流ts文件自定义命名。因为一整段音视频流音视频切片后会生成一个M3U8播放列表和多个默认命名的音视频流ts文件（base64编码的）。$(count)是必须存在的六位占位符数字串
}

export type CommandParseResult<T = AvhlsParams> = {
  base: TranscodeBaseOptions
  persistenceEnable?: boolean // 是否开启持久化存储
  transcode: T // 与 outputFormat 为互斥
}

@injectable()
export class TranscodeCommand implements CommandModule<CommandParseResult> {
  async parse(style: MediaStyle): Promise<CommandParseResult> {
    const sourceFormat = getSourceFormat<SourceFormat>(style.commands)
    if (sourceFormat != null && !sourceFormatList.includes(sourceFormat)) {
      throw new Error('不支持的源文件格式')
    }

    const { name, nameSuffix } = parseStyleName(
      style.name,
      [...sourceFormatList, ...outputFormatList]
    )

    const baseOptions: TranscodeBaseOptions = {
      name,
      nameSuffix,
      outputFormat: 'm3u8',
      sourceFormat: sourceFormat || ''
    }

    const commands = getCommandsWithoutSourceFormat(style.commands)

    const paramsRegExp = new RegExp([
      '^avhls/(?<format>m3u8)',
      '(?:/segtime/(?<segtime>([1-9][\\d]*|0)(\\.[\\d]+)?))?',
      '(?:/ss/(?<ss>([1-9][\\d]*|0)(\\.[\\d]+)?)/t/(?<t>([1-9][\\d]*|0)(\\.[\\d]+)?))?',
      '(?:(/ab/(?<ab>([1-9][\\d]*|0)(\\.[\\d])?k?!?)))?',
      '(?:/ar/(?<ar>\\d+))?',
      '(?:/r/(?<r>\\d+))?',
      '(?:/vb/(?<vb>([1-9][\\d]*|0)(\\.[\\d])?k?!?))?',
      '(?:/vcodec/(?<vcodec>libx264|libx265))?',
      '(?:/acodec/(?<acodec>libmp3lame|libfdk_aac))?',
      '(?:/s/(?<sWidth>\\d+)?x(?<sHeight>\\d+)?)?',
      // '(?:/play/(?<play>[^/]+))?',
      '(?:/destKey/(?<destKey>[^/]))?',
      '(?:/pattern/(?<pattern>[^/]))?',
      '(?:/?)$'
    ].join(''))

    const execResult = paramsRegExp.exec(commands)
    if (execResult == null) throw new Error('命令解析失败')
    const execResultGroups = execResult.groups as { [key in keyof AvhlsParams]: string }

    const params: AvhlsParams = {}
    if (execResultGroups.segtime !== undefined) {
      params.segtime = toNumber(execResultGroups.segtime, {
        min: 2,
        max: 120,
        decimalsLimit: 3
      })
    }

    if (execResultGroups.ss !== undefined && execResultGroups.t !== undefined) {
      params.ss = toNumber(execResultGroups.ss, {
        min: 0,
        decimalsLimit: 3
      })

      params.t = toNumber(execResultGroups.t, {
        min: 0.001,
        decimalsLimit: 3
      })
    }

    if (execResultGroups.ab !== undefined) {
      const flagExecResult = /(?<base>k)?(?<force>!)?$/.exec(execResultGroups.ab)
      if (flagExecResult && flagExecResult.groups?.force) params.abForce = true
      const pureNumber = execResultGroups.ab.replace(/k?!?$/, '')
      const base = flagExecResult && flagExecResult.groups?.base
      const value = toNumber(pureNumber, {
        min: base === 'k' ? 1 : 1 * 1e3,
        max: base === 'k' ? 600 : 600 * 1e3,
        decimalsLimit: base === 'k' ? 1 : 0
      })

      if (base === 'k') {
        params.ab = value
      } else {
        params.ab = toNumber(`${value / 1e3}`, {
          min: 1,
          max: 600,
          decimalsLimit: 1
        })
      }
    }

    if (execResultGroups.ar !== undefined) {
      params.ar = toNumber(execResultGroups.ar, {
        min: 8000,
        max: 100000,
        decimalsLimit: 0
      })
    }

    if (execResultGroups.r !== undefined) {
      params.r = toNumber(execResultGroups.r, {
        min: 1,
        max: 30,
        decimalsLimit: 0
      })
    }

    if (execResultGroups.vb !== undefined) {
      const flagExecResult = /(?<base>k)?(?<force>!)?$/.exec(execResultGroups.vb)
      if (flagExecResult && flagExecResult.groups?.force) params.vbForce = true
      const pureNumber = execResultGroups.vb.replace(/k?!?$/, '')
      const base = flagExecResult && flagExecResult.groups?.base
      const value = toNumber(pureNumber, {
        min: base === 'k' ? 10 : 10 * 1e3,
        max: base === 'k' ? 60000 : 60000 * 1e3,
        decimalsLimit: base === 'k' ? 1 : 0
      })

      if (base === 'k') {
        params.vb = value
      } else {
        params.vb = toNumber(`${value / 1e3}`, {
          min: 10,
          max: 60000,
          decimalsLimit: 1
        })
      }
    }

    params.vcodec = execResultGroups.vcodec as typeof params.vcodec

    params.acodec = execResultGroups.acodec as typeof params.acodec

    if (execResultGroups.sWidth !== undefined) {
      params.sWidth = toNumber(execResultGroups.sWidth, {
        min: 20,
        max: 3840,
        decimalsLimit: 0
      })
    }

    if (execResultGroups.sHeight !== undefined) {
      params.sHeight = toNumber(execResultGroups.sHeight, {
        min: 20,
        max: 3840,
        decimalsLimit: 0
      })
    }

    if (params.sWidth != null && params.sHeight != null) {
      if (params.sWidth > 2160 && params.sHeight > 2160) {
        throw new Error('invalid s parameter')
      }
    }

    return {
      base: baseOptions,
      transcode: params,
      persistenceEnable: style.persistence_enable
    }
  }

  /**
   * 生成样式命令
   * @param options 表单选项
   * @param isValid 表单是否有效，无效的时候则生产空的命令
   */
  generate(options: CommandParseResult<Nullable<AvhlsParams>>, isValid = true): MediaStyle {
    const mediaStyle: MediaStyle = {
      name: options.base.name,
      commands: 'avhls/m3u8',
      persistence_enable: true
    }

    mediaStyle.commands = appendSourceFormatToCommands(
      options.base.sourceFormat,
      mediaStyle.commands
    )

    if (options.base.nameSuffix) {
      mediaStyle.name += `.${options.base.nameSuffix}`
    }

    if (!isValid) return mediaStyle

    const transcodeOptions = options.transcode

    if (transcodeOptions.segtime != null) {
      mediaStyle.commands += `/segtime/${transcodeOptions.segtime}`
    }

    if (transcodeOptions.ss != null && transcodeOptions.t !== null) {
      mediaStyle.commands += `/ss/${transcodeOptions.ss}/t/${transcodeOptions.t}`
    }

    if (transcodeOptions.ab != null) {
      mediaStyle.commands += `/ab/${transcodeOptions.ab}k${transcodeOptions.abForce ? '!' : ''}`
    }

    if (transcodeOptions.ar != null) {
      mediaStyle.commands += `/ar/${transcodeOptions.ar}`
    }

    if (transcodeOptions.r != null) {
      mediaStyle.commands += `/r/${transcodeOptions.r}`
    }

    if (transcodeOptions.vb != null) {
      mediaStyle.commands += `/vb/${transcodeOptions.vb}k${transcodeOptions.vbForce ? '!' : ''}`
    }

    if (transcodeOptions.vcodec != null) {
      mediaStyle.commands += `/vcodec/${transcodeOptions.vcodec}`
    }

    if (transcodeOptions.acodec != null) {
      mediaStyle.commands += `/acodec/${transcodeOptions.acodec}`
    }

    if (transcodeOptions.sWidth != null || transcodeOptions.sHeight != null) {
      mediaStyle.commands += `/s/${transcodeOptions.sWidth || ''}x${transcodeOptions.sHeight || ''}`
    }

    if (transcodeOptions.destKey != null) {
      mediaStyle.commands += `/destKey/${encodeUrlSafeBase64(transcodeOptions.destKey)}`
    }

    if (transcodeOptions.pattern != null) {
      mediaStyle.commands += `/pattern/${encodeUrlSafeBase64(transcodeOptions.pattern)}`
    }

    return mediaStyle
  }

  async isSupported(style: MediaStyle) {
    try {
      await this.parse(style)
    } catch (e) {
      return false
    }
    return true
  }

  async isEqualOutputFormat(a: MediaStyle, b: MediaStyle): Promise<boolean> {
    if (await this.isSupported(a) && await this.isSupported(b)) {
      const aInfo = await this.parse(a)
      const bInfo = await this.parse(b)
      return aInfo.base.outputFormat === bInfo.base.outputFormat
    }

    return false
  }
}

// 向命令添加预览用的特殊参数
export function appendPreviewParams(fileKey: string, commands: string): string {
  let newCommands = commands
  const commandNameList = getCommandNameList(commands)
  if (commandNameList.includes('avhls') && !commands.includes('|')) {
    if (fileKey) {
      const time = moment().format('YYYYMMDDHHmmss')
      const destKey = `${fileKey}_stylepreview_${time}.m3u8`
      const pattern = `${fileKey}_stylepreview_${time}/$(count).ts`
      newCommands = newCommands.replace(/\/$/, '')
      newCommands += `/destKey/${encodeUrlSafeBase64(destKey)}`
      newCommands += `/pattern/${encodeUrlSafeBase64(pattern)}`
    }
  }

  return newCommands
}

export function getTsFileName(rawFileKey: string): string {
  return `${rawFileKey}~/000001.ts`
}
