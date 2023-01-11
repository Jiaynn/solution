/**
 * @file Create Domain Store
 * @author linchen <gakiclin@gmail.com>
 */

import { debounce } from 'lodash'
import autobind from 'autobind-decorator'
import { action, computed, observable, autorun, reaction } from 'mobx'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { getMessage } from 'qn-fe-core/exception'
import { injectProps } from 'qn-fe-core/local-store'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { Loadings } from 'portal-base/common/loading'
import { isPrivate as isBucketPrivate } from 'portal-base/kodo/bucket'

import { assertUnreachable } from 'cdn/utils'

import Cluster from 'cdn/utils/async/cluster'

import { getNameForWildcardDomain, isBucketOversea, shouldForbidBucketUsedByDomain } from 'cdn/transforms/domain'

import BucketStore from 'cdn/stores/bucket'
import DomainStore from 'cdn/stores/domain'

import AbilityConfig from 'cdn/constants/ability-config'
import { WorkflowTaskType, DomainType, Platform, SourceType, GeoCover, SourceURLScheme, IpTypes } from 'cdn/constants/domain'

import * as sourceConfigInput from 'cdn/components/Domain/Inputs/SourceConfigInput/ForBatch'
import * as bsAuthConfigInput from 'cdn/components/Domain/Inputs/BsAuthConfigInput'
import { getDefaultHttpsConfig } from 'cdn/components/Domain/Inputs/HttpsConfigInput/ForCreate'

import DomainApis, { ICreateDomainReq, IDomainDetail, ICreatePanDomainReq, verifyOwnershipErrorCode } from 'cdn/apis/domain'

import { DomainProxyApiException } from 'cdn/apis/clients/domain-proxy'

import * as formstate from './CreateForm/formstate'
import { shouldDisableConfigHttps, shouldDisableConfigRegisterNo } from './CreateForm'
import { CreateResult, ICreateDomainResult } from './Result'

import { Props } from '.'

const clusterTaskWorkerNum = 5

enum LoadingType {
  CreateDomain = 'createDomain'
}

type CreateDomainResultWithVerify = ICreateDomainResult & {
  shouldVerify?: boolean
}

@injectable()
export default class LocalStore extends Store {
  private loadings = Loadings.collectFrom(this, LoadingType)

  state = formstate.createState({
    domainApis: this.domainApis,
    type: this.props.type,
    panWildcard: this.props.pareDomain,
    bucket: this.props.bucket,
    platform: this.props.platform,
    geoCover: this.props.geoCover,
    sourceType: this.props.sourceType,
    sourceDomain: this.props.sourceDomain,
    testURLPath: this.props.testURLPath,
    getDomains: () => this.domains,
    isQiniuPrivate: () => this.isQiniuPrivate,
    shouldForbidBucket: this.shouldForbidBucket,
    isOverseasUser: this.userInfo.isOverseasUser,
    abilityConfig: this.abilityConfig,
    shouldForbidRegisterNo: () => !!this.shouldDisableConfigRegisterNo
  })

  // 备案系统开关
  @observable hasIcpChecker = true

  @observable hasIcp = true

  constructor(
    @injectProps() private props: Props,
    private bucketStore: BucketStore,
    private domainStore: DomainStore,
    private userInfo: UserInfo,
    private domainApis: DomainApis,
    private abilityConfig: AbilityConfig
  ) {
    super()
  }

  @computed get isLoading() {
    return this.loadings.isLoading(LoadingType.CreateDomain)
  }

  @computed get wildcardDomains() {
    // 动态加速的泛域名不能用于创建子域名 详见：https://jira.qiniu.io/browse/FUSION-13635
    return this.domainStore.wildcardDomains.filter(
      it => it.platform !== Platform.Dynamic
    )
  }

  @computed get shouldDisableConfigRegisterNo() {
    return shouldDisableConfigRegisterNo(this.userInfo, this.hasIcpChecker)
  }

  getNormalCreateOptions(domainName: string): ICreateDomainReq {
    return formstate.getValue(
      this.state,
      domainName,
      this.isQiniuPrivate,
      true,
      this.abilityConfig,
      !!this.shouldDisableConfigRegisterNo
    )
  }

  @computed get normalCreateOptions(): ICreateDomainReq {
    return this.getNormalCreateOptions(this.domainNames[0])
  }

