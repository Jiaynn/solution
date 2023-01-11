/**
 * @file Create Form Component
 * @author linchen <gakiclin@gamil.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import Button from 'react-icecream/lib/button'
import Form, { FormProps } from 'react-icecream/lib/form'
import { useInjection } from 'qn-fe-core/di'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'

import { findObjectStateErrorField } from 'cdn/utils/form/formstate-x'

import BucketStore from 'cdn/stores/bucket'

import { useSafeDispatch, BindRef, useAutoScrollAnchor } from 'cdn/hooks/misc'

import AbilityConfig from 'cdn/constants/ability-config'
import { DomainType, SourceType } from 'cdn/constants/domain'
import { isOEM } from 'cdn/constants/env'

import DomainTypeInput from 'cdn/components/Domain/Inputs/TypeInput'
import OEMSubAccountSelect from 'cdn/components/Domain/Inputs/OEMSubAccountInput'
import DomainNameInput, { DomainNameInputLabel } from 'cdn/components/Domain/Inputs/NameInput'
import DomainPanWildcardInput from 'cdn/components/Domain/Inputs/PanWildcardInput'
import DomainPanNameInput from 'cdn/components/Domain/Inputs/PanNameInput'
import DomainHttpsConfigInput, { HttpsConfigInputLabel } from 'cdn/components/Domain/Inputs/HttpsConfigInput/ForCreate'
import DomainPanBucketInput, { DomainPanBucketInputLabel } from 'cdn/components/Domain/Inputs/PanBucketInput'
import DomainRegisterNoInput from 'cdn/components/Domain/Inputs/RegisterNoInput'
import DomainGeoCoverInput from 'cdn/components/Domain/Inputs/GeoCoverInput'
import DomainPlatformInput from 'cdn/components/Domain/Inputs/PlatformInput'
import DomainIpTypesInput from 'cdn/components/Domain/Inputs/IpTypesInput'
import DomainSourceConfigInput from 'cdn/components/Domain/Inputs/SourceConfigInput/ForBatch'
import DomainCacheConfigInput from 'cdn/components/Domain/Inputs/CacheConfigInput'
import DomainCacheIgnoreParamsConfigInput, { IgnoreParamsInputLabel } from 'cdn/components/Domain/Inputs/CacheConfigInput/IgnoreParams'

import { IBucketSimplified } from 'cdn/apis/bucket'
import { IDomainDetail, IDomain } from 'cdn/apis/domain'

import ConfigBlock from './ConfigBlock'

import { State, ConfigInputType } from './formstate'

import './style.less'

const formProps: FormProps = {
  colon: false,
  layout: 'horizontal'
}

export { ConfigInputType }

export interface Props {
  /** 滚动到指定的锚点 */
  anchor?: ConfigInputType
  /** 是否锁定源站 bucket */
  shouldFixBucket?: boolean
  /** 取消创建域名 */
  onCancel: () => void
  /** 创建域名 */
  onCreate: () => Promise<void>
  /** 备案系统开关 */
  hasIcpChecker: boolean
  /** 表单数据状态 */
  state: State
  /** 域名列表 */
  domains: IDomainDetail[]
  /** 私有 bucket */
  isPrivateBucket: boolean
  /** 泛域名列表 */
  wildcardDomains: IDomain[]
  /** 域名已备案 */
  hasIcp: boolean
}

interface CreateFormContentProps {
  shouldFixBucket?: boolean
  bindRef: BindRef<ConfigInputType>
  buckets: IBucketSimplified[]
  hasIcpChecker: boolean
  domains: IDomainDetail[]
  wildcardDomains: IDomain[]
  isPrivateBucket: boolean
  hasIcp: boolean
  state: State
}

