/**
 * @description constants of image style drawer
 * @author duli <duli@qiniu.com>
 */

import BasicScaleWHCenterIcon from './icons/basic-scale-wh-center.svg'
import BasicScaleWHContainIcon from './icons/basic-scale-wh-contain.svg'
import BasicScaleWHCoverIcon from './icons/basic-scale-wh-cover.svg'
import BasicScaleLSCenterIcon from './icons/basic-scale-ls-center.svg'
import BasicScaleLSContainIcon from './icons/basic-scale-ls-contain.svg'
import BasicScaleLSCoverIcon from './icons/basic-scale-ls-cover.svg'
import AdvanceScaleNoneIcon from './icons/advanced-scale-none.svg'
import AdvancedScaleWHCoverIcon from './icons/advanced-scale-wh-cover.svg'
import AdvancedScaleWHContainIcon from './icons/advanced-scale-wh-contain.svg'
import AdvancedScaleWHForceIcon from './icons/advanced-scale-wh-force.svg'
import AdvancedScaleWHAutoIcon from './icons/advanced-scale-w-h-auto.svg'
import AdvancedScaleHWAutoIcon from './icons/advanced-scale-h-w-auto.svg'
import AdvancedScalePercentIcon from './icons/advanced-scale-percent.svg'
import AdvancedScaleHeightPercentIcon from './icons/advanced-scale-h-percent.svg'
import AdvancedScaleWidthPercentIcon from './icons/advanced-scale-w-percent.svg'
import AdvancedScaleWHPercentZoomOutIcon from './icons/advanced-scale-wh-percent-zoom-out.svg'
import AdvancedScaleWHPercentZoomInIcon from './icons/advanced-scale-wh-percent-zoom-in.svg'
import AdvancedScalePixelIcon from './icons/advanced-scale-pixel.svg'
import CenterCutIcon from './icons/center-cut.svg'
import ScaleWebpIcon from './icons/scale-webp.svg'
import WatermarkIcon from './icons/watermark.svg'
import CustomIcon from './icons/custom.svg'

import CropRegionAllIcon from './icons/advanced-crop-region-all.svg'
import CropRegionWidthIcon from './icons/advanced-crop-region-width.svg'
import CropRegionHeightIcon from './icons/advanced-crop-region-height.svg'

import CropRegionAllFrontIcon from './icons/advanced-crop-offset-all-front.svg'
import CropRegionWidthFrontIcon from './icons/advanced-crop-offset-width-front.svg'
import CropRegionHeightFrontIcon from './icons/advanced-crop-offset-height-front.svg'

import CropRegionAllBackIcon from './icons/advanced-crop-offset-all-back.svg'
import CropRegionWidthBackIcon from './icons/advanced-crop-offset-width-back.svg'
import CropRegionHeightBackIcon from './icons/advanced-crop-offset-height-back.svg'

export enum EditMode {
  Visual,
  Manual
}

export enum AdvancedScaleType {
  None = 'none',
  WHContain = 'wh-contain',
  HAuto = 'h-auto',
  WAuto = 'w-auto',
  WHCover = 'wh-cover',
  WHForce = 'wh-force',
  Percent = 'percent',
  HPercent = 'h-percent',
  WPercent = 'w-percent',
  WHPercentZoomOut = 'wh-percent-zoomout',
  WHPercentZoomIn = 'wh-percent-zoomin',
  Pixel = 'pixel',
}

