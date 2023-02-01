/**
 * @file Guide 遮罩层组件，支持指定高亮区域
 * @author nighca <nighca@live.cn>
 */

import { values } from 'lodash'
import * as React from 'react'

import style from './style.m.less'

export interface IRectWithRadius {
  top: number
  left: number
  width: number
  height: number
  radius: number
}

export interface IProps {
  /** 高亮区域信息 */
  highlight: IRectWithRadius
}

export default function Mask({ highlight }: IProps) {
  const size = useWindowSize()
  const canvasRef = React.useCallback((canvas: HTMLCanvasElement) => {
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    ctx!.save() // 保存当前状态，操作完后会 restore
    ctx!.clearRect(0, 0, size.width, size.height) // 清除画布
    // 绘制半透明的底色
    ctx!.fillStyle = 'rgba(1, 30, 40, 0.65)'
    ctx!.fillRect(0, 0, size.width, size.height)
    // 抠掉中间的圆角矩形
    clearRectWithRadius(ctx!, highlight)
    ctx!.restore() // 恢复状态
  }, [...values(highlight), size]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!size) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className={style.guideMaskCanvas}
      width={size.width}
      height={size.height}
    ></canvas>
  )
}

interface ISize {
  width: number
  height: number
}

function getWindowSize() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight
  }
}

function useWindowSize(): ISize {
  const [size, updateSize] = React.useState<ISize>(getWindowSize())
  const update = () => updateSize(getWindowSize())

  React.useEffect(() => {
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

function clearRectWithRadius(
  ctx: CanvasRenderingContext2D,
  { left, top, width, height, radius }: IRectWithRadius
) {
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()

  // 左上圆角
  ctx.arc(left + radius, top + radius, radius, Math.PI, Math.PI * 1.5, false)
  // 上边
  ctx.lineTo(left + width - radius, top)
  // 右上圆角
  ctx.arc(left + width - radius, top + radius, radius, Math.PI * 1.5, 0, false)
  // 右边
  ctx.lineTo(left + width, top + height - radius)
  // 右下圆角
  ctx.arc(left + width - radius, top + height - radius, radius, 0, Math.PI * 0.5, false)
  // 下边
  ctx.lineTo(left + radius, top + height)
  // 左下圆角
  ctx.arc(left + radius, top + height - radius, radius, Math.PI * 0.5, Math.PI, false)
  // 左边，其实可以省略
  ctx.lineTo(left, top + radius)

  ctx.closePath()
  ctx.fillStyle = '#fff'
  ctx.fill()
}
