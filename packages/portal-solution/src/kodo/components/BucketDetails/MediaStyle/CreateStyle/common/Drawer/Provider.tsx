/**
 * @description Media Style Drawer Provider
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { Provider, Provides } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'

import { ImageCommand } from '../../image'
import { VideoCoverCommand } from '../../video/Cover'
import { WatermarkCommand } from '../../video/Watermark'
import { TranscodeCommand } from '../../video/Transcode'

export default function MediaStyleDrawerProvider({ children }: React.PropsWithChildren<{}>) {
  const imageCommand = useLocalStore(ImageCommand)
  const videoCoverCommand = useLocalStore(VideoCoverCommand)
  const watermarkCommand = useLocalStore(WatermarkCommand)
  const transcodeCommand = useLocalStore(TranscodeCommand)

  const provides = React.useMemo<Provides>(() => [
    { identifier: ImageCommand, value: imageCommand },
    { identifier: VideoCoverCommand, value: videoCoverCommand },
    { identifier: WatermarkCommand, value: watermarkCommand },
    { identifier: TranscodeCommand, value: transcodeCommand }
  ], [imageCommand, videoCoverCommand, watermarkCommand, transcodeCommand])

  return (
    <Provider provides={provides}>
      {children}
    </Provider>
  )
}
