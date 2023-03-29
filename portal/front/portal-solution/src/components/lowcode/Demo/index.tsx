import React, { useState } from 'react'
import { Button } from 'react-icecream'

import { lowcodePath } from 'utils/router'
import { ProjectInfo } from 'components/lowcode/ProjectList/type'

export const Demo: React.FC = () => {
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const pName = 'droid_qlive_demo'

  const onCreateProject = () => {
    const projectInfo: ProjectInfo = {
      name: pName,
      description: '双十一大促_电商直播_tracecode1',
      sceneType: 1,
      appId: 'tracecode1',
      createTime: Date.now(),
      platform: ['Android', 'iOS']
    }
    window.postMessage({
      type: 'createProject',
      data: projectInfo
    }, window.location.origin)
  }

  const onDownload = () => {
    window.top?.electronBridgeApi.getDownloadStatus((_, result) => {
      if (result.code === 0) {
        setLoading1(true)
      }
      if (result.code === 1) {
        setLoading1(false)
      }
    })

    const a = document.createElement('a')
    a.href = 'https://demo-qnrtc-files.qnsdk.com/solutions/portal/temp/1c90840b9344484c8c1e1398724f67efc281772a5fd62171b86795532289fc89/1680005098/droid_qlive_demo.zip'
    a.download = 'droid_qlive_demo'
    a.click()
  }

  const onUnzip = () => {
    window.top?.electronBridgeApi.getDownloadsPath().then(downloadsPath => {
      setLoading2(true)
      window.top?.electronBridgeApi.unzip(
        pName,
        downloadsPath,
        '.zip'
      ).then(result => {
        console.log('unzip success', result)
      }).catch(error => {
        console.log('unzip fail', error)
      }).finally(() => {
        setLoading2(false)
      })
    })
  }

  const onGoToProjectList = () => {
    if (window.top) {
      window.top.location.href = `${lowcodePath}/project/list`
    }
  }

  return (
    <div>
      <Button onClick={onCreateProject}>创建项目</Button>
      <Button onClick={onDownload} loading={loading1}>下载项目</Button>
      <Button onClick={onUnzip} loading={loading2}>解压项目</Button>
      <Button onClick={onGoToProjectList}>跳到项目列表页</Button>
    </div>
  )
}