  @computed get normalCreateOptionsList(): ICreateDomainReq[] {
    return this.domainNames.map(domainName => (
      this.getNormalCreateOptions(domainName)
    ))
  }

  @computed get panCreateOptions(): ICreatePanDomainReq {
    return formstate.getPanDomainValue(this.state)
  }

  @computed get buckets() { return this.bucketStore.buckets }

  /**
   * @description 为了避免用户在输入域名的时候导致其他联动的 input 变更，所以这里读校验过的值
   */
  @computed get domainNames() {
    switch (this.domainType) {
      case DomainType.Pan:
        return this.state.$.panNames.$.map(
          panName => panName.$ + this.state.$.panWildcard.$
        )
      case DomainType.Normal:
        return this.state.$.names.$.map(it => it.$)
      case DomainType.Wildcard:
        return this.state.$.names.$.length === 0
          ? []
          : [getNameForWildcardDomain(this.state.$.names.$[0].$)!]
      default:
        assertUnreachable()
    }
  }

  @computed get validDomains() {
    return this.domainNames.filter(Boolean)
  }

  @computed get domains(): IDomainDetail[] {
    return this.domainNames.map(
      name => ({
        external: null,
        referer: null,
        ipACL: null,
        timeACL: {
          enable: false,
          timeACLKeys: [],
          checkUrl: ''
        },
        bsauth: {
          enable: false
        },
        cache: null,
        cname: '',
        testURLPath: '',
        createAt: null,
        modifyAt: null,
        httpsOPTime: null,
        operationType: null,
        operatingState: null,
        operatingStateDesc: null,
        responseHeaderControls: [],
        couldOperateBySelf: null,
        ...this.normalCreateOptions,
        name,
        pareDomain: this.pareDomain,
        operTaskType: WorkflowTaskType.NotAllow
      } as unknown as IDomainDetail)
    )
  }

  @computed get domainType() {
    return this.state.value.type
  }

  @computed get domainProtocol() {
    return this.normalCreateOptions.protocol
  }

  @computed get domainPlatform() {
    return this.normalCreateOptions.platform
  }

  @computed get domainSource() {
    return this.normalCreateOptions.source
  }

  @computed get domainGeoCover() {
    return this.normalCreateOptions.geoCover
  }

  @computed get childUid() {
    return this.normalCreateOptions.uid
  }

  @computed get pareDomain() {
    switch (this.domainType) {
      case DomainType.Pan:
        return this.state.$.panWildcard.value
      default:
        return ''
    }
  }

  @computed get isQiniuPrivate(): boolean {
    const sourceConfig = sourceConfigInput.getValue(this.state.$.sourceConfig)
    const sourceQiniuBucketInfo = this.bucketStore.getBucket(sourceConfig.sourceQiniuBucket)
    return !!(
      sourceConfig.sourceType === SourceType.QiniuBucket
      && sourceQiniuBucketInfo
      && isBucketPrivate(sourceQiniuBucketInfo.private)
    )
  }

  @computed
  get isOverseaBucket(): boolean {
    const sourceConfig = sourceConfigInput.getValue(this.state.$.sourceConfig)
    const sourceQiniuBucketInfo = this.bucketStore.getBucket(sourceConfig.sourceQiniuBucket)
    return !!(
      sourceQiniuBucketInfo
      && isBucketOversea(sourceQiniuBucketInfo.zone)
    )
  }

  @action.bound updateHasIcpCheck(hasIcpChecker: boolean) {
    this.hasIcpChecker = hasIcpChecker
  }

  @action.bound updateHasIcp(hasIcp: boolean) {
    this.hasIcp = hasIcp
  }

  fetchWildcardDomains() {
    return this.domainStore.fetchWildcardDomains()
  }

  fetchHasIcpChecker() {
    return this.domainApis.getHasIcpCheck().then(this.updateHasIcpCheck)
  }

  bindOverseaBucket() {
    if (this.isOverseaBucket) {
      this.state.$.geoCover.set(GeoCover.Foreign)
    }
  }

  @autobind
  shouldForbidBucket(bucketName: string) {
    const bucket = this.buckets.find(it => it.name === bucketName)
    return shouldForbidBucketUsedByDomain(
      bucket!,
      this.domainType,
      this.domainStore.isQiniuPrivate(this.pareDomain),
      this.hasIcp
    )
  }

  @autobind
  createPanDomain(name: string): Promise<void> {
    return this.domainApis.createPanDomain(name, this.panCreateOptions)
  }

