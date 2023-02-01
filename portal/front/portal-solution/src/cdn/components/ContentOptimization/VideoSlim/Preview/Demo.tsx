/**
 * @desc component for 视频瘦身 Demo 预览
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React, { useEffect } from 'react'
import { useLocalStore } from 'portal-base/common/utils/store'

import { IVideoSlimTask } from 'cdn/apis/video-slim'
import { VideoSlimPreviewInner, LocalStore } from '.'

// Demo 资源参考：https://jira.qiniu.io/browse/FUSION-17210
export default function VideoSlimPreviewDemo() {
  const store = useLocalStore(LocalStore)

  useEffect(() => {
    store.updateTask({
      afterBr: 3182000,
      afterDef: 'hd',
      afterDur: 60,
      afterSize: 23889110,
      avType: 'mp4',
      newUrl: 'https://rmeftyw0c.bkt.clouddn.com/ruizhishidai.mp4',
      originBr: 4667000,
      originDef: 'hd',
      originDur: 60,
      originSize: 35033425,
      resource: 'https://rmeftyw0c.bkt.clouddn.com/shidaidemo.mp4'
    } as any as IVideoSlimTask)
  }, [store])

  return <VideoSlimPreviewInner store={store} />
}
