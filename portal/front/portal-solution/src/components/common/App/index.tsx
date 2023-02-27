/**
 * @file component App
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'

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

import { basename } from 'constants/routes'

import { BootProvider } from 'kodo/components/common/BootProvider'
import { sensorsTagFlag, sensorsTrack } from 'kodo/utils/sensors'

import { ApplyRegionModal } from 'kodo/components/common/RegionApply'
import { RefreshCdnModal } from 'kodo/components/common/RefreshCdnModal'
import GuideGroup from 'kodo/components/common/Guide'
import { TaskCenter } from 'kodo/components/common/TaskCenter'
import { ResourceApis } from 'kodo/apis/bucket/resource'
import { taskCenterGuideName, taskCenterSteps } from 'kodo/constants/guide'
import { ImageRouter, ImageSidebar } from 'components/common/App/image'

const Sidebar = observer(() => <ImageSidebar />)

const Root = observer(() => {
  const externalUrlModalStore = useInjection(ExternalUrlModalStore)
  const toasterStore = useInjection(ToasterStore)
  const resourceApis = useInjection(ResourceApis)

  const kodoBaseContextValue: KodoBaseContext = {
    roleWrap: Role,
    sensorsTagFlag,
    sensorsTrack,
    toaster: toasterStore,
    openExternalUrlModal: externalUrlModalStore.open
  }

  return (
    <KodoBaseProvider value={kodoBaseContextValue}>
      <ApplyRegionModal />
      <RefreshCdnModal />
      <FileClipboardProvider>
        <TaskCenterContextProvider>
          <Route path={basename}>
            <Layout>
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
              <ContentLayout mainClassName="main" sidebar={<Sidebar />}>
                <Switch>
                  <Route relative exact title="首页" path="/">
                    <Redirect relative to="/image" />
                  </Route>
                  {ImageRouter}
                </Switch>
              </ContentLayout>
            </Layout>
          </Route>
        </TaskCenterContextProvider>
      </FileClipboardProvider>
    </KodoBaseProvider>
  )
})

export default observer(function App() {
  return (
    <BootProvider>
      <LocalProvider locale={zhCN}>
        <Root />
      </LocalProvider>
    </BootProvider>
  )
})
