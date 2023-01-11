/*
 * @file store Deploy
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { observable, action, computed, autorun, reaction } from 'mobx'
import { uniq, differenceBy, concat } from 'lodash'

import { observeInjectable } from 'qn-fe-core/store'
import { injectProps } from 'qn-fe-core/local-store'
import { UnknownException } from 'qn-fe-core/exception'
import Disposable from 'qn-fe-core/disposable'
import Modal from 'react-icecream/lib/modal'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { SslClient, ICertInfo } from 'portal-base/certificate'

import DomainApis, { ISearchDomainOptions, IDeployDomain, IDeployResult } from '../../apis/domain'
import { CertExpireSort, Protocol } from '../../constants/domain'
import { IDeployProps } from '.'

enum LoadingType {
  GetCert = 'GetCert',
  GetDomains = 'GetDomains',
  Deploy = 'Deploy'
}

@observeInjectable()
export default class DeployStore extends Disposable {
  constructor(
    @injectProps() private props: IDeployProps,
    toasterStore: ToasterStore,
    private sslClient: SslClient,
    private domainApis: DomainApis
  ) {
    super()
    ToasterStore.bindTo(this, toasterStore)
  }

  loadings = Loadings.collectFrom(this, LoadingType)

  @observable pageSize = 10
  @observable pageIndex = 1
  @observable total = 0
  @observable isCurrentCert?: boolean
  @observable expireSort?: CertExpireSort

  @observable.ref cert!: ICertInfo
  @observable.ref domains: IDeployDomain[] = []
  @observable.ref selectedDomains: IDeployDomain[] = []

  @action updatePageIndex(pageIndex: number) {
    this.pageIndex = pageIndex
  }

  @action updatePageSize(pageSize: number) {
    this.pageSize = pageSize
  }

  @action updateIsCurrentCert(isCurrent?: boolean) {
    this.isCurrentCert = isCurrent
  }

  @action updateExpireSort(sort: CertExpireSort) {
    this.expireSort = sort
  }

  @action updateCert(cert: ICertInfo) {
    this.cert = cert
  }

  @action updateDomainsAndTotal(domains: IDeployDomain[], total: number) {
    this.domains = domains || []
    this.total = total
  }

  @action updateSelectedDomains(domains: IDeployDomain[]) {
    // 切换 filter 的时候，留住选中项中已经不符合当前 filter 的那些项；切换 page 时，留住之前选中的项
    const originDomains = differenceBy(this.selectedDomains || [], this.domains, 'domainName')
    this.selectedDomains = concat(originDomains, domains)
  }

  @action resetSelectedDomains() {
    this.selectedDomains = []
  }

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @computed get searchDomainOptions(): ISearchDomainOptions {
    return {
      from: (this.pageIndex - 1) * this.pageSize,
      size: this.pageSize,
      currentCertId: this.cert && this.cert.certid,
      currentOrderId: this.cert && this.cert.orderid,
      currentCertNames: this.cert ? uniq([this.cert.common_name, ...(this.cert.dnsnames || [])]) : [],
      currentCertFilter: this.isCurrentCert,
      certExpiredSort: this.expireSort || CertExpireSort.Asc
    }
  }

  @computed get pagination() {
    return {
      showSizeChanger: true,
      showQuickJumper: true,
      onShowSizeChange: (pageIdx: number, size: number) => {
        this.updatePageSize(size)
        this.updatePageIndex(pageIdx)
      },
      current: this.pageIndex,
      total: this.total,
      onChange: (pageIdx: number) => this.updatePageIndex(pageIdx)
    }
  }

  @computed get selectedRowKeys() {
    return this.selectedDomains.map(getRowKey)
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetCert)
  fetchCertInfo(id: string) {
    return this.sslClient.getCertInfo(id).then(cert => this.updateCert(cert))
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetDomains)
  fetchDomains(options: ISearchDomainOptions) {
    return this.domainApis.searchDomain(options).then(({ domains, total }) => {
      this.updateDomainsAndTotal(domains, total)
    })
  }

  @ToasterStore.handle('证书部署成功！')
  @Loadings.handle(LoadingType.Deploy)
  async batchDeploy() {
    if (!this.selectedDomains || this.selectedDomains.length === 0) {
      return
    }
    const httpDomains = this.selectedDomains
      .filter(domain => domain.protocol === Protocol.Http)
      .map(domain => domain.domainName)
    const httpsDomains = this.selectedDomains
      .filter(domain => domain.protocol === Protocol.Https)
      .map(domain => domain.domainName)
    const reqs: Array<Promise<IDeployResult>> = []
    if (httpDomains.length > 0) {
      reqs.push(this.domainApis.sslize({ certid: this.props.id, domainNames: httpDomains }))
    }
    if (httpsDomains.length > 0) {
      reqs.push(this.domainApis.updateHttpsConf({ certid: this.props.id, domainNames: httpsDomains }))
    }
    const results = await Promise.all(reqs)
    const totalDomains = results.reduce(
      (domains, { domainNames }) => (domainNames ? domains.concat(domainNames) : domains),
      [] as string[]
    )
    if (totalDomains && totalDomains.length > 0) {
      throw createDeployException(totalDomains)
    }
    this.resetSelectedDomains()
    this.fetchDomains(this.searchDomainOptions)
  }

  openBatchDeployModal() {
    Modal.confirm({
      content: `确认部署证书到所选中的 ${this.selectedDomains && this.selectedDomains.length} 个域名吗？`,
      onOk: () => this.batchDeploy()
    })
  }

  @ToasterStore.handle('证书部署成功！')
  @Loadings.handle(LoadingType.Deploy)
  deploy(domainName: string, protocol: string) {
    const deployParams = { certid: this.props.id, domainNames: [domainName] }
    const req = protocol === Protocol.Http
      ? this.domainApis.sslize(deployParams)
      : this.domainApis.updateHttpsConf(deployParams)
    return req.then(({ domainNames }) => {
      if (domainNames && domainNames.length > 0) {
        throw createDeployException(domainNames)
      }
    }).then(() => { this.fetchDomains(this.searchDomainOptions) })
  }

  openDeployModal({ domainName, protocol }: IDeployDomain) {
    Modal.confirm({
      content: `确认部署域名 ${domainName} 吗？`,
      onOk: () => this.deploy(domainName, protocol)
    })
  }

  init() {
    this.addDisposer(autorun(() => this.fetchCertInfo(this.props.id)))
    this.addDisposer(reaction(
      () => this.cert && this.searchDomainOptions,
      options => {
        this.fetchDomains(options!)
      }
    ))
  }
}

export function getRowKey(row: IDeployDomain) {
  return `${row.protocol}:${row.domainName}`
}

export function createDeployException(domainNames: string[]) {
  let errorMsg = ''
  if (domainNames.length > 3) {
    errorMsg = `${domainNames.slice(3).join(', ')} 等 ${domainNames.length} 个域名部署失败`
  }
  errorMsg = `域名 ${domainNames.join(', ')} 部署失败`
  return new UnknownException(errorMsg)
}
