/**
 * @file Input for domain geoCover
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import cns from 'classnames'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { useInjection } from 'qn-fe-core/di'
import Radio from 'react-icecream/lib/radio'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { bindRadioGroup } from 'portal-base/common/form'
import { useTranslation } from 'portal-base/common/i18n'

import { humanizeGeoCover } from 'cdn/transforms/domain'

import { GeoCover, geoCovers, geoCoverList } from 'cdn/constants/domain'
import { oemConfig, isOEM } from 'cdn/constants/env'
import NoIcpWarning from '../common/NoIcpWarning'
import NoIcpSourceBucketWarning from '../common/NoIcpSourceBucketWarning'

import './style.less'

export type State = FieldState<GeoCover>

export type Value = GeoCover

export function createState(val?: GeoCover): State {
  return new FieldState(val == null ? GeoCover.China : val)
}

export interface Props {
  isCNBucket?: boolean
  hasIcp: boolean
  className?: string
  state: State
}

export default observer(function DomainGeoCoverInput(props: Props) {
  const userInfoStore = useInjection(UserInfo)
  const t = useTranslation()
  const shouldForbidByGeoCover = (geoCover: string) => shouldForbidGeoCoverByOEM(userInfoStore, geoCover)
    || shouldForbidGeoCoverByNoIcpAndCNBucket(userInfoStore, props.hasIcp, geoCover, !!props.isCNBucket)

  const radios = geoCoverList.map(
    geoCover => (
      shouldForbidByGeoCover(geoCover)
        ? null
        : <Radio key={geoCover} value={geoCover}>{t(humanizeGeoCover(geoCover))}</Radio>
    )
  ).filter(Boolean)

  const isIcpRequired = !userInfoStore.isOverseasUser
  const shouldShowNoIcpTips = isIcpRequired && !props.hasIcp

  const noIcpWarning = shouldShowNoIcpTips && (
    <NoIcpWarning />
  )

  const isCNSourceBucketWarning = props.isCNBucket && shouldShowNoIcpTips && (
    <NoIcpSourceBucketWarning />
  )

  return (
    <div className="domain-geo-cover-input-wrapper">
      <div className="line">
        <Radio.Group {...bindRadioGroup(props.state)}>
          {radios}
        </Radio.Group>
        <div className={cns({ [props.className!]: !!noIcpWarning || !!isCNSourceBucketWarning })}>
          {noIcpWarning}
          {isCNSourceBucketWarning}
        </div>
      </div>
    </div>
  )
})

function shouldForbidGeoCoverByOEM(userInfoStore: UserInfo, geoCover: string) {
  if (geoCover === geoCovers.foreign && isOEM && userInfoStore.parent_uid !== 0 && oemConfig.hideSubAccountGeoForeign) {
    return 'OEM 子帐户禁用海外覆盖区域'
  }
  if (geoCover === geoCovers.global && isOEM && userInfoStore.parent_uid !== 0 && oemConfig.hideSubAccountGeoGlobal) {
    return 'OEM 子帐户禁用全球覆盖区域'
  }
  return null
}

function shouldForbidGeoCoverByNoIcpAndCNBucket(
  userInfoStore: UserInfo,
  hasIcp: boolean,
  geoCover: string,
  isCNBucket: boolean
) {
  if (userInfoStore.isOverseasUser && geoCover !== geoCovers.foreign) {
    return '海外用户只能选择海外区域'
  }

  if (!hasIcp && (geoCover === geoCovers.china || geoCover === geoCovers.global)) {
    return '未备案域名只能选择海外区域'
  }
  if (!hasIcp && isCNBucket) {
    return '未备案域名使用海外加速不能使用国内 Bucket'
  }
  return null
}
