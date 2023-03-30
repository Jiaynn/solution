import { useEffect } from 'react'

import { ProjectInfo } from 'components/lowcode/ProjectList/type'

export const useWindowMessage = () => {
  const messageHandler = (event: MessageEvent<{
    type: 'createProject',
    data: ProjectInfo
  }>) => {
    const { data } = event
    if (
      typeof data === 'object' && data !== null
      && data.type === 'createProject'
    ) {
      const { data: projectInfo } = data
      const projectList = JSON.parse(window.localStorage.getItem('projectList') || '[]')
      window.localStorage.setItem('projectList', JSON.stringify(
        [...projectList, projectInfo]
      ))
    }
  }

  useEffect(() => {
    window.addEventListener('message', messageHandler)
    return () => {
      window.removeEventListener('message', messageHandler)
    }
  }, [])
}
