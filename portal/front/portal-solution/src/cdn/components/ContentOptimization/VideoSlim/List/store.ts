/**
 * @desc store for 视频瘦身
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import { computed, observable, action, reaction } from 'mobx'
import { isEmpty } from 'lodash'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { humanizeOnoff } from 'cdn/transforms'

import { ModalStore } from 'cdn/stores/modal'

import VideoSlimApis from 'cdn/apis/video-slim'
import DomainApis, { IDomainDetail } from 'cdn/apis/domain'

import { CollectionStore } from '../collectionStore'
import { handleOperationResult } from '../CreateModal/store'

export interface IProps {
  domain: string
}

enum Loading {
  FetchDomainDetail = 'FetchDomainDetail',
  ToggleCdnAutoEnable = 'ToggleCdnAutoEnable',
  Enable = 'Enable',
  Disable = 'Disable',
  Delete = 'Delete'
}

@injectable()
export class LocalStore extends Store {
  loadings = new Loadings()

  // 查询条件 & 结果
  collectionStore = new CollectionStore(this.videoSlimApis, () => ({ domains: [this.props.domain] }))

  constructor(
    @injectProps() private props: IProps,
    private domainAPis: DomainApis,
    private toasterStore: ToasterStore,
    private videoSlimApis: VideoSlimApis
  ) {
    super()
  }

  @computed get hasSelected() {
    return this.collectionStore.selectedStore.list.length > 0
  }

  @computed get isDomainLoading() {
    return this.loadings.isLoading(Loading.FetchDomainDetail)
  }

  // 添加瘦身任务
  createModalStore = new ModalStore<{ domain: string, domainBucketName?: string }>()

  @observable.ref filterOptionsForTable?: Record<string, any>

  @action updateFilterOptions(filters: Record<string, any>) {
    this.filterOptionsForTable = filters
    const options = (
      !isEmpty(filters)
      ? { state: filters.state || [] } // 状态筛选为多选
      : {}
    )
    this.collectionStore.queryStore.updateFilterOptions(options)
  }

  @ToasterStore.handle()
  toggleCdnAutoEnable(cdnAutoEnable: boolean, ids: string[]) {
    return this.loadings.promise(
      Loading.ToggleCdnAutoEnable,
      this.videoSlimApis.cdnAutoEnableVideoSlimTask(cdnAutoEnable, ids)
    ).then(
      result => handleOperationResult(this.toasterStore, result, `${humanizeOnoff(cdnAutoEnable)}自动启用设置`)
    )
  }

  @ToasterStore.handle()
  enableTask(ids: string[]) {
    return this.loadings.promise(
      Loading.ToggleCdnAutoEnable,
      this.videoSlimApis.enableVideoSlimTask(ids)
    ).then(
      result => handleOperationResult(this.toasterStore, result, '启用')
    )
  }

  @ToasterStore.handle()
  disableTask(ids: string[]) {
    return this.loadings.promise(
      Loading.ToggleCdnAutoEnable,
      this.videoSlimApis.disableVideoSlimTask(ids)
    ).then(
      result => handleOperationResult(this.toasterStore, result, '停用')
    )
  }

  @ToasterStore.handle()
  deleteTask(ids: string[]) {
    return this.loadings.promise(
      Loading.ToggleCdnAutoEnable,
      this.videoSlimApis.deleteVideoSlimTask(ids)
    ).then(
      result => handleOperationResult(this.toasterStore, result, '删除')
    )
  }

  @observable.ref domainInfo?: IDomainDetail

  @action updateDomainInfo(info: IDomainDetail) {
    this.domainInfo = info
  }

  fetchDomainDetail(name: string) {
    const req = this.domainAPis.getDomainDetail(name).then(
      domain => this.updateDomainInfo(domain)
    )
    return this.loadings.promise(Loading.FetchDomainDetail, req)
  }

  init() {
    this.addDisposer(this.collectionStore.dispose)
    // 域名变化时，发起查询
    this.addDisposer(reaction(
      () => this.props.domain,
      domain => {
        if (!domain) {
          return
        }
        this.fetchDomainDetail(domain)
        this.collectionStore.fetchList()
      },
      { fireImmediately: true }
    ))
  }
}
