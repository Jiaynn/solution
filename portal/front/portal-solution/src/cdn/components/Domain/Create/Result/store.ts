/**
 * @file store for CreateDomainResult
 * @author gakiclin@gmail.com
 */

import { History } from 'history'
import autobind from 'autobind-decorator'
import { computed, reaction } from 'mobx'
import Disposable from 'qn-fe-core/disposable'
import { injectProps } from 'qn-fe-core/local-store'
import { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { RouterStore } from 'portal-base/common/router'
import { getMessage } from 'qn-fe-core/exception'

import { nonEmptyArray } from 'cdn/utils'

import Cluster from 'cdn/utils/async/cluster'

import DomainStore from 'cdn/stores/domain'

import { DomainType, CreateDomainSummary } from 'cdn/constants/domain'

import DomainApis, { IDomainDetail, ICreateDomainReq, ICreatePanDomainReq } from 'cdn/apis/domain'

import Routes from 'cdn/constants/routes'

import { ResultListItem } from './List'

import { IProps } from '.'

enum LoadingType {
  GetDomainsInfo = 'GetDomainsInfo',
  Retry = 'Retry'
}

export enum CreateResult {
  Success = 'success',
  Failed = 'failed'
}

export interface ICreateDomainResult {
  name: string
  result: CreateResult
  errorMsg?: string
}

export interface ICreateDomainState {
  results: ICreateDomainResult[]
  domainType: DomainType
  createOptions: Array<ICreateDomainReq | ICreatePanDomainReq>
}

const clusterTaskWorkerNum = 5

@injectable()
export default class LocalStore extends Disposable {
  loadings = Loadings.collectFrom(this, LoadingType)

  constructor(
    @injectProps() protected props: IProps,
    private toasterStore: Toaster,
    private routerStore: RouterStore,
    private domainApis: DomainApis,
    private domainStore: DomainStore,
    private routes: Routes
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @computed get createDomainState(): ICreateDomainState {
    const state = (this.routerStore.location!.state || {}) as ICreateDomainState
    return {
      results: state.results || [],
      domainType: state.domainType,
      createOptions: state.createOptions || []
    }
  }

  @computed get createResults() {
    return this.createDomainState.results
  }

  @computed get createOptionsMap() {
    return this.createDomainState.createOptions.reduce((acc, cur, index) => {
      const domainName = this.createResults[index]?.name
      if (domainName) {
        acc[domainName] = cur
      }
      return acc
    }, {} as Record<string, ICreateDomainReq | ICreatePanDomainReq>)
  }

  @computed get successDomains(): IDomainDetail[] {
    return nonEmptyArray(this.successDomainNames.map(
      name => this.domainStore.getDomainDetail(name)
    ))
  }

  @computed get successDomainNames(): string[] {
    return this.createDomainState.results
      .filter(r => r.result === CreateResult.Success)
      .map(r => r.name)
  }

  @computed get failedDomains(): ICreateDomainResult[] {
    return this.createDomainState.results
      .filter(r => r.result === CreateResult.Failed)
  }

  @computed get failedDomainNames(): string[] {
    return this.failedDomains.map(d => d.name)
  }

  @computed get resultStatus(): CreateDomainSummary {
    if (this.failedDomainNames.length === 0) {
      return CreateDomainSummary.Success
    }

    if (this.successDomainNames.length === 0) {
      return CreateDomainSummary.Failure
    }

    return CreateDomainSummary.PartialFailure
  }

  @computed get domainsForDisplay(): ResultListItem[] {
    return [
      ...this.successDomains.map<ResultListItem>(
        domain => ({
          isSuccess: true,
          name: domain.name,
          cname: domain.cname
        })
      ),
      ...this.failedDomains.map<ResultListItem>(
        domain => ({
          isSuccess: false,
          name: domain.name,
          errorMsg: domain.errorMsg!
        })
      )
    ]
  }

  createDomains() {
    const createRequest: (name: string, options: ICreateDomainReq | ICreatePanDomainReq) => Promise<void> = (
      this.createDomainState.domainType === DomainType.Pan
      ? this.domainApis.createPanDomain
      : this.domainApis.createDomain
    )

    const requestTask = (domainName: string) => createRequest(domainName, this.createOptionsMap[domainName]).then(
      () => ({ name: domainName, result: CreateResult.Success }),
      // 之所以不使用整个 err 是因为 err 需要通过 pushState 同步状态，而 err 本身不能被 cloned
      (err: unknown) => ({ name: domainName, result: CreateResult.Failed, errorMsg: getMessage(err) })
    )

    const cluster = new Cluster(requestTask, clusterTaskWorkerNum)
    return cluster.start(this.failedDomainNames)
  }

  @autobind
  reload(results: ICreateDomainResult[]) {
    // FIXME: routerStore push/replace 不支持 state
    // https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.replace
    // 注意：state 需要支持被 cloned，否则会有 DataCloneError 错误：
    // Failed to execute 'pushState' on 'History': function () { [native code] } could not be cloned.
    const history = (this.routerStore as any).history as History
    history.replace(
      this.routerStore.location!.pathname,
      {
        ...this.createDomainState,
        results
      }
    )
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.Retry)
  retryCreateDomains() {
    return this.createDomains().then(this.reload)
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.GetDomainsInfo)
  fetchDomainsInfo() {
    const requestTask = (domainName: string) => this.domainStore.fetchDomainDetail(domainName)
    const cluster = new Cluster(requestTask, clusterTaskWorkerNum)
    return cluster.start(this.successDomainNames)
  }

  @autobind
  redirectToDomainList() {
    this.routerStore.push(this.routes.domainList)
  }

  init() {
    this.addDisposer(reaction(
      () => this.successDomainNames,
      () => this.fetchDomainsInfo(),
      { fireImmediately: true }
    ))

    this.addDisposer(reaction(
      () => this.props.retryImmediately,
      retryImmediately => {
        if (retryImmediately) {
          this.retryCreateDomains()
        }
      },
      { fireImmediately: true }
    ))
  }
}
