/*
 * @file 日志下载页面
 * @author gaoupon <gaopeng01@qiniu.com>
 */

import React from 'react'
import { action, computed, observable } from 'mobx'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { Iamed } from 'portal-base/user/iam'
import Page from 'portal-base/common/components/Page'
import { useTranslation } from 'portal-base/common/i18n'

import Links from 'cdn/constants/links'
import IamInfo from 'cdn/constants/iam-info'

import OEMDisabled from 'cdn/components/common/OEMDisabled'

import LogApis, { IFilterOptions, ITask, ILog } from 'cdn/apis/log'

import LogFilter from './LogFilter'
import TaskList from './TaskList'
import DownloadModal from './DownloadModal'
import * as messages from './messages'

import './style.less'

export interface ILogManageProps {}

export interface IModalOptions {
  visible: boolean
  logs: ILog[]
}

enum LoadingType {
  LogLoadTasks = 'logLoadTasks'
}

@injectable()
class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  @observable.shallow logs: ITask[] = []
  @observable.ref modalOptions: IModalOptions = {
    visible: false,
    logs: [] as ILog[]
  }

  constructor(
    private toasterStore: Toaster,
    private logApis: LogApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @computed
  get isLoadingLogs() {
    return this.loadings.isLoading(LoadingType.LogLoadTasks)
  }

  @computed
  get taskList() {
    return this.logs ? this.logs.slice() : []
  }

  @action
  setLogs(logs: ITask[]) {
    this.logs = logs
  }

  @action
  setModalOptions(options: IModalOptions) {
    this.modalOptions = options
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.LogLoadTasks)
  onSearch(options: IFilterOptions) {
    return this.logApis.getFusionLogs(options).then(logs => {
      this.setLogs(logs)
    })
  }
}

export default observer(function LogManage() {
  const store = useLocalStore(LocalStore)
  const { iamActions } = useInjection(IamInfo)
  const links = useInjection(Links)
  const t = useTranslation()

  return (
    <Iamed actions={[iamActions.DownloadCDNLog]}>
      <Page className="comp-log-manage-wrapper">
        <div className="notes">
          <p>{t(messages.logSaveTime)}</p>
          <OEMDisabled>
            <p>如果日志文件过大，您可以参见
              <a href={links.downloadLog}
                target="_blank"
                rel="noopener"
              > API 文档下载日志</a>；
            </p>
          </OEMDisabled>
          <p>{t(messages.logFormat)}</p>
        </div>
        <LogFilter
          onSearch={(option: IFilterOptions) => store.onSearch(option)}
          isLoading={store.isLoadingLogs}
        />
        <TaskList
          tasks={store.taskList}
          isLoading={store.isLoadingLogs}
          toggleModal={(options: IModalOptions) => store.setModalOptions(options)}
        />
        <DownloadModal
          {...store.modalOptions}
          toggleModal={(options: IModalOptions) => store.setModalOptions(options)}
        />
      </Page>
    </Iamed>
  )
})
