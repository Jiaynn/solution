/**
 * @file command utils of image
 * @author yinxulai <yinxulai@qiniu.com>
 * @description 提供图片命令的解析和生成的方法
 * @link https://developer.qiniu.com/dora/3683/img-directions-for-use
 */

import { injectable } from 'qn-fe-core/di'

import { Order, CropFormValue, ScaleFormValue } from 'kodo/components/BucketDetails/ImageStyle/Drawer/CropScale'
import { WatermarkFormValue } from 'kodo/components/BucketDetails/ImageStyle/Drawer/Watermark'
import { computeCode, parseStyle } from 'kodo/components/BucketDetails/ImageStyle/Drawer/store'
import { MoreFormValue } from 'kodo/components/BucketDetails/ImageStyle/Drawer/More'

import { MediaStyle } from 'kodo/apis/bucket/image-style'

import { getCommandsWithoutSourceFormat, getSourceFormat, parseStyleName } from '../common/command'
import { CommandModule } from '../common/types'

import { outputFormatList, sourceFormatList } from './constants'

export type ImageBaseOptions = {
  name: string
  nameSuffix: string
  outputFormat: string
  sourceFormat: string
}

export type ImageCommandParseResult = {
  base: ImageBaseOptions

  advanced: boolean
  scaleCropOrder: Order
  cropForm: CropFormValue
  scaleForm: ScaleFormValue
  watermarkForm: WatermarkFormValue
  moreForm: MoreFormValue
  persistenceEnable: boolean
}

@injectable()
export class ImageCommand implements CommandModule<ImageCommandParseResult> {

  async parse(style: MediaStyle): Promise<ImageCommandParseResult> {
    const baseOptions = {
      name: '',
      nameSuffix: '',
      outputFormat: '',
      sourceFormat: ''
    }

    // 对 sourceFormat 进行解析
    const sourceFormat = getSourceFormat(style.commands)
    baseOptions.sourceFormat = sourceFormat || ''

    if (sourceFormat) {
      // 源文件格式必须在能处理的格式范围内
      if (!sourceFormatList.includes(sourceFormat)) {
        throw new Error('unsupported source format')
      }
    }

    // 取出 dora 的命令去交给下面的 parseStyle 解析
    const doraCode = sourceFormat ? getCommandsWithoutSourceFormat(style.commands) : style.commands
    const rawResult = parseStyle({ name: style.name, commands: doraCode })

    const nameInfo = parseStyleName(rawResult?.name || '', [
      ...sourceFormatList,
      ...outputFormatList
    ])

    baseOptions.name = nameInfo.name
    baseOptions.nameSuffix = nameInfo.nameSuffix || ''
    baseOptions.outputFormat = rawResult?.outputFormat || ''

    if (baseOptions.nameSuffix) {
      // 如果输出格式未指定时，样式名后缀与源文件格式不一致，则报错
      if (!baseOptions.outputFormat && baseOptions.nameSuffix !== baseOptions.sourceFormat) {
        throw new Error('unsupported name suffix')
      }
      // 如果输出格式不为空，但是样式名后最与输出格式不一致，则报错
      if (baseOptions.outputFormat && baseOptions.nameSuffix !== baseOptions.outputFormat) {
        throw new Error('unsupported name suffix')
      }
    }

    const result = {
      base: baseOptions,
      ...rawResult
    } as ImageCommandParseResult

    return result
  }

  generate(options: ImageCommandParseResult): MediaStyle {
    let styleName = options.base.name

    if (options.base.nameSuffix) {
      styleName += `.${options.base.nameSuffix}`
    }

    const computedOptions = {
      name: styleName,
      advanced: options.advanced,
      scaleForm: options.scaleForm,
      cropForm: options.cropForm,
      moreForm: options.moreForm,
      watermarkForm: options.watermarkForm,
      outputFormat: options.base.outputFormat,
      scaleCropOrder: options.scaleCropOrder
    }

    // 复用 ImageStyle 的逻辑
    const result: MediaStyle = {
      name: computedOptions.name,
      commands: computeCode(computedOptions),
      persistence_enable: options.persistenceEnable
    }

    // 如果指定了源文件格式则添加 kodo 参数
    if (options.base.sourceFormat) {
      result.commands = `$0.${options.base.sourceFormat}?${result.commands}`
    }

    return result
  }

  /**
   * @param  {MediaStyle} style
   * @returns boolean
   * @description 检查当前的输入样式是否完整支持图片可视化编辑
   */
  async isSupported(style: MediaStyle): Promise<boolean> {
    try {
      const result = await this.parse(style)
      return Boolean(result)
    } catch {
      return false
    }
  }

  /**
   * @param  {MediaStyle} a
   * @param  {MediaStyle} b
   * @returns boolean
   * @description 检查两个样式的的输出格式是否相同
   */
  async isEqualOutputFormat(a: MediaStyle, b: MediaStyle): Promise<boolean> {
    if (await this.isSupported(a) && await this.isSupported(b)) {
      const aInfo = await this.parse(a)
      const bInfo = await this.parse(b)
      return aInfo.base.outputFormat === bInfo.base.outputFormat
    }

    return false
  }
}
