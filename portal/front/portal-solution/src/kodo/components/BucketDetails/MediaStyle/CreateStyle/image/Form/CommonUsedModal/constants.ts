import BasicScaleWHCenterIcon from '../icons/basic-scale-wh-center.svg'
import BasicScaleWHContainIcon from '../icons/basic-scale-wh-contain.svg'
import BasicScaleLSContainIcon from '../icons/basic-scale-ls-contain.svg'
import AdvancedScaleWHCoverIcon from '../icons/advanced-scale-wh-cover.svg'
import CenterCutIcon from '../icons/center-cut.svg'
import ScaleWebpIcon from '../icons/scale-webp.svg'
import WatermarkIcon from '../icons/watermark.svg'
import CustomIcon from '../icons/custom.svg'

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
