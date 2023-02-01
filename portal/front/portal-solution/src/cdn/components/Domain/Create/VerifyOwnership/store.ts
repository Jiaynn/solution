/**
 * @file Verify domain ownership localStore
 * @author linchen <gakiclin@gmail.com>
 */

import autobind from 'autobind-decorator'
import { action, computed, observable, reaction } from 'mobx'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { injectProps } from 'qn-fe-core/local-store'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { RouterStore } from 'portal-base/common/router'

import { assert } from 'cdn/utils'

import { OwnershipVerifyType } from 'cdn/constants/domain'

import Routes from 'cdn/constants/routes'
import { DomainProxyApiException } from 'cdn/apis/clients/domain-proxy'
import DomainApis, { verifyOwnershipErrorCode, OwnershipVerifyInfo } from 'cdn/apis/domain'

import { ICreateDomainState } from '../Result'
import { Props } from '.'

enum LoadingType {
  GetOwnershipVerifyInfo = 'getOwnershipVerifyInfo'
}

export enum VerifyStatus {
  Pending = 'pending',
  Success = 'success',
  Verifying = 'verifying',
  VerifyError = 'verifyError',
  UnknownError = 'unknownError'
}

@injectable()
export default class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  @observable.ref verifyType: OwnershipVerifyType = OwnershipVerifyType.Dns

  @observable.ref verifyInfo?: OwnershipVerifyInfo

  verifyStatusMap = observable.map<OwnershipVerifyType, VerifyStatus>([
    [OwnershipVerifyType.Dns, VerifyStatus.Pending],
    [OwnershipVerifyType.File, VerifyStatus.Pending]
  ], { deep: false })

  constructor(
    @injectProps() protected props: Props,
    private toasterStore: Toaster,
    private routerStore: RouterStore,
    private domainApis: DomainApis,
    private routes: Routes
  ) {
    super()
  }

  @computed get isVerifyInfoLoading() {
    return this.loadings.isLoading(LoadingType.GetOwnershipVerifyInfo)
  }

  @computed get dnsVerifyInfo() {
    return this.verifyInfo?.dns
  }

  @computed get fileVerifyInfo() {
    return this.verifyInfo?.file
  }

  @computed get firstLevelDomain() {
    return this.verifyInfo?.domain
  }

  @computed get createDomainState(): ICreateDomainState {
    const state = (this.routerStore.location!.state || {}) as ICreateDomainState
    return {
      results: state.results || [],
      domainType: state.domainType,
      createOptions: state.createOptions || []
    }
  }

  @computed get domain() {
    assert(this.createDomainState.results.length === 1, '当前仅支持处理单个域名验证所有权')
    return this.createDomainState.results[0].name
  }

  @action.bound updateVerifyInfo(info: OwnershipVerifyInfo) {
    this.verifyInfo = info
  }

  @action.bound updateVerifyType(type: OwnershipVerifyType) {
    this.verifyType = type
  }

  @autobind
  verifyOwnership() {
    const verifyType = this.verifyType
    this.verifyStatusMap.set(verifyType, VerifyStatus.Verifying)
    return this.domainApis.verifyOwnership(this.domain, verifyType)
      .then(() => {
        this.verifyStatusMap.set(verifyType, VerifyStatus.Success)
        this.toasterStore.success('验证成功')
      })
      .catch(err => {
        if (err instanceof DomainProxyApiException && err.code === verifyOwnershipErrorCode) {
          this.verifyStatusMap.set(verifyType, VerifyStatus.VerifyError)
        } else {
          this.verifyStatusMap.set(verifyType, VerifyStatus.UnknownError)
        }
      })
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.GetOwnershipVerifyInfo)
  getOwnershipVerifyInfo() {
    return this.domainApis.getOwnershipVerifyInfo(this.domain).then(this.updateVerifyInfo)
  }

  init() {
    this.getOwnershipVerifyInfo()

    this.addDisposer(reaction(
      () => [...this.verifyStatusMap].some(
        ([_, status]) => status === VerifyStatus.Success
      ),
      () => {
        this.routerStore.push(
          this.routes.domainCreateResult({ ...this.createDomainState, retryImmediately: true })
        )
      }
    ))
  }
}