export const advancedScaleTypeInfo = {
  [AdvancedScaleType.None]: {
    name: '不缩放',
    params: {
      width: null,
      height: null,
      scale: null,
      pixels: null
    },
    image: AdvanceScaleNoneIcon,
    description: ''
  },
  [AdvancedScaleType.WHContain]: {
    name: '缩放至指定宽高区域内',
    params: {
      width: 'PX',
      height: 'PX',
      scale: null,
      pixels: null
    },
    image: AdvancedScaleWHContainIcon,
    description: '保持原图宽高比，宽和高缩放到指定宽高区域内的最大图片。'
  },
  [AdvancedScaleType.HAuto]: {
    name: '指定宽度，高度自适应',
    params: {
      width: 'PX',
      height: null,
      scale: null,
      pixels: null
    },
    image: AdvancedScaleWHAutoIcon,
    description: '指定宽度，高度自适应，保持原图宽高比不变。'
  },
  [AdvancedScaleType.WAuto]: {
    name: '指定高度，宽度自适应',
    params: {
      width: null,
      height: 'PX',
      scale: null,
      pixels: null
    },
    image: AdvancedScaleHWAutoIcon,
    description: '指定高度，宽度自适应，保持原图宽高比不变。'
  },
  [AdvancedScaleType.WHCover]: {
    name: '缩放至完全覆盖指定宽高区域',
    params: {
      width: 'PX',
      height: 'PX',
      scale: null,
      pixels: null
    },
    image: AdvancedScaleWHCoverIcon,
    description: '保持原图宽高比，宽和高缩放至完全覆盖指定宽高区域的最小图片。'
  },
  [AdvancedScaleType.WHForce]: {
    name: '指定宽高，强行缩放',
    params: {
      width: 'PX',
      height: 'PX',
      scale: null,
      pixels: null
    },
    image: AdvancedScaleWHForceIcon,
    description: '指定宽高，强行缩放，图片可能变形。'
  },
  [AdvancedScaleType.Percent]: {
    name: '原图按百分比缩放',
    params: {
      width: null,
      height: null,
      scale: '%',
      pixels: null
    },
    image: AdvancedScalePercentIcon,
    description: '保持原图宽高比不变，按百分比缩放。'
  },
  [AdvancedScaleType.HPercent]: {
    name: '高度按百分比缩放，宽度不变',
    params: {
      width: null,
      height: '%',
      scale: null,
      pixels: null
    },
    image: AdvancedScaleHeightPercentIcon,
    description: ''
  },
  [AdvancedScaleType.WPercent]: {
    name: '宽度按百分比缩放，高度不变',
    params: {
      width: '%',
      height: null,
      scale: null,
      pixels: null
    },
    image: AdvancedScaleWidthPercentIcon,
    description: ''
  },
  [AdvancedScaleType.WHPercentZoomOut]: {
    name: '等比例缩小',
    params: {
      width: 'PX',
      height: 'PX',
      scale: null,
      pixels: null
    },
    image: AdvancedScaleWHPercentZoomOutIcon,
    description: '等比缩小（只能缩小），比例值为宽度缩放比和高度缩放比的较小值。'
  },
  [AdvancedScaleType.WHPercentZoomIn]: {
    name: '等比例放大',
    params: {
      width: 'PX',
      height: 'PX',
      scale: null,
      pixels: null
    },
    image: AdvancedScaleWHPercentZoomInIcon,
    description: '等比放大（只能放大），比例值为宽度缩放比和高度缩放比的较小值。'
  },
  [AdvancedScaleType.Pixel]: {
    name: '指定总像素值',
    params: {
      width: null,
      height: null,
      scale: null,
      pixels: 'PX'
    },
    image: AdvancedScalePixelIcon,
    description: '保持原图宽高比等比缩放，缩放后像素不超过指定值。'
  }
} as const

export const advancedScaleKeys = [
  AdvancedScaleType.None,
  AdvancedScaleType.WHContain,
  AdvancedScaleType.HAuto,
  AdvancedScaleType.WAuto,
  AdvancedScaleType.WHCover,
  AdvancedScaleType.WHForce,
  AdvancedScaleType.Percent,
  AdvancedScaleType.HPercent,
  AdvancedScaleType.WPercent,
  AdvancedScaleType.WHPercentZoomOut,
  AdvancedScaleType.WHPercentZoomIn,
  AdvancedScaleType.Pixel
] as const

export enum BasicScaleType {
  WHCenter = 'wh-center',
  WHContain = 'wh-contain',
  WHCover= 'wh-cover',
  LSCenter = 'ls-center',
  LSContain = 'ls-contain',
  LSCover= 'ls-cover',
}

export const basicScaleTypeInfo = {
  [BasicScaleType.WHCenter]: {
    name: '缩至完全覆盖指定宽高区域，居中剪裁',
    mode: 1,
    image: BasicScaleWHCenterIcon,
    description: '保持原图宽高比缩小，宽和高缩至完全覆盖指定宽高区域的最小图片，然后居中剪裁。'
  },
  [BasicScaleType.WHContain]: {
    name: '缩至指定宽高区域内',
    mode: 2,
    image: BasicScaleWHContainIcon,
    description: '保持原图宽高比缩小，宽和高缩小到指定宽高区域内的最大图片。'
  },
  [BasicScaleType.WHCover]: {
    name: '缩至完全覆盖指定宽高区域',
    mode: 3,
    image: BasicScaleWHCoverIcon,
    description: '保持原图宽高比缩小，宽和高缩至完全覆盖指定宽高区域的最小图片。'
  },
  [BasicScaleType.LSContain]: {
    name: '缩至指定长短边区域内',
    mode: 0,
    image: BasicScaleLSContainIcon,
    description: '保持原图长短边比例缩小，长边和短边缩小到指定长短边区域内的最大图片。'
  },
  [BasicScaleType.LSCover]: {
    name: '缩至完全覆盖指定长短边区域',
    mode: 4,
    image: BasicScaleLSCoverIcon,
    description: '保持原图长短边比例缩小，长边和短边缩至完全覆盖指定长短边区域的最小图片。'
  },
  [BasicScaleType.LSCenter]: {
    name: '缩至完全覆盖指定长短边区域，居中剪裁',
    mode: 5,
    image: BasicScaleLSCenterIcon,
    description: '保持原图长短边比例缩小，长边和短边缩至完全覆盖指定长短边区域的最小图片，然后居中剪裁'
  }
} as const

