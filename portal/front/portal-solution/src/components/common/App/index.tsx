/**
 * @file component App
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { Route, Redirect, Switch } from 'portal-base/common/router'
import Layout, { ContentLayout } from 'portal-base/common/components/Layout'
import { FileClipboardProvider } from 'kodo-base/lib/context/file-clipboard'
import { TaskCenterContextProvider } from 'kodo-base/lib/components/TaskCenter'
import LocalProvider from 'react-icecream/lib/locale-provider'
import zhCN from 'react-icecream/lib/locale-provider/zh_CN'
import { useInjection } from 'qn-fe-core/di'
import { ExternalUrlModalStore } from 'kodo-base/lib/components/common/ExternalUrlModal/store'
import { KodoBaseProvider, KodoBaseContext } from 'kodo-base/lib/context'
import Role from 'portal-base/common/components/Role'
import { ToasterStore } from 'portal-base/common/toaster'
import ExternalUrlModal from 'kodo-base/lib/components/common/ExternalUrlModal'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import { useLocation } from 'react-use'

import { basename } from 'constants/routes'
import { BootProvider } from 'kodo/components/common/BootProvider'
import { sensorsTagFlag, sensorsTrack } from 'kodo/utils/sensors'
import { ApplyRegionModal } from 'kodo/components/common/RegionApply'
import { RefreshCdnModal } from 'kodo/components/common/RefreshCdnModal'
import GuideGroup from 'kodo/components/common/Guide'
import { TaskCenter } from 'kodo/components/common/TaskCenter'
import { ResourceApis } from 'kodo/apis/bucket/resource'
import { taskCenterGuideName, taskCenterSteps } from 'kodo/constants/guide'
import { imageBasename, ImageRouter, ImageSidebar } from 'components/common/App/image'
import { MessageRouter, MessageSidebar } from './message'
import { LowcodeRouter } from 'components/common/App/lowcode'
import { imagePath, messagePath } from 'utils/router'

const AppContainer = observer(() => {
  const externalUrlModalStore = useInjection(ExternalUrlModalStore)
  const toasterStore = useInjection(ToasterStore)
  const resourceApis = useInjection(ResourceApis)
  const location = useLocation()
  const pathname = location.pathname || ''

  const kodoBaseContextValue: KodoBaseContext = {
    roleWrap: Role,
    sensorsTagFlag,
    sensorsTrack,
    toaster: toasterStore,
    openExternalUrlModal: externalUrlModalStore.open
  }

  const noNavbarPaths: RegExp[] = [/^\/solutions\/lowcode/]
  const noSidebarPaths: RegExp[] = [/^\/solutions\/lowcode\/welcome/]
  const noNavbar = noNavbarPaths.some(path => path.test(pathname))
  const noSidebar = noSidebarPaths.some(path => path.test(pathname))
  const isLowcode = pathname.startsWith('/solutions/lowcode/')

  const renderSidebar = () => {
    if (pathname.startsWith(imagePath)) {
      return <ImageSidebar />
    }
    if (pathname.startsWith(messagePath)) {
      return <MessageSidebar />
    }
    return null
  }

  return (
    <KodoBaseProvider value={kodoBaseContextValue}>
      <ApplyRegionModal />
      <RefreshCdnModal />
      <FileClipboardProvider>
        <TaskCenterContextProvider>
          <Route path={basename}>
            <Layout
              className={classNames({
                'layout-no-sidebar': noSidebar,
                'layout-no-navbar': noNavbar,
                'layout-lowcode': isLowcode
              })}
            >
              <ExternalUrlModal
                visible={externalUrlModalStore.visible}
                objects={externalUrlModalStore.objects!}
                title={externalUrlModalStore.title}
                domain={externalUrlModalStore.domain!}
                onCancel={externalUrlModalStore.handleClose}
                getSignedDownloadUrls={resourceApis.getSignedDownloadUrls}
                isPrivateBucket={!!externalUrlModalStore.isPrivateBucket}
                mediaStyleConfig={externalUrlModalStore.mediaStyleConfig}
              />
              <GuideGroup name={taskCenterGuideName} steps={taskCenterSteps}>
                <TaskCenter />
              </GuideGroup>
              <ContentLayout
                mainClassName={classNames('content-layout-main', {
                  'content-layout-main-lowcode': isLowcode
                })}
                sidebar={renderSidebar()}
              >
                <Switch>
                  <Route relative exact title="首页" path="/">
                    <Redirect relative to={imageBasename} />
                  </Route>
                  {ImageRouter}
                  {MessageRouter}
                  {LowcodeRouter}
                </Switch>
              </ContentLayout>
            </Layout>
          </Route>
        </TaskCenterContextProvider>
      </FileClipboardProvider>
    </KodoBaseProvider>
  )
})

const App = () => <BootProvider>
  <LocalProvider locale={zhCN}>
    <AppContainer />
  </LocalProvider>
</BootProvider>

export default App
