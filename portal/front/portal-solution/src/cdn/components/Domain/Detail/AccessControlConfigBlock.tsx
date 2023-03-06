
import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { Iamed } from 'portal-base/user/iam'
import { ICertInfo } from 'portal-base/certificate'

import { shouldForbidModifyAccessControl } from 'cdn/transforms/domain'
import { humanizeRefererType } from 'cdn/transforms/domain/referer'
import { humanizeIpACLType } from 'cdn/transforms/domain/ip-acl'

import timeRefererDoc from 'cdn/docs/time-referer.pdf'

import IamInfo from 'cdn/constants/iam-info'
import { refererTypes, ipACLTypes, Platform } from 'cdn/constants/domain'

import HelpLink from 'cdn/components/common/HelpLink'

import { IDomainDetail } from 'cdn/apis/domain'

import BlockTitle from './BlockTitle'
import ConfigTable from './ConfigTable'
import ConfigureButton from './ConfigureButton'
import ConfigStatus from './ConfigStatus'

function getRefererText(domain: IDomainDetail) {
  const { refererType, nullReferer, refererValues } = domain.referer
  switch (refererType) {
    case refererTypes.empty:
      return <ConfigStatus enabled={false} />
    case refererTypes.black:
    case refererTypes.white: {
      const refererTypeText = humanizeRefererType(refererType)
      const nullRefererText = nullReferer ? '允许空 Referer' : '不允许空 Referer'
      return `${refererTypeText} ${refererValues.length} 个，${nullRefererText}`
    }
    default:
      return '未知'
  }
}

function getIpACLText(domain: IDomainDetail) {
  switch (domain.ipACL.ipACLType) {
    case ipACLTypes.empty:
      return <ConfigStatus enabled={false} />
    case ipACLTypes.black:
    case ipACLTypes.white: {
      const ipACLTypeText = humanizeIpACLType(domain.ipACL.ipACLType)
      return `${ipACLTypeText} ${domain.ipACL.ipACLValues.length} 个`
    }
    default:
      return '未知'
  }
}

export default function AccessControlConfigBlock(props: {
  domain: IDomainDetail
  loading: boolean
  certInfo?: ICertInfo
  handleConfigureReferer: () => void
  handleConfigureTimeReferer: () => void
  handleConfigureBsAuth: () => void
  handleConfigureIpACL: () => void
}) {
  const {
    domain,
    loading,
    certInfo,
    handleConfigureReferer,
    handleConfigureTimeReferer,
    handleConfigureBsAuth,
    handleConfigureIpACL
  } = props
  const iamInfo = useInjection(IamInfo)

  const isDynamic = domain.platform === Platform.Dynamic

  const refererInfo = {
    name: 'Referer 防盗链',
    desc: '配置 Request ConfigurationHeader 中 referer 黑白名单，从而限制访问来源。',
    value: getRefererText(domain),
    configureHandler: handleConfigureReferer,
    iamAction: () => iamInfo.iamActions.UpdateReferer
  }

  const timeRefererInfo = {
    name: '时间戳防盗链',
    desc: (
      <p>
        设置密钥，配合签名过期时间来控制资源内容的访问时限。
        <HelpLink oemHref={timeRefererDoc} href="https://support.qiniu.com/hc/kb/article/195128/" />
      </p>
    ),
    value: <ConfigStatus enabled={domain.timeACL.enable} />,
    configureHandler: handleConfigureTimeReferer,
    iamAction: () => iamInfo.mustCdnIamActions().UpdateTimeACL
  }

  const bsauthInfo = {
    name: '回源鉴权',
    desc: (
      <p>
        配置回源验证策略，对 CDN 接收到的访问请求进行鉴权，适用于对防盗链有很高实时性要求的场景。
        <HelpLink href="https://developer.qiniu.com/fusion/manual/3930/back-to-the-source-authentication" />
      </p>
    ),
    value: <ConfigStatus enabled={domain.bsauth && domain.bsauth.enable} />,
    configureHandler: handleConfigureBsAuth,
    iamAction: () => iamInfo.mustCdnIamActions().UpdateBSAuth
  }

  const ipInfo = {
    name: 'IP 黑白名单',
    desc: (
      <p>
        允许或者禁止某些 IP 或 IP 段的访问，帮助您解决恶意 IP 盗刷、攻击等问题。
      </p>
    ),
    value: getIpACLText(domain),
    configureHandler: handleConfigureIpACL,
    iamAction: () => iamInfo.iamActions.UpdateIpACL
  }

  const timeAndBsauthInfo = !isDynamic ? [timeRefererInfo, bsauthInfo] : []

  const infoList = [
    refererInfo,
    ...timeAndBsauthInfo,
    ipInfo
  ]

  const renderOperations = (_: unknown, record: any) => (
    <Iamed actions={[record.iamAction()]}>
      <ConfigureButton
        shouldForbid={shouldForbidModifyAccessControl(domain, certInfo)}
        onClick={record.configureHandler}
      >修改配置</ConfigureButton>
    </Iamed>
  )

  return (
    <section className="content-block">
      <BlockTitle>访问控制</BlockTitle>
      <ConfigTable
        configList={infoList}
        loading={loading}
        renderOperations={renderOperations}
      />
    </section>
  )
}