export enum BasicScaleCategory {
  None, // 不缩略裁剪
  WH, // 指定宽高缩略裁剪
  LS // 指定长短边缩略裁剪
}

export const basicScaleCategoryTextMap = {
  [BasicScaleCategory.None]: '不缩略裁剪',
  [BasicScaleCategory.WH]: '指定宽高缩略裁剪',
  [BasicScaleCategory.LS]: '指定长短边缩略裁剪'
}

export const basicScaleCategories = [BasicScaleCategory.None, BasicScaleCategory.WH, BasicScaleCategory.LS]

export const scaleCategory2ScaleType = {
  [BasicScaleCategory.None]: [],
  [BasicScaleCategory.WH]: [BasicScaleType.WHCenter, BasicScaleType.WHContain, BasicScaleType.WHCover],
  [BasicScaleCategory.LS]: [BasicScaleType.LSCenter, BasicScaleType.LSContain, BasicScaleType.LSCover]
} as const

export const basicScaleTypes = [
  BasicScaleType.WHCenter,
  BasicScaleType.WHContain,
  BasicScaleType.WHCover,
  BasicScaleType.LSCenter,
  BasicScaleType.LSContain,
  BasicScaleType.LSCover
] as const

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

export enum CropRegion {
  Width = 'width',
  Height = 'height',
  All = 'all'
}

export const cropRegions = [CropRegion.Width, CropRegion.Height, CropRegion.All] as const

export enum OffsetDirection {
  None = 'None',
  LeftTop = 'LeftTop',
  RightTop = 'RightTop',
  RightBottom = 'RightBottom',
  LeftBottom = 'LeftBottom'
}

export const offsetDirections = [
  OffsetDirection.None,
  OffsetDirection.LeftTop,
  OffsetDirection.LeftBottom,
  OffsetDirection.RightTop,
  OffsetDirection.RightBottom
] as const

export const cropRegionDescMap = {
  [CropRegion.Width]: '由原图高和指定宽构成的剪裁区域。',
  [CropRegion.Height]: '由原图宽和指定高构成的剪裁区域。',
  [CropRegion.All]: '指定宽高构成的剪裁区域。'
}

export const cropRegionSVGMap = {
  [CropRegion.Width]: CropRegionWidthIcon,
  [CropRegion.Height]: CropRegionHeightIcon,
  [CropRegion.All]: CropRegionAllIcon
}

export const cropRegionFrontSVGMap = {
  [CropRegion.Width]: CropRegionWidthFrontIcon,
  [CropRegion.Height]: CropRegionHeightFrontIcon,
  [CropRegion.All]: CropRegionAllFrontIcon
}

export const cropRegionBackSVGMap = {
  [CropRegion.Width]: CropRegionWidthBackIcon,
  [CropRegion.Height]: CropRegionHeightBackIcon,
  [CropRegion.All]: CropRegionAllBackIcon
}

export const offsetDirectionTextMap = {
  [OffsetDirection.None]: '不偏移',
  [OffsetDirection.LeftTop]: '左上',
  [OffsetDirection.LeftBottom]: '左下',
  [OffsetDirection.RightTop]: '右上',
  [OffsetDirection.RightBottom]: '右下'
}

