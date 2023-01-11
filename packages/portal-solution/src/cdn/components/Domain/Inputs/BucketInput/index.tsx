/**
 * @file Input for bucket
 * @author nighca <nighca@live.cn>
 */

import { groupBy } from 'lodash'
import React, { ReactElement, useMemo } from 'react'
import { reaction, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState, bindInput, Validator, ValidationResponse } from 'formstate-x'
import Select from 'react-icecream/lib/select'
import { useInjection } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'
import { humanizeZone } from 'portal-base/kodo/bucket'
import { getBucketCreatePath } from 'portal-base/kodo/routes'
import { Link } from 'portal-base/common/router'
import { UserInfoStore } from 'portal-base/user/account'

import { lexicCompare } from 'cdn/utils'

import { truthy } from 'cdn/transforms/form'
import { shouldForbidBucketUsedByDomain } from 'cdn/transforms/domain'

import DomainStore from 'cdn/stores/domain'

import { useBatchCheckUcDomainState } from 'cdn/hooks/domain'

import { SourceType } from 'cdn/constants/domain'

import { useDomainDetailCtx } from 'cdn/components/Domain/Detail/context'

import { IBucketSimplified } from 'cdn/apis/bucket'
import DomainApis, { IDomainDetail, UcDomainState, UcDomainStateMap, UcDomainType } from 'cdn/apis/domain'

import Error from '../common/Error'
import Warning from '../common/Warning'
import NoIcpWarning from '../common/NoIcpWarning'

import './style.less'

export enum SortType {
  Lexic = 'lexic' // lexicographic 字典序
}

export type State = FieldState<string>

export type Value = string

export function createState(
  bucket: string | null,
  options: {
    domainApis: DomainApis
    modify?: boolean
    getDomains: () => IDomainDetail[],
    validators?: Array<Validator<Value>>
  }
): State {
  return new FieldState(bucket == null ? '' : bucket)
    .validators(
      v => truthy(v, '请选择 bucket'),
      v => validateByUcDomainState(options.domainApis, v, !!options.modify, options.getDomains),
      ...(options.validators || []).filter(it => !!it)
    )
}

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  buckets: IBucketSimplified[]
  domains: IDomainDetail[]
  modify?: boolean
  hasIcp?: boolean
  sort?: SortType
  disabled: boolean
  state: State
}

export default observer(function DomainBucketInput(props: Props) {
  const { state, ...restProps } = props
  const domainStore = useInjection(DomainStore)
  const userInfoStore = useInjection(UserInfoStore)

  return (
    <DomainBucketInputInner
      {...restProps}
      {...bindInput(state)}
      userInfoStore={userInfoStore}
      domainStore={domainStore}
      error={state.error}
    />
  )
})

export interface IDomainBucketInputProps {
  buckets: IBucketSimplified[]
  domains: IDomainDetail[]
  modify?: boolean
  hasIcp?: boolean
  disabled: boolean
  value: string
  sort?: SortType
  error?: ValidationResponse
  onChange: (value: string) => void
}

type DomainBucketInputInnerProps = IDomainBucketInputProps & {
  domainStore: DomainStore
  userInfoStore: UserInfoStore
}

@observer
class DomainBucketInputInner extends React.Component<DomainBucketInputInnerProps> {

  disposable = new Disposable()

  constructor(props: DomainBucketInputInnerProps) {
    super(props)
    makeObservable(this)
  }

  @computed get buckets() {
    const buckets = (this.props.buckets || []).slice()
    switch (this.props.sort) {
      case SortType.Lexic: // 默认字典序
      default:
        buckets.sort(bucketLexicSort)
    }
    return buckets
  }

  @computed get groups() {
    const domain = this.props.domains[0]
    const zoneMap = groupBy(this.buckets, bucket => bucket.zone)
    return Object.keys(zoneMap).map(
      zone => ({
        key: zone,
        text: humanizeZone(zone),
        options: zoneMap[zone].map(
          bucket => ({
            value: bucket.name,
            text: humanizeBucket(bucket),
            valid: (
              !shouldForbidBucketUsedByDomain(
                bucket,
                domain.type,
                this.props.domainStore.isQiniuPrivate(domain.pareDomain),
                this.props.hasIcp,
                this.props.userInfoStore.isOverseasUser
              )
            )
          })
        )
      })
    )
  }

