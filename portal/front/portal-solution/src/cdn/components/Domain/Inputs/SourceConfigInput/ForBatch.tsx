/**
 * @file 域名源站配置
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { computed, reaction } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { FormState, FieldState, Validator } from 'formstate-x'
import Radio from 'react-icecream/lib/radio'
import { useInjection } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { bindRadioGroup } from 'portal-base/common/form'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { FeatureConfigStore as FeatureConfig } from 'portal-base/user/feature-config'

import { nonEmptyArray } from 'cdn/utils'

import { humanizeSourceTypeAsOption, shouldForbidSourceTypeAndPlatform } from 'cdn/transforms/domain'
import { sourceConfigForSubmit, shouldForbidSourceTypeByOEM, shouldProvideTestSourceHost, shouldForbidSourceUrlRewrite } from 'cdn/transforms/domain/source'

import DomainStore from 'cdn/stores/domain'
import BucketStore from 'cdn/stores/bucket'

import AbilityConfig from 'cdn/constants/ability-config'
import { DomainType, SourceType, Protocol, SourceURLScheme, Platform, SourceHostConfigType } from 'cdn/constants/domain'
import { isOEM } from 'cdn/constants/env'

import TipIcon from 'cdn/components/TipIcon'

import DomainApis, { IDomainDetail } from 'cdn/apis/domain'

import SourceHostInput, * as sourceHostInput from './SourceHostInput'
import BucketInput, * as bucketInput from '../BucketInput'
import SourceTestInput, * as sourceTestInput from '../SourceTest'
import SourceDomainInput, * as sourceDomainInput from './SourceDomainInput'
import AdvancedSourcesInput, * as advancedSourcesInput from '../AdvancedSourcesInput'
import SourceIPsInput, * as sourceIPsInput from './SourceIPsInput'
import SourceURLSchemeInput, * as sourceURLSchemeInput from './SourceURLSchemeInput'
import SourceIgnoreParamsConfigInput, * as sourceIgnoreParamsConfigInput from '../SourceIgnoreParamsConfigInput'
import TestSourceHostInput, * as testSourceHostInput from './TestSourceHostInput'
import SourceURLRewriteInput, * as sourceURLRewriteInput from './SourceURLRewriteInput'

import './style.less'

export interface ISourceConfig {
  sourceType: SourceType
  testSourceHost: testSourceHostInput.Value
  sourceHost: sourceHostInput.ISourceHost
  sourceURLScheme: SourceURLScheme
  sourceQiniuBucket: string
  sourceDomain: string
  sourceIPs: string[]
  advancedSources: advancedSourcesInput.IAdvancedSource[]
  testURLPath: string
  sourceIgnoreParamsConfig: sourceIgnoreParamsConfigInput.IValue
  urlRewrites: sourceURLRewriteInput.Value
}

export type Value = ISourceConfig

export type State = FormState<{
  sourceType: FieldState<SourceType>
  testSourceHost: testSourceHostInput.State
  sourceHost: sourceHostInput.State
  sourceURLScheme: sourceURLSchemeInput.State
  sourceQiniuBucket: bucketInput.State
  sourceDomain: sourceDomainInput.State
  sourceIPs: sourceIPsInput.State
  advancedSources: advancedSourcesInput.State
  testURLPath: sourceTestInput.State
  sourceIgnoreParamsConfig: sourceIgnoreParamsConfigInput.State
  urlRewrites: sourceURLRewriteInput.State
}>

export function createState(
  domainApis: DomainApis,
  modify: boolean,
  sourceConfig: ISourceConfig,
  getDomains: () => IDomainDetail[],
  shouldForbidBucket?: Validator<string>
): State {
  const sourceType = new FieldState(sourceConfig.sourceType)
  const sourceHost = sourceHostInput.createState(
    sourceConfig.sourceHost
  ).disableValidationWhen(() => sourceType.value === SourceType.QiniuBucket)

  return new FormState({
    sourceType,
    sourceHost,
    sourceURLScheme: sourceURLSchemeInput.createState(sourceConfig.sourceURLScheme),
    sourceQiniuBucket: bucketInput.createState(
      sourceConfig.sourceQiniuBucket,
      {
        modify,
        getDomains,
        domainApis,
        validators: nonEmptyArray([shouldForbidBucket])
      }
    ).disableValidationWhen(() => sourceType.value !== SourceType.QiniuBucket),
    sourceDomain: sourceDomainInput.createState(
      sourceConfig.sourceDomain,
      getDomains
    ).disableValidationWhen(() => sourceType.value !== SourceType.Domain),
    sourceIPs: sourceIPsInput.createState(
      sourceConfig.sourceIPs
    ).disableValidationWhen(() => sourceType.value !== SourceType.Ip),
    advancedSources: advancedSourcesInput.createState(
      sourceConfig.advancedSources,
      getDomains
    ).disableValidationWhen(() => sourceType.value !== SourceType.Advanced),
    testSourceHost: testSourceHostInput.createState(sourceConfig.testSourceHost).disableValidationWhen(
      () => !shouldProvideTestSourceHost(
        sourceHostInput.getValue(sourceHost),
        sourceType.value,
        getDomains()[0].type
      )
    ),
    testURLPath: sourceTestInput.createState(
      sourceConfig.testURLPath
    ).disableValidationWhen(() => sourceType.value === SourceType.QiniuBucket),
    sourceIgnoreParamsConfig: sourceIgnoreParamsConfigInput.createState(sourceConfig.sourceIgnoreParamsConfig, modify),
    urlRewrites: sourceURLRewriteInput.createState(sourceConfig.urlRewrites).disableValidationWhen(
      () => !modify
    )
  })
}

export function getValue(state: State): Value {
  const { sourceDomain, sourceIPs, ...restValues } = state.value
  return {
    ...restValues,
    urlRewrites: sourceURLRewriteInput.getValue(state.$.urlRewrites),
    advancedSources: advancedSourcesInput.getValue(state.$.advancedSources),
    sourceDomain: sourceDomainInput.getValue(state.$.sourceDomain),
    sourceIPs: sourceIPsInput.getValue(state.$.sourceIPs)
  }
}

export interface Props {
  // 控制源站是否 fix 在给定的 qiniuBucket
  // 相应 tab 和 select 都 disable
  shouldFixBucket?: boolean
  hasIcp?: boolean
  modify: boolean
  domains: IDomainDetail[]
  state: State
}

export default observer(function DomainSourceConfigInput(props: Props) {
  const bucketStore = useInjection(BucketStore)
  const domainStore = useInjection(DomainStore)
  const userInfo = useInjection(UserInfo)
  const featureConfig = useInjection(FeatureConfig)
  const abilityConfig = useInjection(AbilityConfig)

  return (
    <DomainSourceConfigInputInner
      {...props}
      userInfo={userInfo}
      bucketStore={bucketStore}
      domainStore={domainStore}
      featureConfig={featureConfig}
      abilityConfig={abilityConfig}
    />
  )
})

export interface IDomainSourceConfigInputForBatchProps extends Props {
  bucketStore: BucketStore
  domainStore: DomainStore
  userInfo: UserInfo
  featureConfig: FeatureConfig
  abilityConfig: AbilityConfig
}

@observer
export class DomainSourceConfigInputInner extends React.Component<IDomainSourceConfigInputForBatchProps> {
  disposable = new Disposable()

  componentDidMount() {
    this.props.bucketStore.fetchBuckets()

    // 回源 HOST 默认为加速域名，当加速域名变化时，更新 sourceHost
    this.disposable.addDisposer(reaction(
      () => [
        this.props.domains[0].name,
        this.props.state.$.sourceHost
      ] as const,
      ([domain, sourceHost]) => {
        const config = sourceHostInput.getValue(sourceHost)

        if (config.domainValue !== domain) {
          sourceHost.set({
            ...config,
            domainValue: domain
          })
        }
      }
    ))

    // 当 sourceHost.type 为 source 时，如果 sourceType 切换到 ip 或者 advanced 时，type 设置为 domain
    this.disposable.addDisposer(reaction(
      () => {
        const domain = this.props.domains && this.props.domains[0]
        return domain.source.sourceType
      },
      sourceType => {
        const form = this.props.state
        const sourceHost = sourceHostInput.getValue(form.$.sourceHost)
        if (sourceType && sourceHost.type === SourceHostConfigType.Source) {
          if (sourceType === SourceType.Ip || sourceType === SourceType.Advanced) {
            form.$.sourceHost.set({
              ...sourceHost,
              type: SourceHostConfigType.Domain
            })
          }
        }
      }
    ))

    // 当 sourceType 为 domain 时，如果 sourceDomain 变化时，同时变更 sourceValue
    this.disposable.addDisposer(reaction(
      () => {
        const domain = this.props.domains && this.props.domains[0]
        return domain.source.sourceDomain
      },
      sourceDomain => {
        const form = this.props.state
        const sourceType = form.$.sourceType.value
        const sourceHost = sourceHostInput.getValue(form.$.sourceHost)
        if (sourceType && sourceType === SourceType.Domain && sourceDomain !== sourceHost.sourceValue) {
          form.$.sourceHost.set({ ...sourceHost, sourceValue: sourceDomain })
        }
      }
    ))

    // 因为 urlRewrites 的 disableValidationWhen 依赖条件不太好加，所以在这里手动同步一次
    this.disposable.addDisposer(reaction(
      () => this.props.state.$.urlRewrites,
      () => {
        this.props.state.$.urlRewrites.disableValidationWhen(
          () => this.isSourceUrlRewriteForbidden
        )
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @autobind
  validateState() {
    return this.props.state.validate()
  }

  @computed get isTestSourceHostVisible() {
    return shouldProvideTestSourceHost(
      sourceHostInput.getValue(this.props.state.$.sourceHost),
      this.props.domains[0].source.sourceType as SourceType,
      this.props.domains[0].type
    )
  }

  @computed get isSourceUrlRewriteForbidden() {
    // 创建域名时不允许回源改写
    return !this.props.modify || !!shouldForbidSourceUrlRewrite(
      this.props.domains[0],
      isOEM,
      this.props.userInfo,
      this.props.featureConfig
    )
  }

  getPatchedDomains() {
    return patchDomains(this.props.domains, getValue(this.props.state), this.isSourceUrlRewriteForbidden)
  }

  getIgnoreParamsPart() {
    // 创建域名时不予配置去参数回源
    if (!this.props.modify || !this.props.abilityConfig.supportMidSource) {
      return null
    }

    return (
      <div key="ignore-params" className="line">
        <div className="line">
          <SourceIgnoreParamsConfigInput
            state={this.props.state.$.sourceIgnoreParamsConfig}
          />
        </div>
      </div>
    )
  }

  getUrlRewritePart() {
    if (this.isSourceUrlRewriteForbidden) {
      return null
    }

    return (
      <SourceURLRewriteInput
        key="source-url-rewrite"
        state={this.props.state.$.urlRewrites}
      />
    )
  }

  getQiniuBucketPart() {
    const { modify, bucketStore, domains, hasIcp, state, shouldFixBucket } = this.props
    const buckets = bucketStore.buckets
    const tip = (
      domains[0].type === DomainType.Wildcard
        ? <p className="source-bucket-tip">* 泛域名和对应的泛子域名暂时只支持源站同为公有存储空间或同为私有存储空间。</p>
        : null
    )

    return (
      <>
        {tip}
        <BucketInput
          domains={this.getPatchedDomains()}
          modify={modify}
          buckets={buckets}
          disabled={!!shouldFixBucket}
          hasIcp={hasIcp}
          state={state.$.sourceQiniuBucket}
        />
        {this.getIgnoreParamsPart()}
        {this.getUrlRewritePart()}
      </>
    )
  }

  getDomainPart() {
    const { domains, state: form } = this.props

    return [
      <SourceDomainInput key="domain" state={form.$.sourceDomain} />,
      <SourceHostInput key="host" domains={this.getPatchedDomains()} state={form.$.sourceHost} />,
      (domains[0].protocol === Protocol.Https && (
        <SourceURLSchemeInput key="URLScheme" state={form.$.sourceURLScheme} />
      )),
      this.getIgnoreParamsPart(),
      (this.isTestSourceHostVisible && (
        <TestSourceHostInput key="testSourceHost" state={form.$.testSourceHost} />
      )),
      <SourceTestInput key="test" onTestTriggered={this.validateState} domains={this.getPatchedDomains()} state={form.$.testURLPath} />,
      this.getUrlRewritePart()
    ].filter(Boolean)
  }

  getIpPart() {
    const { domains, state: form } = this.props
    return [
      <SourceIPsInput key="IPs" state={form.$.sourceIPs} />,
      <SourceHostInput key="host" state={form.$.sourceHost} domains={this.getPatchedDomains()} />,
      (domains[0].protocol === Protocol.Https && (
        <SourceURLSchemeInput key="URLScheme" state={form.$.sourceURLScheme} />
      )),
      this.getIgnoreParamsPart(),
      (this.isTestSourceHostVisible && (
        <TestSourceHostInput key="testSourceHost" state={form.$.testSourceHost} />
      )),
      <SourceTestInput key="test" onTestTriggered={this.validateState} domains={this.getPatchedDomains()} state={form.$.testURLPath} />,
      this.getUrlRewritePart()
    ].filter(Boolean)
  }

  getAdvancedPart() {
    const { domains, state: form } = this.props
    return [
      <AdvancedSourcesInput
        key="advance"
        domains={this.getPatchedDomains()}
        state={form.$.advancedSources}
      />,
      <SourceHostInput key="host" state={form.$.sourceHost} domains={this.getPatchedDomains()} />,
      (domains[0].protocol === Protocol.Https && (
        <SourceURLSchemeInput
          key="URLScheme"
          state={form.$.sourceURLScheme}
        />
      )),
      this.getIgnoreParamsPart(),
      (this.isTestSourceHostVisible && (
        <TestSourceHostInput key="testSourceHost" state={form.$.testSourceHost} />
      )),
      <SourceTestInput onTestTriggered={this.validateState} key="test" domains={this.getPatchedDomains()} state={form.$.testURLPath} />,
      this.getUrlRewritePart()
    ].filter(Boolean)
  }

  shouldForbid(sourceType: string) {
    const domain = this.props.domains[0]
    const bindDomainForbid = (
      sourceType !== SourceType.QiniuBucket && this.props.shouldFixBucket
        ? '绑定域名时只支持七牛云存储'
        : null
    )
    return bindDomainForbid || shouldForbidSourceTypeAndPlatform(sourceType as SourceType, domain.platform as Platform)
  }

  getSourceTypeRadio(sourceType: string) {
    if (shouldForbidSourceTypeByOEM(isOEM, sourceType)) {
      return null
    }
    const sourceTypeText = humanizeSourceTypeAsOption(sourceType)
    const shouldForbid = this.shouldForbid(sourceType)

    // const visible=sourceType=='qiniuBucket'?false:true

    return (
      <Radio key={sourceType} value={sourceType} disabled={!!shouldForbid}>
        {
          shouldForbid
            ? (
              <span>
                {sourceTypeText}
                <TipIcon
                  className="source-type-tab-tip-icon"
                  size="12px"
                  tip={shouldForbid}
                />
              </span>
            )
            : sourceTypeText
        }
      </Radio>
    )
  }

  getSourceTypeContent(sourceType: SourceType, content: React.ReactNode) {
    if (shouldForbidSourceTypeByOEM(isOEM, sourceType)) {
      return null
    }
    const form = this.props.state
    const sourceTypeState = form.$.sourceType
    const shouldForbid = this.shouldForbid(sourceType)
    return !shouldForbid && sourceTypeState.value === sourceType
      ? <div className="source-config-input-content">{content}</div>
      : null
  }

  render() {
    const form = this.props.state

    const radios = this.props.abilityConfig.domainSourceTypes
      .map(sourceType => this.getSourceTypeRadio(sourceType))
    return (
      <div className="domain-source-config-input-wrapper">
        <Radio.Group
          {...bindRadioGroup(form.$.sourceType)}
        >
          {radios}
        </Radio.Group>
        <br />
        {this.getSourceTypeContent(SourceType.QiniuBucket, this.getQiniuBucketPart())}
        {this.getSourceTypeContent(SourceType.Domain, this.getDomainPart())}
        {this.getSourceTypeContent(SourceType.Ip, this.getIpPart())}
        {this.getSourceTypeContent(SourceType.Advanced, this.getAdvancedPart())}
      </div>
    )
  }
}

export function getDefaultSourceType(platform?: Platform): SourceType {
  if (isOEM) {
    return SourceType.Domain
  }

  if (platform && platform === Platform.Dynamic) {
    return SourceType.Domain
  }

  return SourceType.QiniuBucket
}

export function getDefaultSourceConfig(sourceType?: SourceType): ISourceConfig {
  sourceType = sourceType || getDefaultSourceType()

  return {
    sourceType,
    sourceHost: sourceHostInput.getDefaultSourceHost(),
    sourceURLScheme: SourceURLScheme.Http,
    sourceQiniuBucket: null!,
    sourceDomain: '',
    sourceIPs: [],
    advancedSources: [],
    testURLPath: '',
    testSourceHost: '',
    urlRewrites: [],
    sourceIgnoreParamsConfig: sourceIgnoreParamsConfigInput.getDefaultValue()
  }
}

// TODO check 一下这个函数是否必要
function patchDomains(
  domains: IDomainDetail[],
  patch: ISourceConfig,
  isSourceUrlRewriteForbidden: boolean
): IDomainDetail[] {
  return domains.map(domain => ({
    ...domain,
    source: sourceConfigForSubmit(patch, domain.type, domain.protocol, domain.name, isSourceUrlRewriteForbidden)
  }))
}