const CreateFormContent = observer(function _CreateFormContent({
  state,
  bindRef,
  buckets,
  domains,
  hasIcp,
  hasIcpChecker,
  wildcardDomains,
  shouldFixBucket,
  isPrivateBucket
}: CreateFormContentProps) {
  const abilityConfig = useInjection(AbilityConfig)

  const domainType = domains[0].type
  const userInfoStore = useInjection(UserInfo)
  const isIcpRequired = !userInfoStore.isOverseasUser
  const domainLimit = 1 // 仅支持添加单个域名，参考：https://jira.qiniu.io/browse/FUSION-15742

  const typeInput = (
    <Form.Item
      key="type"
      label="域名类型"
      ref={bindRef('type')}
    >
      <DomainTypeInput
        domain={domains[0]}
        buckets={buckets}
        shouldDisableBasedOnBucket={!!shouldFixBucket}
        state={state.$.type}
      />
    </Form.Item>
  )

  const subAccountInput = (
    <Form.Item
      key="owner"
      label="域名归属"
      ref={bindRef('uid')}
    >
      <OEMSubAccountSelect
        withParent
        state={state.$.uid}
      />
    </Form.Item>
  )

  const nameInput = (
    <Form.Item
      key="name"
      label={<DomainNameInputLabel limit={domainLimit} shouldShowIcpTips={isIcpRequired} />}
      ref={bindRef('names')}
    >
      <DomainNameInput
        domainType={domainType}
        limit={domainLimit}
        state={state.$.names}
        shouldCheckIcp={isIcpRequired && hasIcpChecker}
      />
    </Form.Item>
  )

  const httpsInput = (
    <Form.Item
      key="httpsConfig"
      label={<HttpsConfigInputLabel />}
      ref={bindRef('httpsConfig')}
    >
      <DomainHttpsConfigInput
        canSwitchProtocol
        domain={domains[0]}
        state={state.$.httpsConfig}
      />
    </Form.Item>
  )

  const panWildcardInput = (
    <Form.Item
      key="panWildcard"
      label="选择泛域名"
      ref={bindRef('panWildcard')}
    >
      <DomainPanWildcardInput
        wildcardDomains={wildcardDomains}
        state={state.$.panWildcard}
      />
    </Form.Item>
  )

  const panNameInput = (
    <Form.Item
      key="panNames"
      label="前缀"
      ref={bindRef('panNames')}
    >
      <DomainPanNameInput
        domain={domains[0]}
        limit={domainLimit}
        state={state.$.panNames}
      />
    </Form.Item>
  )

  const panBucketInput = (
    <Form.Item
      key="panBucket"
      label={<DomainPanBucketInputLabel />}
      ref={bindRef('panBucket')}
    >
      <DomainPanBucketInput
        domains={domains}
        hasIcp={hasIcp}
        buckets={buckets}
        disabled={!!shouldFixBucket}
        state={state.$.panBucket}
      />
    </Form.Item>
  )

  const registerNoInput = (
    <Form.Item
      key="registerNo"
      label="备案号"
      ref={bindRef('registerNo')}
    >
      <DomainRegisterNoInput state={state.$.registerNo} />
    </Form.Item>
  )

  const geoCoverInput = (
    <Form.Item
      key="geoCover"
      label="覆盖范围"
      ref={bindRef('geoCover')}
    >
      <DomainGeoCoverInput hasIcp={hasIcp} state={state.$.geoCover} />
    </Form.Item>
  )

  const platformInput = !abilityConfig.hideDomainPlatform && (
    <Form.Item
      key="platform"
      label="使用场景"
      ref={bindRef('platform')}
    >
      <DomainPlatformInput
        state={state.$.platform}
        sourceType={domains[0].source.sourceType as SourceType}
      />
    </Form.Item>
  )

  const ipTypesInput = (
    <Form.Item
      key="ipTypes"
      label="IP 协议"
      ref={bindRef('ipTypes')}
    >
      <DomainIpTypesInput
        state={state.$.ipTypes}
        geoCover={state.$.geoCover.value}
      />
    </Form.Item>
  )

  const sourceConfigInput = (
    <Form.Item
      key="sourceConfig"
      label="源站配置"
      ref={bindRef('sourceConfig')}
    >
      <DomainSourceConfigInput
        modify={false}
        domains={domains}
        shouldFixBucket={shouldFixBucket}
        hasIcp={hasIcp}
        state={state.$.sourceConfig}
      />
    </Form.Item>
  )

  const { useStaticCacheConfig, cacheControlFieldLabel } = abilityConfig
  const cacheControlConfigInput = (
    <Form.Item
      key="cacheConfig"
      label={cacheControlFieldLabel}
      ref={bindRef('cacheConfig')}
    >
      <DomainCacheConfigInput
        domain={domains[0]}
        isQiniuPrivate={isPrivateBucket}
        modify={false}
        state={state.$.cacheConfig.$}
      />
    </Form.Item>
  )

  const cacheIgnoreParamsInput = (!useStaticCacheConfig || state.$.cacheConfig.value.enabled)
    ? (
      <Form.Item
        key="cacheIgnoreParamsConfig"
        label={<IgnoreParamsInputLabel />}
        // FIXME: 这里 bind 了两次 cacheConfig，第二次会覆盖第一次，正确的做法应该是
        // 1. 拿这两个 Form Item 的共同父节点 bind 到 cacheConfig
        // 2. 或者干脆把这俩（cacheConfig & ignoreParams）分开，不要都放在 cacheConfig 名字下
        // ref={bindRef('cacheConfig')}
      >
        <DomainCacheIgnoreParamsConfigInput
          state={state.$.cacheConfig.$.$.$.ignoreParams}
        />
      </Form.Item>
    )
    : null

  const domainContent: Array<JSX.Element | boolean> = [typeInput]

  if (isOEM && userInfoStore.parent_uid === 0) {
    domainContent.push(subAccountInput)
  }

  if (domainType === DomainType.Pan) {
    domainContent.push(panWildcardInput, panNameInput, panBucketInput)
  } else {
    domainContent.push(nameInput)

    if (!shouldDisableConfigRegisterNo(userInfoStore, hasIcpChecker)) {
      domainContent.push(registerNoInput)
    }

    if (!shouldDisableConfigHttps(userInfoStore, state, domains)) {
      domainContent.push(httpsInput)
    }

    domainContent.push(geoCoverInput, platformInput, ipTypesInput)
  }

  const sourceContent = domainType === DomainType.Pan
    ? null
    : [sourceConfigInput]

  const cacheContent = domainType === DomainType.Pan
    ? null
    : [cacheControlConfigInput, cacheIgnoreParamsInput].filter(Boolean)

  return (
    <>
      <ConfigBlock title="域名配置">
        {domainContent}
      </ConfigBlock>
      <ConfigBlock title="源站配置">
        {sourceContent}
      </ConfigBlock>
      <ConfigBlock title="缓存配置">
        {cacheContent}
      </ConfigBlock>
    </>
  )
})

