/*
 * @file store of Cert
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { observable, action, computed, reaction } from 'mobx'
import { observeInjectable } from 'qn-fe-core/store'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore } from 'portal-base/common/toaster'
import { RouterStore } from 'portal-base/common/router'
import { Loadings } from 'portal-base/common/loading'
import { CommonApiException } from 'portal-base/common/apis/common'
import Modal from 'react-icecream/lib/modal'
import { SorterResult, SortOrder } from 'react-icecream/lib/table'
import { withQueryParams } from 'qn-fe-core/utils'

import SslApis, { ICertInfo, ISSLCertListReq, IRecommendCert } from '../../../apis/ssl'
import { basename } from '../../../constants/app'
import { ProductShortName, SSLDomainType } from '../../../constants/ssl'
import { isPrivateCert } from '../../../utils/certificate'
import { SSLApplyProps, getCertDomainItemFromSSLDomainType } from '../../SSLApply'
import { OperationName, IOperationInfo } from '../ColumnRenderers'
import { DownloadCertModalStore } from '../DownloadCertModal'
import { createState, getValue } from './Search'

enum LoadingType {
  RenameCert = 'RenameCert',
  DeleteCert = 'DeleteCert',
  FetchCertList = 'FetchCertList',
  FetchRecommendCert = 'FetchRecommendCert'
}

@observeInjectable()
export default class StateStore extends Disposable {
  constructor(
    private toasterStore: ToasterStore,
    private routerStore: RouterStore,
    private sslApis: SslApis
  ) {
    super()
    ToasterStore.bindTo(this, toasterStore)
  }

  @observable certNameEditableMap = observable.map<string, boolean>()
  @observable.shallow certNameEditables: string[] = []
  @observable domainBounded = false
  @observable storageBounded = false
  @observable boundedBucketName = ''

  @observable.ref sslcerts: ICertInfo[] = []
  @observable pageIndex = 1

  @observable.ref searchState = createState()
  @observable.ref searchOptions = getValue(this.searchState)

  @observable.ref sortedInfo?: SorterResult<ICertInfo>

  downloadCertStore = new DownloadCertModalStore(this.toasterStore, this.sslApis)
  loading = Loadings.collectFrom(this, LoadingType)

  @computed get isLoading() {
    return !this.loading.isAllFinished()
  }

  @computed get total() {
    return this.sslcerts.length
  }

  @computed get pagination() {
    return {
      current: this.pageIndex,
      total: this.total,
      onChange: (pageIndex: number) => this.updatePageIndex(pageIndex)
    }
  }

  @computed get notBeforeSortOrder(): false | SortOrder {
    return getColumnSortOrder(this.sortedInfo, 'not_before')
  }

  @computed get notAfterSortOrder(): false | SortOrder {
    return getColumnSortOrder(this.sortedInfo, 'not_after')
  }

  @computed get queryParams(): ISSLCertListReq {
    return {
      ...this.searchOptions,
      beforeAsc: transformSortOrder(this.notBeforeSortOrder),
      afterAsc: transformSortOrder(this.notAfterSortOrder)
    }
  }

  @action updateCerts(certs: ICertInfo[]) {
    this.sslcerts = certs || []
  }

  @action updatePageIndex(pageIndex: number) {
    this.pageIndex = pageIndex
  }

  @action changeEditable(certid: string, val: boolean) {
    this.certNameEditableMap.set(certid, val)
    if (val) {
      if (this.certNameEditables.indexOf(certid) === -1) {
        this.certNameEditables.push(certid)
      }
    } else {
      const editableIdx = this.certNameEditables.findIndex(editablecertid => certid === editablecertid)
      this.certNameEditables.splice(editableIdx, 1)
    }
  }

  @ToasterStore.handle('证书重命名成功！')
  @Loadings.handle(LoadingType.RenameCert)
  @action handleNameChange(_: number, certid: string, value: string) {
    return this.sslApis.renameSSLCert({ id: certid, newName: value }).then(() => {
      this.changeEditable(certid, false)
      return this.fetchCerts(this.queryParams)
    })
  }

  @action handleCancelEdit(certid: string) {
    this.changeEditable(certid, false)
  }

  @action updateDomainBounded(domainBounded: boolean) {
    this.domainBounded = domainBounded
  }

  @action updateStorageBounded(storageBounded: boolean) {
    this.storageBounded = storageBounded
  }

  @action updateBoundedBucketName(bucketName: string) {
    this.boundedBucketName = bucketName
  }

  @action updateSearchOptions() {
    this.searchOptions = getValue(this.searchState)
  }

  @action updateSortedInfo(sorter: SorterResult<ICertInfo>) {
    this.sortedInfo = sorter
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.FetchRecommendCert)
  fetchRecommendCert(certId: string) {
    return this.sslApis.recommendCert({ certId })
  }

  goToPurchase(
    certid: string,
    orderid: string,
    product_short_name: ProductShortName,
    product_type: SSLDomainType
  ): void {
    if (!isPrivateCert(product_short_name)) {
      this.routerStore.push(
        withQueryParams('/certificate/apply',
          {
            ...getPurchaseParams(product_short_name, product_type),
            orderid,
            certid,
            renew: true
          })
      )
      return
    }
    this.fetchRecommendCert(certid)
      .then(recommend => {
        this.routerStore.push(
          withQueryParams('/certificate/apply',
            {
              ...getRecommendParams(recommend),
              orderid,
              certid,
              renew: true
            })
        )
      })
  }

  handleOperation(operationInfo: IOperationInfo) {
    const operation = operationInfo.operation
    switch (operation) {
      case OperationName.Renewal: {
        this.goToPurchase(
          operationInfo.id,
          operationInfo.orderid!,
          operationInfo.productShortName!,
          operationInfo.productType!
        )
        break
      }
      case OperationName.Download: {
        this.downloadCertStore.open(false, operationInfo.id)
        break
      }
      case OperationName.Deploy: {
        this.routerStore.push(`${basename}/deploy/${operationInfo.id}`)
        break
      }
      case OperationName.CertDetail: {
        this.routerStore.push(`${basename}/ssl/detail/${operationInfo.id}/cert`)
        break
      }
      case OperationName.Rename: {
        this.changeEditable(operationInfo.id, true)
        break
      }

      case OperationName.Delete: {
        const certid = operationInfo.id
        Modal.confirm({
          content: '确认删除该证书?',
          onOk: () => this.handleDeleteCert(certid)
        })
        break
      }
      default: break
    }
  }

  @ToasterStore.handle('删除成功！')
  @Loadings.handle(LoadingType.DeleteCert)
  handleDeleteCert(certId: string) {
    return this.sslApis.deleteSSLCert(certId)
      .then(() => this.fetchCerts(this.queryParams))
      .catch(error => {
        if (error instanceof CommonApiException && error.code === 400611) {
          this.updateDomainBounded(true)
          throw error.withMessage('删除失败！')
        }
        if (error instanceof CommonApiException && error.code === 400911) {
          this.updateStorageBounded(true)
          const bucketName = error?.message?.split(':')[1]
          this.updateBoundedBucketName(bucketName!)
          throw error.withMessage('删除失败！')
        }
        throw error
      })
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.FetchCertList)
  fetchCerts(params: ISSLCertListReq): Promise<any> {
    return this.sslApis.fetchRangeSSLCertV2(params).then(res => {
      this.updateCerts(res)
    })
  }

  refreshCerts() {
    this.updatePageIndex(1)
    this.fetchCerts(this.queryParams)
  }

  init() {

    this.addDisposer(reaction(
      () => this.queryParams,
      () => {
        this.fetchCerts(this.queryParams)
      },
      {
        fireImmediately: true
      }
    ))
  }

}

const defaultRecommendQuery: Omit<SSLApplyProps, 'shortName'> & { shortName?: ProductShortName } = {
  years: 1,
  limit: undefined,
  wildcardLimit: undefined,
  shortName: undefined
}

function getRecommendParams({ limit, wildcard_limit, product_short_name, years }: IRecommendCert) {
  if (!product_short_name) {
    return null
  }
  const urlParams = { ...defaultRecommendQuery, shortName: product_short_name, years }
  if (limit !== -1) {
    urlParams.limit = limit + 1
  }
  if (wildcard_limit !== -1 && wildcard_limit !== 0) {
    urlParams.wildcardLimit = wildcard_limit
  }
  return urlParams
}

function getPurchaseParams(product_short_name: ProductShortName, product_type: SSLDomainType) {
  const urlParams = { ...defaultRecommendQuery, shortName: product_short_name }
  const { normal, wildcard } = getCertDomainItemFromSSLDomainType(product_short_name, product_type)!
  switch (product_type) {
    case SSLDomainType.Single:
      urlParams.limit = normal && normal.min != null ? normal.min : 1
      break
    case SSLDomainType.Multiple:
      urlParams.limit = normal && normal.min != null ? normal.min : 2
      break
    case SSLDomainType.Wildcard:
    case SSLDomainType.SingleWildcard:
      urlParams.wildcardLimit = wildcard && wildcard.min != null ? wildcard.min : 1
      break
    case SSLDomainType.MultipleWildcard:
      urlParams.wildcardLimit = wildcard && wildcard.min != null ? wildcard.min : 1
      urlParams.limit = normal && normal.min != null ? normal.min : 1
      break
    default:
      urlParams.limit = normal && normal.min != null ? normal.min : 1
  }
  return urlParams
}

function getColumnSortOrder(sortedInfo: SorterResult<ICertInfo> | undefined, field: string): SortOrder | false {
  if (sortedInfo?.field === field) {
    return sortedInfo.order
  }

  return false
}

function transformSortOrder(sortOrder: SortOrder | false): boolean | undefined {
  if (typeof sortOrder === 'boolean') {
    return undefined
  }

  return sortOrder === 'ascend'
}
