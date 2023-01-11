/**
 * @description commands of video watermark
 * @author duli <duli@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'

import { getKodoResourceProxyUrl } from 'kodo/utils/resource'

import { getHourMinSec } from 'kodo/transforms/date-time'

import { Origin, watermarkFontFamily, WatermarkMode } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/constants'

import { ImageStyleApis, MediaStyle, TranscodePreset } from 'kodo/apis/bucket/image-style'
import {
  getSourceFormat,
  getCommandsWithoutSourceFormat,
  appendSourceFormatToCommands,
  parseStyleName
} from '../../../common/command'
import { decodeKodoURI } from '../../utils'
import { CommandModule } from '../../../common/types'
import { TimelineType } from '../Watermark/WatermarkFormCard/Timeline'
import { RatioType, WatermarkFormItemValue } from '../Watermark/WatermarkFormCard'
import { outputFormatList, SourceFormat, sourceFormatList } from '../constants'

import { parse as parseWatermark, PictureCommand, WordsCommand } from './parse'
import { generate as generateWatermarkCommand } from './generate'

export type VideoWatermarkBaseOptions = {
  name: string
  nameSuffix: string
  outputFormat?: string
  sourceFormat: string
}

export type CommandParseResult = {
  base: VideoWatermarkBaseOptions
  outputFormat?: string // transcodeId 为互斥
  transcodeId: string | null // 与 outputFormat 为互斥
  persistenceEnable: boolean // 是否开启
  watermarkForm: Array<Partial<WatermarkFormItemValue>>
}

@injectable()
export class WatermarkCommand implements CommandModule<CommandParseResult> {

  constructor(
    toasterStore: ToasterStore,
    private imageStyleApis: ImageStyleApis
  ) { ToasterStore.bindTo(this, toasterStore) }
  private presetListCache: { data: Promise<TranscodePreset[]>, deadline: number } | null = null

  @ToasterStore.handle()
  private getPresetListWithCache() {
    if (this.presetListCache && this.presetListCache.deadline >= Date.now()) {
      return this.presetListCache.data
    }

    const promise = this.imageStyleApis.getTranscodePreset()
    this.presetListCache = { data: promise, deadline: Date.now() + 30 * 1000 }
    promise.catch(() => { this.presetListCache = null })
    return promise
  }

  private getWatermarkCommandStrList(commands: string): string[] {
    return commands.split(/(?=wmText|wmImage)/)
      .map(item => item.replace(/(.*)\/$/, '$1'))
      .filter(item => item.startsWith('wmText') || item.startsWith('wmImage'))
  }

  private async parseTranscode(commandsStr: string): Promise<Pick<CommandParseResult, 'outputFormat' | 'transcodeId'>> {
    // 格式如下，我们先解析 format 和 preset 部分
    // avthumb/(format?)/(preset/presetId?)/...

    const commandList = commandsStr.split('/')

    if (outputFormatList.includes(commandList[1])) {
      return {
        transcodeId: null,
        outputFormat: commandList[1]
      }
    }

    if (commandList[1] === 'preset') {
      const presetId = commandList[2]
      if (!presetId) throw new Error('无效的转码预设 ID')
      const presetList = await this.getPresetListWithCache()
      const matchedPreset = presetList.find(i => i.id === presetId)
      if (!matchedPreset) throw new Error('无效的转码预设 ID')

      return {
        transcodeId: presetId,
        outputFormat: matchedPreset.params?.format
      }
    }

    throw new Error('未设置转码预设 ID 时必须指定有效的输出格式')
  }

  async parse(style: MediaStyle): Promise<CommandParseResult> {
    const sourceFormat = getSourceFormat<SourceFormat>(style.commands)
    // check source format
    if (sourceFormat != null && !sourceFormatList.includes(sourceFormat)) {
      throw new Error('不支持的源文件格式')
    }

    const commands = getCommandsWithoutSourceFormat(style.commands)
    const { name, nameSuffix } = parseStyleName(style.name, [...sourceFormatList, ...outputFormatList])

    const baseOptions: VideoWatermarkBaseOptions = {
      name,
      nameSuffix,
      outputFormat: undefined,
      sourceFormat: sourceFormat || ''
    }

    // 暂时先直接判断是以 'avthumb'开头
    // mark: 是否要检验是 allowList outputFormat
    if (!/^avthumb\/[^/]+/.test(commands)) throw new Error('非视频水印命令')

    const transcodeInfo = await this.parseTranscode(commands)
    baseOptions.outputFormat = transcodeInfo.outputFormat

    // 存在名称后缀时需要检查后缀是否和输出格式保持一致
    if (baseOptions.nameSuffix && baseOptions.nameSuffix !== baseOptions.outputFormat) {
      throw new Error('样式名后缀与输出格式不一致')
    }

    if (
      baseOptions.sourceFormat && !baseOptions.outputFormat
      && baseOptions.sourceFormat !== baseOptions.outputFormat
    ) {
      throw new Error('源文件格式不为空且未指定转码样式时，输出格式与源文件必须保持一致')
    }

    const commandsList = this.getWatermarkCommandStrList(commands)

    const watermarkForm: Array<Partial<WatermarkFormItemValue>> = []

    for (const item of commandsList) {
      const commandsObj: Partial<WordsCommand & PictureCommand> = parseWatermark(item)

      const { hours = 0, minutes = 0, seconds = 0 } = typeof commandsObj.wmPos === 'number'
        ? getHourMinSec(commandsObj.wmPos)
        : {}

      // eslint-disable-next-line no-nested-ternary
      const timelineType = commandsObj.wmPos == null
        ? TimelineType.Same
        : commandsObj.wmDuration != null && commandsObj.wmDuration >= 0
          ? TimelineType.Forward
          : TimelineType.Reverse

      const duration = timelineType !== TimelineType.Same && commandsObj.wmDuration != null
        ? Math.abs(commandsObj.wmDuration)
        : commandsObj.wmDuration

      const wmImageInfo = commandsObj.wmImage ? decodeKodoURI(commandsObj.wmImage) : null
      const previewUrl = wmImageInfo ? getKodoResourceProxyUrl({ bucket: wmImageInfo[0], key: wmImageInfo[1] }) : ''

      watermarkForm.push({
        mode: commandsObj.wmImage ? WatermarkMode.Picture : WatermarkMode.Word,
        url: commandsObj.wmImage,
        previewUrl,
        words: commandsObj.wmText,
        fontSize: commandsObj.wmFontSize ?? 16,
        fontColor: commandsObj.wmFontColor ?? '#000000',
        fontFamily: commandsObj.wmFont ?? watermarkFontFamily[7],
        ratio: commandsObj.wmScale,
        ratioType: commandsObj.wmScale != null ? RatioType.Adaptive : RatioType.Intrinsic,
        origin: (commandsObj.wmGravity || commandsObj.wmGravityText) ?? Origin.NorthEast,
        ignoreLoop: commandsObj.wmIgnoreLoop != null ? !!commandsObj.wmIgnoreLoop : true,
        horizontal: commandsObj.wmOffsetX ?? 0,
        vertical: commandsObj.wmOffsetY ?? 0,
        timelineType,
        startHours: hours,
        startMinutes: minutes,
        startSeconds: seconds,
        duration,
        shortest: commandsObj.wmShortest != null ? !!commandsObj.wmShortest : false
      })
    }

    return {
      base: baseOptions,
      transcodeId: transcodeInfo.transcodeId,
      persistenceEnable: style.persistence_enable || false,
      watermarkForm
    }
  }

  /**
   * 生成样式命令
   * @param options 表单选项
   * @param isValid 表单是否有效，无效的时候则生产空的命令
   */
  generate(options: CommandParseResult, isValid = true): MediaStyle {
    let name = options.base.name

    if (options.base.nameSuffix) {
      name += `.${options.base.nameSuffix}`
    }

    const { outputFormat } = options.base
    const { transcodeId } = options

    // 转码 id 和输出格式必须二存一
    // 必须优先判断 transcodeId
    const transcodeCommands = transcodeId
      ? `preset/${transcodeId}`
      : outputFormat

    return {
      name,
      commands: appendSourceFormatToCommands(
        options.base.sourceFormat,
        `avthumb/${transcodeCommands}${isValid ? '/' + generateWatermarkCommand(options) : ''}`
      ),
      persistence_enable: true
    }
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
