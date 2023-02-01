/*
 * @file 刷新预取页面
 * @author gaoupon <gaopeng01@qiniu.com>
 */

import React from 'react'
import { action, computed, observable } from 'mobx'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { useQuery } from 'qn-fe-core/router'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { RouterStore } from 'portal-base/common/router'
import { Loadings } from 'portal-base/common/loading'
import { Iamed } from 'portal-base/user/iam'
import { I18nStore, useTranslation } from 'portal-base/common/i18n'
import Page from 'portal-base/common/components/Page'
import { withQueryParams } from 'qn-fe-core/utils'

import { Tabs, TabPane, Loading, Alert } from 'react-icecream-2'

import { validateUrls, validateDirs } from 'cdn/transforms/refresh-prefetch'

import AbilityConfig from 'cdn/constants/ability-config'
import IamInfo from 'cdn/constants/iam-info'
import { defaultSurplusInfo, TabUrl, tabUrlValues } from 'cdn/constants/refresh-prefetch'

import RefreshPrefetchApis, { ISurplusInfo } from 'cdn/apis/refresh-prefetch'

import RPTextarea from './RPTextarea'
import RPLog from './RPLog'
import * as messages from './messages'

import './style.less'

enum LoadingType {
  LoadSurlusInfo = 'loadSurlusInfo',
  LoadRefreshDirStatus = 'loadRefreshDirStatus',
  SubmitRefreshUrl = 'submitRefreshUrl',
  SubmitRefreshDir = 'submitRefreshDir',
  SubmitPrefetchUrl = 'submitPrefetchUrl'
}

@injectable()
export class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  @observable.ref surplusInfo: ISurplusInfo = defaultSurplusInfo
  @observable refreshDirStatus = false

  constructor(
    private toasterStore: Toaster,
    private refreshPrefetchApis: RefreshPrefetchApis,
    private i18n: I18nStore,
    private routerStore: RouterStore
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @computed
  get isLoadingSurplus(): boolean {
    return this.loadings.isLoading(LoadingType.LoadSurlusInfo)
  }

  @computed
  get isLoadingDirStatus(): boolean {
    return this.loadings.isLoading(LoadingType.LoadRefreshDirStatus)
  }

  @action updateTabUrl(tabUrlValue: TabUrl) {
    if (this.routerStore.location?.pathname) {
      this.routerStore.replace(withQueryParams(this.routerStore.location.pathname, { tab: tabUrlValue }))
    }
  }

  @action
  updateSurplusInfo(surlusInfo: ISurplusInfo) {
    this.surplusInfo = surlusInfo
  }

  @action
  updateRefreshDirStatus(status: string) {
    this.refreshDirStatus = status === 'enable'
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.LoadSurlusInfo)
  fetchSurplusInfo() {
    return this.refreshPrefetchApis.getSurplus().then((surlusInfo: ISurplusInfo) => {
      this.updateSurplusInfo(surlusInfo)
    })
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.LoadRefreshDirStatus)
  fetchRefreshDirStatus() {
    return this.refreshPrefetchApis.getRefreshDirStatus().then((status: string) => {
      this.updateRefreshDirStatus(status)
    })
  }

  @Toaster.handle(messages.toast.refreshCompleted)
  @Loadings.handle(LoadingType.SubmitRefreshUrl)
  submitRefreshUrl(values: string[]) {
    const invalidMsg = validateUrls(values)
    if (invalidMsg) {
      return Promise.reject(this.i18n.t(invalidMsg))
    }
    return this.refreshPrefetchApis.refresh({ urls: values }).then(() => {
      this.fetchSurplusInfo()
    })
  }

  @Toaster.handle(messages.toast.refreshCompleted)
  @Loadings.handle(LoadingType.SubmitRefreshDir)
  submitRefreshDir(values: string[]) {
    const invalidMsg = validateDirs(values)
    if (invalidMsg) {
      return Promise.reject(this.i18n.t(invalidMsg))
    }
    const req = this.refreshPrefetchApis.refresh({ dirs: values }).then(() => {
      this.fetchSurplusInfo()
    })
    return this.loadings.promise('submit.refresh.dir', req)
  }

  @Toaster.handle(messages.toast.prefetchCompleted)
  @Loadings.handle(LoadingType.SubmitPrefetchUrl)
  submitPrefetchUrl(values: string[]) {
    const invalidMsg = validateUrls(values)
    if (invalidMsg) {
      return Promise.reject(this.i18n.t(invalidMsg))
    }
    return this.refreshPrefetchApis.prefetch({ urls: values }).then(() => {
      this.fetchSurplusInfo()
    })
  }

  init() {
    this.fetchSurplusInfo()
    this.fetchRefreshDirStatus()
  }
}

