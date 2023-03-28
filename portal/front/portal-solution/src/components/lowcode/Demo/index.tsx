import React from 'react'
import { Button } from 'react-icecream'

import { lowcodePath } from 'utils/router'
import { ProjectInfo } from 'components/lowcode/ProjectList/type'

export const Demo: React.FC = () => {
  const onCreateProject = () => {
    const projectInfo: ProjectInfo = {
      name: 'demo-1.0.1',
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
    window.electronBridgeApi.download('demo-1.0.1')
  }

  const onGoToProjectList = () => {
    if (window.top) {
      window.top.location.href = `${lowcodePath}/project/list`
    }
  }
  return (
    <div>
      <Button onClick={onCreateProject}>创建项目</Button>
      <Button onClick={onDownload}>下载项目</Button>
      <Button onClick={onGoToProjectList}>跳到项目列表页</Button>
    </div>
  )
}
