/**
 * @description drag component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { debounce } from 'lodash'
import { EditIcon } from 'react-icecream-2/icons'
import { DraggableCore, DraggableEventHandler } from 'react-draggable'

import { useEvent } from 'kodo/hooks'

import { Origin, WatermarkMode } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/constants'

import DimensionModal, { Dimension } from './Modal'

import styles from './style.m.less'

type PositionStyle = Pick<React.CSSProperties, 'transform' | 'top' | 'right' | 'bottom' | 'left'>

function getPosition(origin: Origin, offsetX: number, offsetY: number): PositionStyle {
  switch (origin) {
    case Origin.NorthWest:
      return { transform: 'translate(0, 0)', top: offsetY, left: offsetX }
    case Origin.North:
      return { transform: 'translate(-50%, 0)', top: offsetY, left: `calc(50% + ${offsetX}px)` }
    case Origin.NorthEast:
      return { transform: 'translate(0, 0)', top: offsetY, right: -offsetX }
    case Origin.East:
      return { transform: 'translate(0, -50%)', top: `calc(50% + ${offsetY}px)`, right: -offsetX }
    case Origin.SouthEast:
      return { transform: 'translate(0, 0)', bottom: -offsetY, right: -offsetX }
    case Origin.South:
      return { transform: 'translate(-50%, 0)', bottom: -offsetY, left: `calc(50% + ${offsetX}px)` }
    case Origin.SouthWest:
      return { transform: 'translate(0, 0)', bottom: -offsetY, left: offsetX }
    case Origin.West:
      return { transform: 'translate(0, -50%)', top: `calc(50% + ${offsetY}px)`, left: offsetX }
    case Origin.Center:
      return { transform: 'translate(-50%, -50%)', top: `calc(50% + ${offsetY}px)`, left: `calc(50% + ${offsetX}px)` }
    default:
      return {}
  }
}

type CssCoordinate = {
  offsetLeft: number // 水平方向偏移量
  offsetTop: number // 垂直方向偏移量
  offsetWidth: number // 元素为宽度
  offsetHeight: number // 元素高度
  width: number // 容器宽度
  height: number // 容器高度
}

function transformCoordinate(position: CssCoordinate) {
  const { offsetLeft, offsetTop, offsetWidth, offsetHeight, width, height } = position
  const thirdOfWidth = width / 3
  const thirdOfHeight = height / 3
  const x = offsetLeft < 0 ? 0 : Math.min(Math.floor(offsetLeft / thirdOfWidth), 2)
  const y = offsetTop < 0 ? 0 : Math.min(Math.floor(offsetTop / thirdOfHeight), 2)

  const vectors = [
    [Origin.NorthWest, Origin.North, Origin.NorthEast],
    [Origin.West, Origin.Center, Origin.East],
    [Origin.SouthWest, Origin.South, Origin.SouthEast]
  ]

  const origin2Css = {
    [Origin.NorthWest]: [0, 0], // 原点重合
    [Origin.North]: [width / 2 - offsetWidth / 2, 0], // 原点是 x-axis 向右偏了一半
    [Origin.NorthEast]: [width - offsetWidth, 0],
    [Origin.East]: [width - offsetWidth, height / 2 - offsetHeight / 2],
    [Origin.SouthEast]: [width - offsetWidth, height - offsetHeight],
    [Origin.South]: [width / 2 - offsetWidth / 2, height - offsetHeight],
    [Origin.SouthWest]: [0, height - offsetHeight],
    [Origin.West]: [0, height / 2 - offsetHeight / 2],
    [Origin.Center]: [width / 2 - offsetWidth / 2, height / 2 - offsetHeight / 2]
  } as const

  const origin = vectors[y][x]

  const coordinate = origin2Css[origin]

  return [
    origin,
    Math.floor(offsetLeft - coordinate[0]),
    Math.floor(offsetTop - coordinate[1])
  ] as const
}

// 获取真实 offset -- north, center, south, west, east 都会 translate 偏移
function getActualOffset(node: HTMLElement, origin: Origin) {
  let { offsetLeft, offsetTop } = node
  const { offsetHeight, offsetWidth } = node

  const originsOfTranslateX = [Origin.North, Origin.Center, Origin.South]
  const originsOfTranslateY = [Origin.West, Origin.Center, Origin.East]

  if (originsOfTranslateX.includes(origin)) {
    offsetLeft -= offsetWidth / 2
  }

  if (originsOfTranslateY.includes(origin)) {
    offsetTop -= offsetHeight / 2
  }

  return { offsetLeft, offsetTop }
}

export interface Props {
  bucketName: string
  mode: WatermarkMode
  url: string
  words: string
  fontSize: number
  fontColor: string
  origin: Origin
  offsetX: number
  offsetY: number
  onChange?: (origin: Origin, offsetX: number, offsetY: number) => void
}

const canvasWrapperDimension = {
  width: 440,
  height: 247.5
}

export default function Drag(props: Props) {
  const { url, mode, words, fontSize, fontColor, origin, offsetX, offsetY, onChange } = props

  const [{ width, height }, setDimension] = React.useState<Dimension>({ width: 1280, height: 720 })

  const [visible, setVisible] = React.useState(false)

  const domRef = React.useRef<HTMLDivElement>(null)

  const [offsetInfo, setOffsetInfo] = React.useState({ x: offsetX, y: offsetY })

  const [canvasStyle, canvasScale] = React.useMemo(() => {
    let scale = canvasWrapperDimension.width / width
    const cssProps: React.CSSProperties = {}
    let isWidthStretched = true
    let dimension = { ...canvasWrapperDimension, height: height * scale }
    if (dimension.height > canvasWrapperDimension.height) {
      isWidthStretched = false // 高度撑满了
      scale = canvasWrapperDimension.height / height
      dimension = { ...canvasWrapperDimension, width: width * scale }
    }
    cssProps.transform = `scale(${scale})`
    // 缩小且高度撑满的的时候，需要居中处理
    if (scale < 1) {
      const x = (canvasWrapperDimension.width - dimension.width) / 2
      const translateX = width > canvasWrapperDimension.width && !isWidthStretched ? `translateX(${x}px)` : ''
      cssProps.transform = translateX + cssProps.transform
      cssProps.transformOrigin = width > canvasWrapperDimension.width ? 'left center' : ''
    }

    return [cssProps, scale]
  }, [height, width])

  const styleProps = React.useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      ...getPosition(origin, offsetInfo.x, offsetInfo.y),
      cursor: 'pointer',
      fontSize,
      color: fontColor,
      lineHeight: 1.2
    }),
    [fontColor, fontSize, offsetInfo.x, offsetInfo.y, origin]
  )

  React.useEffect(() => {
    setOffsetInfo({ x: offsetX, y: offsetY })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsetX, offsetY])

  const handleOk = React.useCallback((dimension: Dimension) => {
    setDimension(dimension)
    setVisible(false)
  }, [])

  const unDebounced = useEvent((node: HTMLElement) => {
    const { offsetHeight, offsetWidth } = node
    const { offsetLeft, offsetTop } = getActualOffset(node, origin)
    onChange?.(...transformCoordinate({
      offsetLeft,
      offsetTop,
      offsetHeight,
      offsetWidth,
      width: width - 20,
      height: height - 20
    }))
  })

  const handleChange = React.useMemo(() => debounce(unDebounced, 100), [unDebounced])

  const handleDrag = React.useCallback<DraggableEventHandler>((_, { node, deltaX, deltaY }) => {
    setOffsetInfo(pre => {
      const x = pre.x + deltaX
      const y = pre.y + deltaY
      handleChange(node)
      return { x, y }
    })
  }, [handleChange])

  // eslint-disable-next-line no-nested-ternary
  const contentView = !!words || !!url
    ? (mode === WatermarkMode.Word
      ? <div style={styleProps}>{words}</div>
      : <img style={styleProps} src={url} draggable={false} />)
    : <div></div>

  return (
    <div>
      <div className={styles.canvasWrapper} style={{ ...canvasWrapperDimension }}>
        <div ref={domRef} className={styles.canvas} style={{ width, height, padding: 10, ...canvasStyle }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <DraggableCore scale={canvasScale} grid={[1, 1]} onDrag={handleDrag}>
              {contentView}
            </DraggableCore>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <div>可直接在预览画布上拖拽调整水印位置</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>
            {width}*{height}
          </span>
          <EditIcon className={styles.editIcon} onClick={() => setVisible(true)} />
        </div>
      </div>
      <DimensionModal
        visible={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        height={height}
        width={width}
      />
    </div>
  )
}
