/**
 * @file component DomainState 加速域名的状态
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { ObservableMap } from 'mobx'
import { observer } from 'mobx-react'
import { Tag, Tooltip, Spin } from 'react-icecream/lib'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { useInjection } from 'qn-fe-core/di'

import { getCDNDomainStateDesc } from 'kodo/transforms/domain'

import { KodoIamStore } from 'kodo/stores/iam'
import { ICDNDomain } from 'kodo/stores/domain'

import {
  CDNDomainStatus, CDNDomainStatusColorMap,
  CDNDomainStatusTextMap, CDNDomainBucketType
} from 'kodo/constants/domain'

export interface IProps {
  useTextStyle: boolean
  isCNAMELoading: boolean
  domainInfo: ICDNDomain
  CNAMEMap: ObservableMap<string, boolean>
}

export default observer(function DomainState(props: IProps) {

  const iamStore = useInjection(KodoIamStore)
  const userInfoStore = useInjection(UserInfo)

  const { domainBucketType, operatingState } = props.domainInfo

  const shouldDisplayDesc = (
    !iamStore.isIamUser
    && !userInfoStore.isBufferedUser
    || [CDNDomainStatus.Failed, CDNDomainStatus.Processing].includes(operatingState)
  )

  const getDesc = (CNAMED: boolean) => (
    shouldDisplayDesc && { title: getCDNDomainStateDesc(props.domainInfo, CNAMED) }
  )
  const contentView = props.useTextStyle
    ? <span>{CDNDomainStatusTextMap[operatingState]}</span>
    : (
      <Tag color={CDNDomainStatusColorMap[operatingState]} small>
        {CDNDomainStatusTextMap[operatingState]}
      </Tag>
    )

  if (domainBucketType === CDNDomainBucketType.WildcardCustomer) {
    return (
      <Tooltip {...getDesc(false)}>
        {contentView}
      </Tooltip>
    )
  }

  if (
    [CDNDomainBucketType.FusionCustomer, CDNDomainBucketType.PanCustomer].includes(domainBucketType)
  ) {
    if (props.isCNAMELoading) {
      return <Spin spinning />
    }

    const CNAMED = props.CNAMEMap.get(props.domainInfo.name)

    if (CNAMED) {
      return (
        <Tooltip {...getDesc(true)}>
          {contentView}
        </Tooltip>
      )
    }

    if (operatingState === CDNDomainStatus.Success) {
      return (
        <Tooltip {...getDesc(false)}>
          {
            props.useTextStyle
              ? CDNDomainStatusTextMap.waitCNAME
              : (<Tag color={CDNDomainStatusColorMap.waitCNAME} small>{CDNDomainStatusTextMap.waitCNAME}</Tag>)
          }
        </Tooltip>
      )
    }

    return (
      <Tooltip {...getDesc(false)}>
        {contentView}
      </Tooltip>
    )
  }

  return contentView
})
