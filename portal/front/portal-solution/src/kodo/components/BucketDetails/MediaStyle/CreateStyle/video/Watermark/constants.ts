/**
 * @file constants of video watermark
 * @author duli <duli@qiniu.com>
 */

export const sourceFormatList = [
  'mp4',
  'flv'
]

export const allowPreviewMimeTypeList = [
  'video/mp4',
  'video/x-flv',
  'video/quicktime'
]

export const allowPickAccept = {
  name: '视频',
  maxSize: 500 * 1024 * 1024,
  mimeTypes: allowPreviewMimeTypeList
}

export type SourceFormat = typeof sourceFormatList[number]

export const outputFormatList = [
  'ts',
  'mp4',
  'flv'
]