  @autobind
  createDomain(name: string): Promise<void> {
    return this.domainApis.createDomain(name, this.getNormalCreateOptions(name))
  }

  @autobind
  @Loadings.handle(LoadingType.CreateDomain)
  create(): Promise<CreateDomainResultWithVerify[]> {
    const submitRequest = (
      this.domainType === DomainType.Pan
      ? this.createPanDomain
      : this.createDomain
    )

    const requestTask = (domainName: string) => submitRequest(domainName).then(
      () => ({ name: domainName, result: CreateResult.Success }),
      // 之所以不使用整个 err 是因为 err 需要通过 pushState 同步状态到创建结果页面，而 err 本身不能被 cloned
      (err: unknown) => {
        const shouldVerify = err instanceof DomainProxyApiException && err.code === verifyOwnershipErrorCode
        return {
          shouldVerify,
          name: domainName,
          result: CreateResult.Failed,
          errorMsg: getMessage(err)
        }
      }
    )

    const cluster = new Cluster(requestTask, clusterTaskWorkerNum)
    return cluster.start(this.domainNames)
  }

  init() {
    this.addDisposer(this.state.dispose)

    this.bindOverseaBucket()

    if (!this.userInfo.isOverseasUser) {
      this.fetchHasIcpChecker()

      // 判断域名的备案情况
      this.addDisposer(reaction(
        () => [this.validDomains, this.hasIcpChecker],
        debounce(
          async () => {
            if (this.hasIcpChecker && this.validDomains.length) {
              this.updateHasIcp(await this.domainApis.checkAllDomainsHasIcp(this.validDomains))
            } else {
              this.updateHasIcp(true)
            }
          },
          400
        )
      ))
    }

    // 未备案域名只能选择海外覆盖区域
    this.addDisposer(reaction(
      () => this.hasIcp,
      hasIcp => {
        this.state.$.geoCover.set(hasIcp ? GeoCover.China : GeoCover.Foreign)
      }
    ))

    // 自动加载泛域名列表，用于选取
    this.addDisposer(reaction(
      () => this.domainType,
      type => {
        if (type === DomainType.Pan) {
          this.fetchWildcardDomains()
        }
      },
      { fireImmediately: true }
    ))

    // 自动加载选中的泛域名详情
    this.addDisposer(autorun(() => (
      this.pareDomain && this.domainStore.fetchDomainDetail(this.pareDomain)
    )))

    // 域名 protocol 发生变化时自动更新 sourceURLScheme
    this.addDisposer(reaction(
      () => this.domainProtocol,
      protocol => {
        this.state.$.sourceConfig.$.sourceURLScheme.set(protocol as unknown as SourceURLScheme)
      },
      { fireImmediately: true }
    ))

    // 回源鉴权
    this.addDisposer(reaction(
      () => this.isQiniuPrivate,
      isQiniuPrivate => {
        // 若源站选择私有空间，自动打开回源鉴权
        if (isQiniuPrivate) {
          const bsAuthConfig = formstate.createBsAuthState(isQiniuPrivate, true)
          this.state.$.bsAuthConfig = bsAuthConfig
          this.addDisposer(bsAuthConfig.dispose)
        }
        // 若源站选择非私有空间且开启回源鉴权，自动关闭回源鉴权
        const bsAuthConfigVal = bsAuthConfigInput.getValue(this.state.$.bsAuthConfig)
        if (!isQiniuPrivate && bsAuthConfigVal.enable) {
          const bsAuthConfig = formstate.createBsAuthState(isQiniuPrivate, false)
          this.state.$.bsAuthConfig = bsAuthConfig
          this.addDisposer(bsAuthConfig.dispose)
        }
      },
      { fireImmediately: true }
    ))

    // 覆盖范围切换至海外时，IP 协议置为 IPv4，其它情况默认为 IPv6
    this.addDisposer(reaction(
      () => this.domainGeoCover,
      geoCover => {
        const defaultIpTypes = geoCover === GeoCover.Foreign ? IpTypes.IPv4 : IpTypes.IPv6
        this.state.$.ipTypes.set(defaultIpTypes)
      }
    ))

    this.addDisposer(reaction(
      () => shouldDisableConfigHttps(this.userInfo, this.state, this.domains),
      disable => {
        if (disable) {
          this.state.$.httpsConfig.set(getDefaultHttpsConfig())
        }
      }
    ))
  }
}
