export enum SourceFormat {
  Mp4 = 'mp4',
  Flv = 'flv',
  Mov = 'mov',
}

export enum OutputFormat {
  Jpg = 'jpg',
  Png = 'png',
  Gif = 'gif'
}

export enum CoverType {
  Static = 'static',
  Dynamic = 'dynamic'
}

export const coverTypeNameMap = {
  [CoverType.Static]: '静态封面',
  [CoverType.Dynamic]: '动态封面'
}

export const coverTypes = [CoverType.Static] // [CoverType.Static, CoverType.Dynamic]
export const sourceFormatList = [SourceFormat.Mp4, SourceFormat.Flv, SourceFormat.Mov]
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

export const outputFormatList = [OutputFormat.Jpg, OutputFormat.Png, OutputFormat.Gif]
export const staticCoverSuffixes = [OutputFormat.Jpg, OutputFormat.Png]
export const dynamicCoverSuffixes = [OutputFormat.Gif]

export enum CoverScaleType {
  None = 'none',
  // 限定宽, 高同比例缩放
  ScaleWidth = 'scaleWidth',
  // 限定高, 宽同比例缩放
  ScaleHeight = 'scaleHeight',
  // 限定宽高同比例缩放
  ScaleWidthHeight = 'scaleWidthHeight',
}

export const coverScaleTypes = [
  CoverScaleType.None,
  CoverScaleType.ScaleWidth,
  CoverScaleType.ScaleHeight,
  CoverScaleType.ScaleWidthHeight
]

export const coverScaleTypeNameMap = {
  [CoverScaleType.None]: '不缩放',
  [CoverScaleType.ScaleWidth]: '限定宽、高同比例缩放',
  [CoverScaleType.ScaleHeight]: '限定高、宽同比例缩放',
  [CoverScaleType.ScaleWidthHeight]: '限定宽高同比例缩放'
}

export enum CoverAutoScaleType {
  None = 0,
  One = 1,
  Two = 2
}

export const coverAutoScaleTypeNameMap = {
  [CoverAutoScaleType.None]: '不启用',
  [CoverAutoScaleType.One]: 1,
  [CoverAutoScaleType.Two]: 2
}

export const coverAutoScaleTypes = [CoverAutoScaleType.None, CoverAutoScaleType.One, CoverAutoScaleType.Two]

export function getCoverScaleType(w: number | null, h: number | null) {
  if (w == null && h == null) {
    return CoverScaleType.None
  }
  if (w != null && h == null) {
    return CoverScaleType.ScaleWidth
  }

  if (w == null && h != null) {
    return CoverScaleType.ScaleHeight
  }

  return CoverScaleType.ScaleWidthHeight
}

export function isValidSourceFormat(format: string): format is SourceFormat {
  return sourceFormatList.includes(format as any)
}

export function encodeKodoURI(bucketName: string, fileKey: string) {
  return `kodo://${bucketName}/${fileKey}`
}

export function decodeKodoURI(URI: string): [bucketName: string, fileKey: string] {
  const execArray = /kodo:\/\/([^/]+)\/(.*)/.exec(URI)
  if (execArray) {
    return execArray.slice(1, 3) as [string, string]
  }
  // 不符合规则时，直接把输入当作 fileKey 返回
  return ['', URI]
}
