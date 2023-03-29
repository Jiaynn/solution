import SubSidebar, { LinkItem } from 'portal-base/common/components/SubSidebar'
import React, { useEffect } from 'react'
import { Redirect, Route, Switch } from 'portal-base/common/router'
import { SVGIcon } from 'portal-base/common/utils/svg'
import { To } from 'qn-fe-core/router'

import { isElectron } from 'constants/is'
import { basenameMap, nameMap, Solution } from 'constants/solutions'
import { LowcodeWelcome } from 'components/lowcode/Welcome'
import { LowcodeProjectList } from 'components/lowcode/ProjectList'
import { LowcodeSchemeList } from 'components/lowcode/SchemeList'
import { LowcodeHeader } from 'components/lowcode/common/Header'
import { LowcodePrompt } from 'components/lowcode/Prompt'
import { Demo } from 'components/lowcode/Demo'
import { ProjectInfo } from 'components/lowcode/ProjectList/type'

import IconScene from './static/icon-scene.svg'
import IconApp from './static/icon-app.svg'
import IconDeveloperCommunity from './static/icon-developer-community.svg'
import IconDocumentCenter from './static/icon-document-center.svg'

import './index.less'
import { LowcodeIframe } from 'components/lowcode/common/Iframe'

const title = nameMap[Solution.Lowcode]

export const lowcodeBasename = basenameMap[Solution.Lowcode]

const prefixCls = 'lowcode-main'

const links: Array<{
  icon: string
  title: string
  to: To
  visible: boolean
}> = [
  {
    icon: IconScene,
    title: '场景解决方案',
    to: '/scene',
    visible: true
  },
  {
    icon: IconApp,
    title: '应用管理',
    to: '/project',
    visible: isElectron
  },
  {
    icon: IconDeveloperCommunity,
    title: '开发者社区',
    to: '/developer-community',
    visible: true
  },
  {
    icon: IconDocumentCenter,
    title: '文档中心',
    to: '/document-center',
    visible: true
  }
]

export const LowcodeSidebar = () => <SubSidebar className="lowcode-sub-sidebar" title={title}>
  {
    links.map(item => {
      if (item.visible) {
        return (
          <LinkItem className="context" key={JSON.stringify(item.to)} to={item.to} relative>
            <SVGIcon className="icon" src={item.icon} />
            <span className="title">{item.title}</span>
          </LinkItem>
        )
      }
      return null
    })
  }
</SubSidebar>

const LowcodeRouterComponent = () => {

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

  return (
    <Switch>
      <Route exact relative title={title} path="/">
        {
        isElectron ? <Redirect relative to="/welcome" /> : <Redirect relative to="/scene" />
        }
      </Route>
      <Route exact relative title="七牛低代码平台" path="/welcome">
        <LowcodeWelcome />
      </Route>
      <Route exact relative title="七牛低代码平台" path="/prompt">
        <LowcodePrompt />
      </Route>
      <Route exact relative title="七牛低代码平台" path="/demo">
        <Demo />
      </Route>
      <Route relative title="七牛低代码平台" path="/">
        <div className={prefixCls}>
          <LowcodeSidebar />
          <div className={`${prefixCls}-right`}>
            <LowcodeHeader className={`${prefixCls}-right-header`} />
            <div className={`${prefixCls}-right-content`}>
              <div className={`${prefixCls}-right-content-main`}>
                <Switch>
                  <Route exact relative path="/">
                    <Redirect relative to="/scene" />
                  </Route>
                  <Route relative path="/scene">
                    <Switch>
                      <Route exact relative path="/">
                        <Redirect relative to="/list" />
                      </Route>
                      <Route relative path="/list">
                        <LowcodeSchemeList />
                      </Route>
                      <Route
                        relative
                        path="/detail"
                        component={({ query }) => {
                          const url = query.url as string
                          return <LowcodeIframe key={url} url={url} isAdaptive />
                        }}
                      />
                      <Route
                        relative
                        path="/iframe"
                        component={({ query }) => {
                          const url = query.url as string
                          return <LowcodeIframe key={url} url={url} isAdaptive />
                        }}
                      />
                    </Switch>
                  </Route>

                  {
                    isElectron && <Route relative path="/project">
                      <Switch>
                        <Route exact relative path="/">
                          <Redirect relative to="/list" />
                        </Route>
                        <Route relative path="/list">
                          <LowcodeProjectList />
                        </Route>
                      </Switch>
                    </Route>
                  }

                  <Route
                    relative
                    path="/developer-community"
                  >
                    <LowcodeIframe key="/developer-community" url="https://segmentfault.com/site/qiniu" isAdaptive={false} width="100%" height="100%" />
                  </Route>
                  <Route
                    relative
                    path="/document-center"
                  >
                    <LowcodeIframe key="/document-center" url="https://developer.qiniu.com/lowcode" isAdaptive width="100%" height="100%" />
                  </Route>
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </Route>
    </Switch>
  )
}

export const LowcodeRouter = (
  <Route relative title={title} path={lowcodeBasename}>
    <LowcodeRouterComponent />
  </Route>
)
