
import React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import { chunk } from 'lodash'
import { useInjection } from 'qn-fe-core/di'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import { ICertInfo } from 'portal-base/certificate'
import { useTranslation } from 'portal-base/common/i18n'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'

import { humanizeTimeUTC } from 'cdn/transforms/datetime'

import {
  humanizeOperatingState, humanizePlatform, humanizeGeoCover, humanizeType,
  humanizeRecycleLeftDays, humanizeIpTypes
} from 'cdn/transforms/domain/index'

import AbilityConfig from 'cdn/constants/ability-config'
import { isOEM, oemConfig } from 'cdn/constants/env'
import { DomainType, GeoCover } from 'cdn/constants/domain'

import HelpLink from 'cdn/components/common/HelpLink'

import TipIcon from 'cdn/components/TipIcon'

import { IDomainDetail } from 'cdn/apis/domain'

import BlockTitle from './BlockTitle'
import GeoCoverConfigBlock from './GeoCoverConfigBlock'
import IpTypesConfigBlock from './IpTypesConfigBlock'

export default observer(function BasicInfoBlock(props: {
  domain: IDomainDetail
  certInfo?: ICertInfo
  hasIcp: boolean
  onRefresh?: () => void
}) {
  const domain = props.domain
  const userInfoStore = useInjection(UserInfo)
  const abilityConfig = useInjection(AbilityConfig)
  const t = useTranslation()
  const isTestDomain = domain.type === DomainType.Test
  const showCname = !isTestDomain && !(
    isOEM && oemConfig.hideSubAccountDomainDetailCname && userInfoStore.parent_uid !== 0
  )

  const cnameBlock = showCname && (
    <>
      <span className="key">CNAME：</span>
      <span className="value">
        {domain.cname}
        <HelpLink
          className="cname-help-link"
          href="https://developer.qiniu.com/fusion/kb/1322/how-to-configure-cname-domain-name"
        >
          帮助
        </HelpLink>
      </span>
    </>
  )

  const createAtBlock = (
    <>
      <span className="key">创建时间：</span>
      <span className="value">{humanizeTimeUTC(domain.createAt)}</span>
    </>
  )

  const domainStateBlock = (
    <>
      <span className="key">域名状态：</span>
      <span className={classNames(['value', `state-${domain.operatingState}`])}>
        {t(humanizeOperatingState(domain.operatingState, domain.freezeType))}
      </span>
    </>
  )

  const leftDaysBlock = isTestDomain && (
    <>
      <span className="key">剩余回收时间：</span>
      <span className="value text-danger">
        {humanizeRecycleLeftDays(domain.leftDays!)}
      </span>
    </>
  )

  const domainTypeBlock = (
    <>
      <span className="key">域名类型：</span>
      <span className="value">{t(humanizeType(domain.type))}</span>
    </>
  )

  const protocolBlock = (
    <>
      <span className="key">协议：</span>
      <span className="value">{domain.protocol.toUpperCase()}</span>
    </>
  )

  const platformBlock = !abilityConfig.hideDomainPlatform && (
    <>
      <span className="key">使用场景：</span>
      <span className="value">{t(humanizePlatform(domain.platform))}</span>
    </>
  )

  const geoCoverBlock = (
    <>
      <span className="key">覆盖：</span>
      <span className="value">{t(humanizeGeoCover(domain.geoCover))}</span>
      <GeoCoverConfigBlock
        onConfigOk={props.onRefresh!}
        hasIcp={props.hasIcp}
        domain={domain}
        certInfo={props.certInfo}
      />
    </>
  )

  const ipTypesTip = domain.geoCover === GeoCover.Foreign
    && <TipIcon tip="海外暂时不支持 IPv6 访问" />
  const ipTypesBlock = (
    <>
      <span className="key">IP 协议{ipTypesTip}：</span>
      <span className="value">{humanizeIpTypes(domain.ipTypes)}</span>
      <IpTypesConfigBlock
        onConfigOk={props.onRefresh!}
        domain={domain}
        certInfo={props.certInfo}
      />
    </>
  )

  const blockItems = [
    cnameBlock, domainStateBlock, leftDaysBlock, protocolBlock, geoCoverBlock,
    createAtBlock, domainTypeBlock, platformBlock, ipTypesBlock
  ].filter(Boolean)

  return (
    <section className="content-block">
      <BlockTitle>基本信息</BlockTitle>
      {chunk(blockItems, 4).map((rowItems, rowIndex) => (
        <Row className="content-line" gutter={8} key={rowIndex}>
          {rowItems.map((item, index) => {
            let colSpan = 6
            // 含有 cname 时，第一列宽度统一调长
            if (showCname) {
              colSpan = index === 0 ? 8 : 5
            }
            return <Col key={index} span={colSpan}>{item}</Col>
          })}
        </Row>
      ))}
    </section>
  )
})
