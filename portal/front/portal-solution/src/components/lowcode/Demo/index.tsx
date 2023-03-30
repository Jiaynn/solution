import React, { useState } from 'react'
import { Button } from 'react-icecream'

import { lowcodePath } from 'utils/router'
import { ProjectInfo } from 'components/lowcode/ProjectList/type'
import { isElectron } from 'constants/is'

const androidUrl = 'https://demo-qnrtc-files.qnsdk.com/solutions/portal/temp/238846d1d03fc84e257ce881610003c20ac13e48c359007ccede1dd41e003cb0/1680057292/droid_qlive_demo.zip'
const iosUrl = 'https://demo-qnrtc-files.qnsdk.com/solutions/portal/code/ios/frameworks.zip'

export const Demo: React.FC = () => {
  const [loading1, setLoading1] = useState(false)
  const isInIframe = window.top !== window.self

  const onCreateProject = () => {
    const projectInfo: ProjectInfo = {
      name: '双十一大促_电商直播_tracecode1',
      description: '这是一段应用描述这是一段应用描述这是一段应用描述这是',
      sceneType: 1,
      appId: 'tracecode1',
      createTime: Date.now(),
      package: {
        android: {
          fileName: 'droid_qlive_demo.zip',
          filePath: '/Users/17a/Downloads/droid_qlive_demo.zip'
        },
        ios: {
          fileName: 'frameworks.zip',
          filePath: '/Users/17a/Downloads/frameworks.zip'
        }
      }
    }
    if (isElectron) {
      window.postMessage({
        type: 'createProject',
        data: projectInfo
      }, window.location.origin)
    }
  }

  const downloadFiles = (urls: string[]) => {
    const job = urls[0]
    if (job) {
      setLoading1(true)
      window.top?.electronBridgeApi.downloadFile(job).then(() => {
        setLoading1(false)
        downloadFiles(urls.slice(1))
      })
    }
  }

  const onDownload = () => {
    if (isInIframe && isElectron) {
      const urls = [
        iosUrl,
        androidUrl
      ]
      downloadFiles(urls)
    }
  }

  const onGoToProjectList = () => {
    if (isInIframe && window.top) {
      window.top.location.href = `${lowcodePath}/project/list`
    }
  }

  return (
    <div>
      <Button onClick={onCreateProject}>创建项目</Button>
      <Button onClick={onDownload} loading={loading1}>下载项目</Button>
      <Button onClick={onGoToProjectList}>跳到项目列表页</Button>
    </div>
  )
}
