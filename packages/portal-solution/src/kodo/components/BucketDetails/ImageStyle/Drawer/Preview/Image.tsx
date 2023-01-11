/**
 * @description image component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { UAParser } from 'ua-parser-js'
import { useInjection } from 'qn-fe-core/di'
import { Exception } from 'qn-fe-core/exception'
import { UnexpectedMimeTypeException, HttpException } from 'qn-fe-core/client'
import { Spin } from 'react-icecream/lib'
import { ToasterStore } from 'portal-base/common/toaster'

import { PartialBy } from 'kodo/types/ts'

import { humanizeStorageSize } from 'kodo/transforms/unit'
import { mimeTypeToImageType } from 'kodo/transforms/image-style'

import { hasResponse, ImageInfo, ImageStyleApis } from 'kodo/apis/bucket/image-style'

import styles from './style.m.less'

type Info = PartialBy<ImageInfo, 'width' | 'height'>
export interface Props {
  src: string
  info?: Info
  errInfo?: string
  isLoading: boolean
}

export function useImageStore(src: string) {
  const srcRef = React.useRef(src)
  const toasterStore = useInjection(ToasterStore)
  const imageStyleApis = useInjection(ImageStyleApis)
  const [info, setInfo] = React.useState<Info | undefined>()
  const [errInfo, setErrInfo] = React.useState<string | undefined>(undefined)
  const [isLoading, setLoading] = React.useState(false)

  const refresh = React.useCallback(() => {
    setLoading(true)
    imageStyleApis.getImageInfo(srcRef.current)
      .then(imageInfo => setInfo(imageInfo))
      .catch(e => {
        // 可能 processedUrl + imageInfo 还是图片，当做正常情况，只是没有图片信息
        if (e instanceof UnexpectedMimeTypeException) {
          if (hasResponse(e.detail) && e.detail.response.headers.get('content-length')) {
            const headers = e.detail.response.headers
            const size = Number(headers.get('content-length'))
            const format = mimeTypeToImageType(headers.get('content-type')!)
            setInfo({ format, size })
            setErrInfo(undefined)
          } else {
            setInfo(undefined)
            setErrInfo('未知错误')
          }
          return
        }
        if (e instanceof HttpException) {
          setInfo(undefined)
          setErrInfo(typeof e.payload === 'object' ? JSON.stringify(e.payload) : e.message)
          return
        }
        setErrInfo(e instanceof Exception ? e.message : '未知错误')
        setInfo(undefined)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [imageStyleApis])

  React.useEffect(() => {
    srcRef.current = src
  }, [src])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  React.useEffect(() => {
    if (errInfo) toasterStore.error('预览失败')
  }, [errInfo, toasterStore])

  return {
    info,
    errInfo,
    refresh,
    isLoading
  }
}

export default function Image({ isLoading, errInfo, info, src }: Props) {
  const [browser] = React.useState<string>(() => {
    const parser = new UAParser()
    parser.setUA(window.navigator.userAgent)
    return parser.getResult().browser.name
  })

  const [sizeView, widthHeightView] = React.useMemo(() => [
    info?.size ? humanizeStorageSize(info?.size) : '- KB',
    info?.width ? `${info.width}x${info!.height!}` : '-'
  ], [info])

  let descView: React.ReactNode
  let imgView: React.ReactNode
  if (!info) {
    descView = errInfo
  } else if (info.format === 'psd') {
    descView = <div>psd 格式的图片无法在网页上显示</div>
  } else if (browser !== 'Chrome' && info.format === 'webp') {
    descView = <div>webp 格式的图片无法在网页上显示</div>
  } else if ((browser !== 'Safari' && browser !== 'Edge') && info.format === 'tiff') {
    descView = <div>tiff 格式的图片无法在网页上显示</div>
  } else {
    imgView = <img src={src} />
    descView = <div>（大小: {sizeView}，宽高：{widthHeightView} PX）</div>
  }

  if (!src) {
    descView = '未配置预览 url'
  }

  return (
    <Spin spinning={isLoading}>
      <div className={styles.imagePreview}>
        {imgView}
        <div className={styles.desc}>
          {descView}
        </div>
      </div>
    </Spin>
  )
}
