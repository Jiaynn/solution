/**
 * @file Domain List Protocol Component
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream-2/lib/Tooltip'
import { Link } from 'portal-base/common/router'
import { useTranslation } from 'portal-base/common/i18n'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { useInjection } from 'qn-fe-core/di'

import { shouldForbidSslize } from 'cdn/transforms/domain'

import { protocolTextMap, Protocol } from 'cdn/constants/domain'

import { CertInfo, IDomain } from 'cdn/apis/domain'
import Routes from 'cdn/constants/routes'

const HttpsConfigTip = observer(function _HttpsConfigTip({ domain }: { domain: string }) {
  const routes = useInjection(Routes)
  const t = useTranslation()

  return t({
    cn: (
      <>
        未开启 HTTPS 配置，前往&nbsp;
        <Link to={routes.domainDetail(domain, { module: 'httpsConfig' })}>配置</Link>
      </>
    ),
    en: (
      <>
        HTTPS configuration is not enabled, go to&nbsp;
        <Link to={routes.domainDetail(domain, { module: 'httpsConfig' })}>configure</Link>
      </>
    )
  })
})

const httpsCertTermMessages = {
  expired: {
    cn: '证书已经过期',
    en: 'The certificate has expired'
  },
  willExpired: {
    cn: '证书有效期不足 30 天',
    en: 'The certificate is valid for less than 30 days'
  }
}

const HttpsCertTerm = observer(function HttpsCertTerm({ certInfo }: {certInfo: CertInfo | undefined}) {
  const t = useTranslation()
  const now = new Date().getTime() / 1000
  if (!certInfo || (certInfo.not_after - now) >= 30 * 24 * 3600) {
    return null
  }

  if ((certInfo.not_after - now) < 0) {
    return (
      <Tooltip title={t(httpsCertTermMessages.expired)}>
        <Icon type="info-circle" style={{ color: '#EF4149', marginLeft: '8px' }} />
      </Tooltip>
    )
  }
  return (
    <Tooltip title={t(httpsCertTermMessages.willExpired)}>
      <Icon type="info-circle" style={{ color: '#FA8C16', marginLeft: '8px' }} />
    </Tooltip>
  )
})

export interface Props {
  domain: IDomain
  certInfo: CertInfo | undefined
}

export default function DomainProtocol({ domain, certInfo }: Props) {

  const userInfo = useInjection(UserInfo)
  const shouldForbid = shouldForbidSslize(domain, userInfo)

  let extra
  if (domain.protocol === Protocol.Https) {
    extra = <HttpsCertTerm certInfo={certInfo} />
  } else {
    extra = (!shouldForbid && (
      <Tooltip title={<HttpsConfigTip domain={domain.name} />}>
        <Icon type="info-circle" style={{ color: '#999', marginLeft: '8px' }} />
      </Tooltip>
    ))
  }

  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {protocolTextMap[domain.protocol]}
      {extra}
    </span>
  )
}
