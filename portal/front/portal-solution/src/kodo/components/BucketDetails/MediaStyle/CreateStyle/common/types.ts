/**
 * @file common type about command
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { MediaStyle } from 'kodo/apis/bucket/image-style'

export interface CommandModule<T> {
  // 将原始的多媒体样式解析成对象
  parse(style: MediaStyle): Promise<T>
  // 通过对象生成对应的多媒体样式
  generate(options: T, isValid?: boolean): MediaStyle
  // 检查当前 Module 是否支持处理指定样式
  isSupported(style: MediaStyle): Promise<boolean>
  // 检查两个多媒体样式的输出格式是否相同
  isEqualOutputFormat(a: MediaStyle, b: MediaStyle): Promise<boolean>
}

// 通过 FormController，将不同的 form 表单的创建、校验、生成等逻辑封装到对应的 Form 模块内部
// 外部通过 FormController 与 form 进行必要的数据交换，从而降低 Form 与外部的耦合度
export interface FormController {
  validate(isPreview?: boolean): Promise<boolean | { hasError: boolean, error?: string }> // 校验表单的状态
  getStyleList(isPreview?: boolean): MediaStyle[] // 获取所有的样式，包括批量编辑的样式，格式：[当前编辑的样式, ...批量编辑的样式[]]
}
