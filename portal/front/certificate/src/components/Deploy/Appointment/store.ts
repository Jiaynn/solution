/*
 * @file store Deploy Appointment
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { observable, action, computed, reaction, makeObservable } from 'mobx'
import { differenceBy, concat } from 'lodash'

import { observeInjectable } from 'qn-fe-core/store'
import { injectProps } from 'qn-fe-core/local-store'
import Disposable from 'qn-fe-core/disposable'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import DomainApis, { ISearchDomainOptions, IDeployDomain } from '../../../apis/domain'
import { CertExpireSort } from '../../../constants/domain'
import { AppointmentForDisplayProps, AppointmentForEditProps } from '.'

enum LoadingType {
  GetCert = 'GetCert',
  GetDomains = 'GetDomains'
}

const MAX_CAN_SELECT_DOMAIN_NUMBER = 50

class BaseAppointmentStore extends Disposable {
  constructor(
    protected props: AppointmentForDisplayProps,
    toasterStore: ToasterStore,
    private domainApis: DomainApis
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, toasterStore)
  }

  loadings = Loadings.collectFrom(this, LoadingType)

  @observable pageIndex = 1
  @observable total = 0
  @observable pageSize = 10
  @observable isCurrentCert?: boolean
  @observable canDeploy?: boolean
  @observable expireSort?: CertExpireSort

  @observable.ref domains: IDeployDomain[] = []

  @action updatePageIndex(pageIndex: number) {
    this.pageIndex = pageIndex
  }

  @action updatePageSize(pageSize: number) {
    this.pageSize = pageSize
  }

  @action updateIsCurrentCert(isCurrent?: boolean) {
    this.isCurrentCert = isCurrent
  }

  @action updateCanDeploy(canDeploy?: boolean) {
    this.canDeploy = canDeploy
  }

  @action updateExpireSort(sort: CertExpireSort) {
    this.expireSort = sort
  }

  @action updateDomainsAndTotal(domains: IDeployDomain[], total: number) {
    this.domains = domains || []
    this.total = total
  }

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @computed get searchDomainOptions(): ISearchDomainOptions {
    return {
      from: (this.pageIndex - 1) * this.pageSize,
      size: this.pageSize,
      currentCertId: this.props.certId,
      currentOrderId: this.props.orderId,
      currentCertNames: this.props.dnsNames,
      currentCertFilter: this.isCurrentCert,
      certExpiredSort: this.expireSort || CertExpireSort.Asc,
      canDeployFilter: this.canDeploy
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
      onChange: (pageIdx: number) => {
        this.updatePageIndex(pageIdx)
      }
    }
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetDomains)
  fetchDomains(options: ISearchDomainOptions) {
    return this.domainApis.searchDomain(options).then(({ domains, total }) => {
      this.updateDomainsAndTotal(domains, total)
    })
  }

  init() {
    this.addDisposer(reaction(
      () => this.searchDomainOptions,
      options => {
        if (options.currentCertId || (options.currentCertNames && options.currentCertNames.length > 0)) {
          this.fetchDomains(options)
        }
      },
      {
        fireImmediately: true
      }
    ))
  }
}

@observeInjectable()
export class AppointmentForDisplayStore extends BaseAppointmentStore {
  constructor(
    @injectProps() protected props: AppointmentForDisplayProps,
    toasterStore: ToasterStore,
    domainApis: DomainApis
  ) {
    super(props, toasterStore, domainApis)
    ToasterStore.bindTo(this, toasterStore)
  }
}

@observeInjectable()
export class AppointmentForEditStore extends BaseAppointmentStore {
  constructor(
    @injectProps() protected props: AppointmentForEditProps,
    toasterStore: ToasterStore,
    domainApis: DomainApis
  ) {
    super(props, toasterStore, domainApis)
    ToasterStore.bindTo(this, toasterStore)
  }

  @observable.ref selectedDomains: IDeployDomain[] = []

  @action updateSelectedDomains(domains: IDeployDomain[]) {
    // 切换 filter 的时候，留住选中项中已经不符合当前 filter 的那些项；切换 page 时，留住之前选中的项
    const originDomains = differenceBy(this.selectedDomains || [], this.domains, 'domainName')
    this.selectedDomains = concat(originDomains, domains)
    const selectedDomainNames = this.selectedDomains.map(domain => domain.domainName);
    (this.props as AppointmentForEditProps).onChange(selectedDomainNames)
  }

  @computed get selectedRowKeys() {
    return this.selectedDomains.map(getRowKey)
  }

  @computed get canSelectDomain() {
    return this.selectedDomains.length < MAX_CAN_SELECT_DOMAIN_NUMBER
  }
}

export function getRowKey(row: IDeployDomain) {
  return `${row.protocol}:${row.domainName}`
}