export enum WatermarkMode {
  None = 0,
  Picture = 1,
  Word = 2
}

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
  '宋体', '黑体', '楷体', '微软雅黑', 'arial', 'aldhabi', 'andalus',
  'angsana new', 'angsanaupc', 'aparajita', 'arabic typesetting',
  'batang', 'browallia new', 'browalliaupc', 'calibri', 'cambria',
  'candara', 'comic sans ms', 'consolas', 'constantia', 'corbel',
  'cordia new', 'cordiaupc', 'courier new', 'courier', 'daunpenh',
  'david', 'dfkai-sb', 'dilleniaupc', 'dokchampa', 'ebrima',
  'estrangelo edessa', 'eucrosiaupc', 'euphemia', 'fangsong',
  'fixedsys', 'franklin gothic medium', 'frankruehl', 'freesiaupc',
  'gabriola', 'gadugi', 'gautami', 'georgia', 'gisha', 'gulim',
  'impact', 'irisupc', 'iskoola pota', 'jasmineupc', 'kaiti', 'kalinga',
  'kartika', 'khmer ui', 'kodchiangupc', 'kokila', 'lao ui', 'latha',
  'leelawadee', 'levenim mt', 'lilyupc', 'lucida console', 'lucida sans unicode',
  'malgun gothic', 'mangal', 'meiryo', 'microsoft himalaya', 'microsoft jhenghei',
  'microsoft new tai lue', 'microsoft phagspa', 'microsoft sans serif',
  'microsoft tai le', 'microsoft uighur', 'microsoft yahei', 'microsoft yi baiti',
  'mingliu-extb', 'mingliu', 'miriam fixed', 'miriam', 'mongolian baiti',
  'moolboran', 'ms gothic', 'ms mincho', 'ms sans serif', 'ms serif', 'mv boli',
  'myanmar text', 'narkisim', 'nirmala ui', 'nyala', 'palatino linotype',
  'plantagenet cherokee', 'raavi', 'rod', 'sakkal majalla', 'segoe print',
  'segoe script', 'segoe ui symbol', 'segoe ui', 'shonar bangla', 'shruti',
  'simhei', 'simplified arabic fixed', 'simplified arabic', 'simsun-extb',
  'simsun', 'small fonts', 'sylfaen', 'symbol', 'system', 'tahoma', 'terminal',
  'times new roman', 'traditional arabic', 'trebuchet ms', 'tunga',
  'urdu typesetting', 'utsaah', 'vani', 'verdana', 'vijaya', 'vrinda', 'webdings',
  'wingdings'
]

export const rawFormat = ''

export const outputFormats = ['jpg', 'png', 'svg', 'gif', 'bmp', 'tiff', 'webp']

export const colorReg = /^#[A-Fa-f0-9]{6}$/

export const allCommandList = ['imageMogr2', 'imageView2', 'watermark', 'imageslim', 'saveas'] as const

export const commandOrder = {
  imageMogr2: 1,
  imageView2: 1,
  watermark: 2,
  imageslim: 3
}

export const scenarios = [
  {
    name: '缩至完全覆盖指定宽高区域，居中剪裁',
    description: '保持原图宽高比缩小，宽和高缩至完全覆盖指定宽高区域的最小图片，然后居中剪裁。',
    command: 'imageView2/1/w/200/h/200',
    thumbnail: BasicScaleWHCenterIcon
  },
  {
    name: '缩至指定宽高区域内',
    description: '保持原图宽高比缩小，宽和高缩小到指定宽高区域内的最大图片。',
    command: 'imageView2/2/w/200/h/200',
    thumbnail: BasicScaleWHContainIcon
  },
  {
    name: '缩至指定长短边区域内',
    description: '保持原图长短边比例缩小，长边和短边缩小到指定长短边区域内的最大图片。',
    command: 'imageView2/0/w/200/h/200',
    thumbnail: BasicScaleLSContainIcon
  },
  {
    name: '缩至完全覆盖指定宽高区域，居中剪裁 ＋ 转成 jpg 格式',
    description: '保持原图宽高比缩小，宽和高缩至完全覆盖指定宽高区域的最小图片，然后居中裁剪并转成 jpg 格式。',
    command: 'imageView2/1/w/200/h/200/format/jpg',
    thumbnail: CenterCutIcon
  },
  {
    name: '缩放至完全覆盖指定宽高区域 ＋ 裁剪',
    description: '保持原图宽高比，宽和高缩至完全覆盖指定宽高区域的最小图片，然后进行裁剪。',
    command: 'imageMogr2/thumbnail/!640x200r/gravity/Center/crop/300x300',
    thumbnail: AdvancedScaleWHCoverIcon
  },
  {
    name: '缩放至指定宽高区域内 ＋ 转成 webp 格式',
    description: '保持原图宽高比，宽和高缩放到指定宽高区域内的最大图片。然后转成webp格式，体积更小，节省流量。',
    command: 'imageMogr2/thumbnail/640x640/format/webp',
    thumbnail: ScaleWebpIcon
  },
  {
    name: '指定宽高，强行缩放 ＋ 打图片水印',
    description: '指定宽高，强行缩放，图片可能变形。然后打图片水印，宣传品牌价值和版权保护。',
    command: 'imageMogr2/thumbnail/400x400!|watermark/1/image/aHR0cDovLzd4a3YxcS5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS93YXRlcm1hcmsucG5n/dx/10/dy/10',
    thumbnail: WatermarkIcon
  },
  {
    name: '自定义使用场景',
    description: '其他使用场景，按需使用更多图片处理功能。',
    command: 'imageView2/0/q/75',
    thumbnail: CustomIcon
  }
]
