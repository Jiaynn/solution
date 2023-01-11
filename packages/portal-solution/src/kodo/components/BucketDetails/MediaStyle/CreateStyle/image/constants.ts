/**
 * @file image style constants
 * @author yinxulai <yinxulai@qiniu.com>
 */

export const sourceFormatList = [
  'jpg',
  'jpeg',
  'png',
  'tiff',
  'bmp',
  'gif',
  'webp'
]

export const allowPreviewMimeTypeList = [
  'image/jpg',
  'image/jpeg',
  'image/bmp',
  'image/png',
  'image/gif',
  'image/tiff',
  'image/webp'
]

export const allowPickAccept = {
  name: '图片',
  maxSize: 20 * 1024 * 1024,
  mimeTypes: allowPreviewMimeTypeList
}

export const outputFormatList = [
  'jpg',
  'png',
  'svg',
  'gif',
  'bmp',
  'tiff',
  'webp'
]

export const allowWatermarkImageFormatList = [
  'jpeg',
  'jpg',
  'bmp',
  'png',
  'gif',
  'apng'
]

export const allowWatermarkImageMimeTypeList = [
  'image/jpeg',
  'image/bmp',
  'image/png',
  'image/gif',
  'image/apng'
]

export const allowWatermarkImagePickAccept = {
  name: '图片',
  maxSize: 20 * 1024 * 1024,
  mimeTypes: allowWatermarkImageMimeTypeList
}