  @computed get groupsView() {
    return this.groups.map(
      ({ key: groupKey, text: groupText, options }) => {
        const optionsView = options.map(
          ({ value, text, valid }) => (
            <Select.Option
              key={value}
              value={value}
              disabled={!valid}
            >{text}</Select.Option>
          )
        )
        return (
          <Select.OptGroup key={groupKey} label={groupText}>{optionsView}</Select.OptGroup>
        )
      }
    )
  }

  componentDidMount() {
    // 自动选中第一个合法值
    this.disposable.addDisposer(reaction(
      () => ([] as string[]).concat(...this.groups.map(
        group => group.options.filter(({ valid }) => valid).map(({ value }) => value)
      )),
      validValues => {
        // 判断 this.groups.length > 0 是为了避免 props.buckets（异步加载）加载过慢导致 URL 选中的 bucket 被覆盖
        // 之所以判断 this.groups.length 而不是 validValues.length 是因为当用户只有国内 bucket，但是想创建海外未备案域名的时候，会导致第一次选中的国内 bucket 无法清除
        // 或许后面可以改成：加一个 loading props 表示 bucket 是否加载完毕
        if (!this.props.disabled && this.groups.length > 0 && validValues.indexOf(this.props.value) < 0) {
          this.props.onChange(validValues[0])
        }
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    const { modify, disabled, value, error, onChange, hasIcp } = this.props
    const isIcpRequired = !this.props.userInfoStore.isOverseasUser
    return (
      <div className="line domain-bucket-input-wrapper">
        <div className="line">
          <div className="text-input-wrapper">
            <Select
              placeholder="请选择一个 bucket"
              value={value}
              onChange={onChange}
              disabled={disabled}
              showSearch
            >{this.groupsView}</Select>
          </div>
          <DomainBucketError error={error} />
          <DomainBucketWarning
            modify={modify}
            shouldShowNoIcpTips={isIcpRequired && !hasIcp}
          />
        </div>
      </div>
    )
  }
}

interface DomainBucketWarningProps {
  modify?: boolean
  shouldShowNoIcpTips: boolean
}

function DomainBucketWarning({
  modify,
  shouldShowNoIcpTips
}: DomainBucketWarningProps) {

  const cnt = [
    shouldShowNoIcpTips && (
      <NoIcpWarning
        key="no-icp"
        desc={(
          <span>
            只能选择海外存储，您可以点击&nbsp;
            <Link to={getBucketCreatePath()} target="_blank" rel="noopener">创建海外存储</Link>
          </span>
        )}
      />
    ),
    <Warning
      key="extra"
      className="extra-tip"
      warning={(
        <>
          当源站选择存储时，若发生回源请求将会由存储产生&nbsp;
          <a target="_blank" rel="noopener" href="https://www.qiniu.com/prices">CDN 回源流量费</a>
        </>
      )}
    />
  ].filter(Boolean)

  const { domainDetail } = useDomainDetailCtx()

  // 只有修改域名信息的时候需要做这个校验
  const domainNames = useMemo(
    () => (modify && domainDetail ? [domainDetail.name] : []),
    [modify, domainDetail]
  )
  const { domainStateMap, isSuccess } = useBatchCheckUcDomainState(domainNames)

  const showBindWarning = modify
    && isSuccess
    && domainDetail
    && isBindCurrentUserSourceDomain(domainDetail, domainStateMap?.[domainDetail.name])
    && (
      <Warning className="bind-warning">
        检测到加速域名同时作为源站域名绑定在了当前存储空间上。更换空间时，该加速域名也将同时作为源站域名换绑到新的空间上。
      </Warning>
    )

  return (
    <>
      {showBindWarning}{cnt}
    </>
  )
}

function isBindCurrentUserSourceDomain(domain: IDomainDetail, domainState?: UcDomainState) {
  return domainState
    && domainState.isExist
    && domainState.belongsToCurrentUser
    && domainState.tbl === domain.source.sourceQiniuBucket
    && domain.source.sourceType === SourceType.QiniuBucket
    && [UcDomainType.All, UcDomainType.KodoSource].includes(domainState.domainType)
}

interface DomainBucketErrorProps {
  error?: ValidationResponse
}

function DomainBucketError({ error }: DomainBucketErrorProps) {
  if (!error) {
    return null
  }

  if (!isBindValidateError(error)) {
    return (
      <Error>
        {error}
      </Error>
    )
  }

  const { bindOtherUserDomains, bindOtherBucketDomains } = deserializeBindValidateError(error)

  // 一个域名的时候不显示具体的名称
  const formatDomains = (domains: string[]) => (
    domains.length > 1
      ? `（${domains.join('、')}）`
      : null
  )

  const result: ReactElement[] = []

  if (bindOtherUserDomains.length) {
    result.push(
      <Error key="bindOtherUserDomains">
        加速域名{formatDomains(bindOtherUserDomains)}已作为源站域名绑定在其他用户的存储空间上，请修改加速域名。
        若您仍希望保持现有配置，可进行
        &nbsp;<Link rel="noopener" target="_blank" to={formatURL('/kodo/bucket', { retrieveDomain: bindOtherUserDomains[0] })}>域名找回</Link>。
      </Error>
    )
  }

  if (bindOtherBucketDomains.length) {
    result.push(
      <Error key="bindOtherBucketDomains">
        加速域名{formatDomains(bindOtherBucketDomains)}
        已作为源站域名绑定在其他存储空间上，请选择对应空间作为源站或修改加速域名。
        若您仍希望保持现有配置，可前往对应存储空间解绑源站域名。
      </Error>
    )
  }

  return <>{result}</>
}

function humanizeBucket(bucket: IBucketSimplified) {
  if (bucket.private) {
    return `${bucket.name} - 私有`
  }
  if (bucket.share) {
    return `${bucket.name} - 共享`
  }
  return bucket.name
}

function bucketLexicSort(bucketA: IBucketSimplified, bucketB: IBucketSimplified) {
  return lexicCompare(bucketA.name, bucketB.name)
}

const bindErrorPrefix = 'bind-error:'

type BindValidateResponse = {
  bindOtherUserDomains: string[]
  bindOtherBucketDomains: string[]
}

function isBindValidateError(err: ValidationResponse): err is string {
  return typeof err === 'string' && err.startsWith(bindErrorPrefix)
}

function serializeBindValidateError(
  bindOtherUserDomains: string[],
  bindOtherBucketDomains: string[]
): ValidationResponse {
  return bindOtherUserDomains.length || bindOtherBucketDomains.length
    ? `${bindErrorPrefix}${JSON.stringify({ bindOtherUserDomains, bindOtherBucketDomains })}`
    : null
}

function deserializeBindValidateError(resp: ValidationResponse): BindValidateResponse {
  return isBindValidateError(resp)
    ? JSON.parse(resp.replace(bindErrorPrefix, ''))
    : { bindOtherUserDomains: [], bindOtherBucketDomains: [] }
}

async function validateByUcDomainState(
  domainApis: DomainApis,
  bucket: string | undefined,
  modify: boolean,
  getDomains: () => IDomainDetail[]
) {
  // 修改源站，源站从一个空间切换到另一个空间，说明 bucket 和域名的绑定关系属于当前用户。
  // 绑定关系会随着 bucket 一同切换 (repub)，所以不需要校验。
  if (modify && getDomains()[0].source.sourceType === SourceType.QiniuBucket) {
    return null
  }

  let domainStateMap: UcDomainStateMap | null = null
  try {
    domainStateMap = await domainApis.batchCheckUcDomainState(getDomains().map(it => it.name).filter(Boolean))
  } catch (err: unknown) {
    return '获取域名存储空间绑定信息失败'
  }

  const bindOtherUserDomains = filterBindOtherUserDomains(domainStateMap)

  const bindOtherBucketDomains = filterBindOtherBucketDomains(domainStateMap, bucket)

  return serializeBindValidateError(bindOtherUserDomains, bindOtherBucketDomains)
}

function filterBindOtherUserDomains(domainStateMap: UcDomainStateMap) {
  return Object.keys(domainStateMap).filter(domain => {
    const item = domainStateMap[domain]
    return item.isExist && !item.belongsToCurrentUser
  })
}

function filterBindOtherBucketDomains(domainStateMap: UcDomainStateMap, bucket?: string) {
  return Object.keys(domainStateMap).filter(domain => {
    const item = domainStateMap[domain]
    return item.isExist && item.belongsToCurrentUser && bucket && bucket !== item.tbl
  })
}
