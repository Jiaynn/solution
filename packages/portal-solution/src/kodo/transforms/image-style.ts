/**
 * @file transforms for image-style
 * @author zhangheng <zhangheng01@qiniu.com>
 */

// TODO: 这些方法都是针对图片样式的处理，应该挪到多媒体样式/图片样式下面去（等删除当前老版本图片样式的时候）

import { getCommandsWithoutSourceFormat } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/command'

export function getStyleAbbreviationType(style: string) {
  if (style.includes('imageView2/0')) {
    return '缩至指定长短边区域内'
  }

  if (style.includes('imageView2/1')) {
    return '缩至完全覆盖指定宽高区域，居中剪裁'
  }

  if (style.includes('imageView2/2')) {
    return '缩至指定宽高区域内'
  }

  if (style.includes('imageView2/3')) {
    return '缩至完全覆盖指定宽高区域'
  }

  if (style.includes('imageView2/4')) {
    return '缩至完全覆盖指定长短边区域'
  }

  if (style.includes('imageView2/5')) {
    return '缩至完全覆盖指定长短边区域，居中剪裁'
  }

  if (style.includes('imageMogr2')) {
    if (/\/thumbnail\/\d+@/.test(style)) {
      return '指定总像素值'
    }
    if (/\/thumbnail\/!\d+px/.test(style)) {
      return '宽度按百分比缩放，高度不变'
    }
    if (/\/thumbnail\/!\d+p/.test(style)) {
      return '原图按百分比缩放'
    }
    if (/\/thumbnail\/!x\d+p/.test(style)) {
      return '高度按百分比缩放，宽度不变'
    }
    if (/\/thumbnail\/\d+x\d+>/.test(style)) {
      return '等比例缩小'
    }
    if (/\/thumbnail\/\d+x\d+</.test(style)) {
      return '等比例放大'
    }
    if (/\/thumbnail\/\d+x\d+!/.test(style)) {
      return '指定宽高，强行缩放'
    }
    if (/\/thumbnail\/\d+x\d+/.test(style)) {
      return '缩放至指定宽高区域内'
    }
    if (/\/thumbnail\/\d+x/.test(style)) {
      return '指定宽度，高度自适应'
    }
    if (/\/thumbnail\/x\d+/.test(style)) {
      return '指定高度，宽度自适应'
    }
    if (/\/thumbnail\/!\d+x\d+r/.test(style)) {
      return '缩放至完全覆盖指定宽高区域'
    }
  }

  return null
}

export function getStyleQuality(style: string) {
  if (!style.includes('imageMogr2') && !style.includes('imageView2')) {
    return null
  }

  if (style.includes('imageMogr2') && style.includes('quality/')) {
    const array = style.split('/')
    const index = array.indexOf('quality') + 1
    if (array[index] && !Number.isNaN(Number.parseInt(array[index], 10))) {
      return Number.parseInt(array[index], 10)
    }
  }

  if (style.includes('imageView2') && style.includes('q/')) {
    const array = style.split('/')
    const index = array.indexOf('q') + 1
    if (array[index] && !Number.isNaN(Number.parseInt(array[index], 10))) {
      return Number.parseInt(array[index], 10)
    }
  }

  return 75
}

export function getStyleOutputFormat(style: string) {
  if (!style.includes('imageMogr2') && !style.includes('imageView2')) {
    return null
  }

  if (style.includes('format/')) {
    const array = style.split('/')
    const index = array.indexOf('format') + 1
    if (array[index]) {
      return array[index].toUpperCase()
    }
  }

  return '与原图一致'
}

export function getImagePreviewUrl(url: string, style?: string) {
  if (!style) return url
  if (url.includes('?')) {
    const [urlWithoutQuerystring, querystring] = url.split('?')
    return `${urlWithoutQuerystring}?${getCommandsWithoutSourceFormat(style)}&${querystring}`
  }
  return `${url}?${getCommandsWithoutSourceFormat(style)}`
}

// TODO: 目前只是简单判断下 tiff 格式和 webp 格式，并不准确
export type ImageFormat = 'tiff' | 'webp'

export function isImageFormatBrowserSupported(format: ImageFormat) {
  const userAgent = window.navigator.userAgent
  if (format === 'tiff') {
    return userAgent.includes('Safari') || userAgent.includes('Edge')
  }

  if (format === 'webp') {
    return userAgent.includes('Chrome')
  }
}

export function rangeValidator(min: number, max?: number, digits = 0) {
  const [text, max_] = max != null ? [`允许范围 ${min} - ${max}`, max] : [`不得小于 ${min}`, Number.MAX_VALUE]
  return (val: number) => {
    if (digits === 0 && !Number.isInteger(val)) return '请输入整数'
    const digitsValue: string = /(\.\d+)?$/.exec(String(val))?.[0] || ''
    if (digitsValue.length - 1 > digits) return `最多允许 ${digits} 位小数`
    if (val < min || val > max_) {
      return text
    }
  }
}

export function getPlaceHolderAndRange(placeholder: string, min?: number, max?: number) {
  return {
    placeholder,
    min,
    max
  }
}

export function mimeTypeToImageType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpeg'
    case 'image/png':
      return 'png'
    case 'image/gif':
      return 'gif'
    case 'image/tiff':
      return 'tiff'
    case 'image/bmp':
      return 'bmp'
    case 'image/svg+xml':
      return 'svg'
    case 'image/webp':
      return 'webp'
    case 'image/vnd.adobe.photoshop':
    case 'application/x-photoshop':
      return 'psd'
    default:
      return ''
  }
}