export function shouldDisableConfigHttps(userInfo: UserInfo, state: State, domains: IDomainDetail[]) {
  if (domains.length > 1) {
    return '批量创建域名不支持 HTTPS 配置'
  }

  const childUid = state.$.uid.value
  if (isOEM && childUid && userInfo.uid !== childUid) {
    return '父账号创建子账号域名的时候不支持配置 HTTPS'
  }

  return null
}

export function shouldDisableConfigRegisterNo(userInfo: UserInfo, hasIcpChecker: boolean) {
  if (hasIcpChecker) {
    return '备案检测系统已开启'
  }

  if (userInfo.isOverseasUser) {
    return '海外用户无需检测备案'
  }

  return null
}

export default observer(function CreateForm({
  state,
  anchor,
  onCancel,
  onCreate,
  ...restProps
}: Props) {
  const [loading, setLoading] = React.useState(false)
  const safeSetLoading = useSafeDispatch(setLoading)

  const [bindRef, setScrollAnchor] = useAutoScrollAnchor(anchor)

  const handleCreate = React.useCallback(() => {
    state.validate().then(({ hasError }) => {
      if (!hasError) {
        safeSetLoading(true)
        onCreate().finally(() => safeSetLoading(false))
      } else {
        setScrollAnchor(findObjectStateErrorField(state))
      }
    })
  }, [state, onCreate, setScrollAnchor, safeSetLoading])

  const bucketStore = useInjection(BucketStore)

  return (
    <div className="comp-create-domain-form">
      <Form {...formProps}>
        <CreateFormContent
          state={state}
          bindRef={bindRef}
          buckets={bucketStore.buckets.slice()}
          {...restProps}
        />
        <hr className="sep-line" />
        <p className="submit-line">
          <Button type="ghost" onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleCreate}
          >
            创建
          </Button>
        </p>
      </Form>
    </div>
  )
})