export default observer(function _RefreshPrefetch() {
  const store = useLocalStore(LocalStore)
  const { iamActions } = useInjection(IamInfo)
  const abilityConfig = useInjection(AbilityConfig)
  const query = useQuery()

  const handleTabUrl = (tabDefaultValue: TabUrl) => {
    store.updateTabUrl(tabDefaultValue)
  }
  let tabDefaultValue = TabUrl.RefreshUrl
  if (query.tab) {
    if (tabUrlValues.includes(query.tab as TabUrl)) {
      tabDefaultValue = query.tab as TabUrl
    }
  }
  const t = useTranslation()

  return (
    <Page className="comp-refresh-prefetch-wrapper">
      <Loading loading={store.isLoadingSurplus || store.isLoadingDirStatus}>
        <div className="notes">
          {
            t(messages.quotaNote, {
              urlQuotaDay: store.surplusInfo.urlQuotaDay,
              refreshDirStatus: store.refreshDirStatus,
              dirQuotaDay: store.surplusInfo.dirQuotaDay,
              quotaDay: store.surplusInfo.quotaDay
            })
          }
          {t(messages.urlFormat)}
        </div>
        <Iamed
          actions={[iamActions.Refresh, iamActions.Prefetch]}
          component={({ shouldDeny, getShouldDeny }) => {
            const refreshUrlTabPane = (
              <TabPane name={t(messages.refreshUrl)} value={TabUrl.RefreshUrl}>
                <WarningAlert
                  message={t(messages.refreshUrlAlert, getPositiveNumber(store.surplusInfo.urlSurplusDay))}
                />
                <RPTextarea
                  placeholder={t(messages.refreshUrlPlaceholder)}
                  submitBtnText={t(messages.refresh)}
                  handleSubmit={(values: string[]) => store.submitRefreshUrl(values)}
                />
              </TabPane>
            )
            const refreshDirTabPane = (
              store.refreshDirStatus
              && (
                <TabPane name={t(messages.refreshDir)} value={TabUrl.RefreshDir}>
                  <WarningAlert
                    message={t(messages.refreshDirAlert, getPositiveNumber(store.surplusInfo.dirSurplusDay))}
                  />
                  <RPTextarea
                    placeholder={t(messages.refreshDirPlaceholder)}
                    submitBtnText={t(messages.refresh)}
                    handleSubmit={(values: string[]) => store.submitRefreshDir(values)}
                  />
                </TabPane>
              )
            )
            const prefetchUrlTabPane = (
              <TabPane name={t(messages.prefetchUrl)} value={TabUrl.PrefetchUrl}>
                <WarningAlert
                  message={
                    t(
                      messages.prefetchUrlAlert,
                      abilityConfig.productName,
                      getPositiveNumber(store.surplusInfo.surplusDay)
                    )
                  }
                />
                <RPTextarea
                  placeholder={t(messages.prefetchUrlPlaceholder)}
                  submitBtnText={t(messages.prefetch)}
                  handleSubmit={(values: string[]) => store.submitPrefetchUrl(values)}
                />
              </TabPane>
            )
            const rpLogTabPane = (
              <TabPane name={t(messages.opLogs)} value={TabUrl.ShowLogs}>
                <RPLog />
              </TabPane>
            )
            if (shouldDeny) {
              return (
                <Tabs defaultValue={TabUrl.ShowLogs}>{rpLogTabPane}</Tabs>
              )
            }
            return (
              <Tabs<TabUrl> defaultValue={tabDefaultValue} onChange={handleTabUrl}>
                { !getShouldDeny(iamActions.Refresh) ? refreshUrlTabPane : null }
                { !getShouldDeny(iamActions.Refresh) ? refreshDirTabPane : null }
                { !getShouldDeny(iamActions.Prefetch) ? prefetchUrlTabPane : null }
                { rpLogTabPane }
              </Tabs>
            )
          }} />
      </Loading>
    </Page>
  )
})

function WarningAlert(props: { message: string }) {
  return (
    <Alert
      icon
      type="warning"
      className="alert"
      message={props.message} />
  )
}

export function getPositiveNumber(rawNumber: number) {
  return rawNumber && rawNumber > 0 ? rawNumber : 0
}
