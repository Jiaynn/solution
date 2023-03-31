import React, { useState } from 'react'
import { Button } from 'react-icecream'

import { lowcodePath } from 'utils/router'
import { ProjectInfo } from 'components/lowcode/ProjectList/type'
import { isElectron } from 'constants/is'
import { DownloadFileResult, Platform } from 'utils/electron'

const androidUrl = 'https://demo-qnrtc-files.qnsdk.com/solutions/portal/temp/238846d1d03fc84e257ce881610003c20ac13e48c359007ccede1dd41e003cb0/1680057292/droid_qlive_demo.zip'
const iosUrl = 'https://demo-qnrtc-files.qnsdk.com/solutions/portal/code/ios/frameworks.zip'

export const Demo: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const isInIframe = window.top !== window.self

  const createProject = (projectInfo: Partial<ProjectInfo>) => {
    if (isElectron) {
      window.postMessage({
        type: 'createProject',
        data: {
          name: '双十一大促_电商直播_tracecode1',
          description: '这是一段应用描述这是一段应用描述这是一段应用描述这是',
          sceneType: 1,
          appId: 'tracecode1',
          createTime: Date.now(),
          ...projectInfo
        }
      }, window.location.origin)
    }
  }

  const downloadFiles = async (urls: Array<{
    platform: Platform,
    url: string
  }>) => {
    const result: Map<Platform, DownloadFileResult | undefined> = new Map()
    for (const item of urls) {
      try {
        const { platform, url } = item
        // eslint-disable-next-line no-await-in-loop
        const downloadResult = await window.top?.electronBridgeApi.downloadFile(url)
        result.set(platform, downloadResult)
      } catch (e) {
        console.error(e)
      }
    }
    return result
  }

  const onDownload = () => {
    if (isInIframe && isElectron) {
      setLoading(true)
      downloadFiles([
        { platform: 'ios', url: iosUrl },
        { platform: 'android', url: androidUrl }
      ]).then(result => {
        createProject({
          package: {
            android: result.get('android'),
            ios: result.get('ios')
          }
        })
      }).finally(() => setLoading(false))
    }
  }

  const onGoToProjectList = () => {
    if (isInIframe && window.top) {
      window.top.location.href = `${lowcodePath}/project/list`
    }
  }

  return (
    <div>
      <Button onClick={onDownload} loading={loading}>下载项目</Button>
      <Button onClick={onGoToProjectList}>跳到项目列表页</Button>
    </div>
  )
}
