/**
 * @description media style common constants
 * @author duli <duli@qiniu.com>
 */

// 当前界面上支持的几种样式模式
export enum MediaStyleType {
  Manual = 'manual', // 手动编辑

  Image = 'image', // 图片样式
  VideoCover = 'videoCover', // 视频封面
  VideoWatermark = 'videoWatermark', // 视频水印
  VideoTranscode = 'videoTranscode' // 视频转码
}

export const mediaStyleTypeNameMap = {
  [MediaStyleType.Manual]: '手动编辑',
  [MediaStyleType.Image]: '图片',
  [MediaStyleType.VideoCover]: '视频封面',
  [MediaStyleType.VideoWatermark]: '视频水印',
  [MediaStyleType.VideoTranscode]: '视频转码'
} as const

export const videoTypes = [
  MediaStyleType.VideoCover,
  MediaStyleType.VideoTranscode,
  MediaStyleType.VideoWatermark
]

export enum WatermarkMode {
  None = 0,
  Picture = 1,
  Word = 2
}

export enum Origin {
  NorthWest = 'NorthWest',
  North = 'North',
  NorthEast = 'NorthEast',
  East = 'East',
  SouthEast = 'SouthEast',
  South = 'South',
  SouthWest = 'SouthWest',
  West = 'West',
  Center = 'Center'
}

export const origins = [
  Origin.NorthWest,
  Origin.North,
  Origin.NorthEast,
  Origin.West,
  Origin.Center,
  Origin.East,
  Origin.SouthWest,
  Origin.South,
  Origin.SouthEast
] as const

export const watermarkOriginTextMap = {
  [Origin.NorthWest]: '左上',
  [Origin.North]: '中上',
  [Origin.NorthEast]: '右上',
  [Origin.East]: '右中',
  [Origin.SouthEast]: '右下',
  [Origin.South]: '中下',
  [Origin.SouthWest]: '左下',
  [Origin.West]: '左中',
  [Origin.Center]: '中'
} as const

export const watermarkFontFamily = [
  '文泉驿正黑',
  '文泉驿等宽正黑',
  '文泉驿微米黑',
  '文泉驿等宽微米黑',
  '思源黑体',
  '思源宋体',
  '方正仿宋',
  '方正黑体',
  '方正楷体',
  '方正书宋'
]
