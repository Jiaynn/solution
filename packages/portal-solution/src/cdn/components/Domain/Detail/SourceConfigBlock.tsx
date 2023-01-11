
import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { Link, apps, basenameMap } from 'portal-base/common/router'
import { Iamed } from 'portal-base/user/iam'
import { ICertInfo } from 'portal-base/certificate'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { FeatureConfigStore as FeatureConfig } from 'portal-base/user/feature-config'

import { humanizeSourceURLScheme, shouldForbidModifySource } from 'cdn/transforms/domain'

import { shouldForbidSourceUrlRewrite } from 'cdn/transforms/domain/source'

import IamInfo from 'cdn/constants/iam-info'
import { DomainType, SourceType } from 'cdn/constants/domain'
import { isOEM, isQiniu } from 'cdn/constants/env'

import HelpLink from 'cdn/components/common/HelpLink'

import { IDomainDetail, UrlRewrite } from 'cdn/apis/domain'

import BlockTitle from './BlockTitle'
import ConfigTable from './ConfigTable'
import ConfigureButton from './ConfigureButton'

export default function SourceConfigBlock(props: {
  domain: IDomainDetail
  loading: boolean
  certInfo?: ICertInfo
  handleConfigure: () => void
}) {
  const { domain, loading, certInfo, handleConfigure } = props
  const { sourceHost, sourceURLScheme } = domain.source
  const configDesc = isQiniu ? '资源的回源域名或 IP，推荐使用七牛云存储作为源站' : '资源的回源域名或 IP。'

  const userInfoStore = useInjection(UserInfo)
  const featureConfig = useInjection(FeatureConfig)
  const { iamActions } = useInjection(IamInfo)

  if (domain.type === DomainType.Test) {
    return (
      <section className="content-block">
        <BlockTitle>回源配置</BlockTitle>
        <ConfigTable
          configList={[{
            name: '源站信息',
            desc: configDesc,
            value: getSourceText(userInfoStore, domain)
          }]}
          loading={loading}
          renderOperations={() => ({
            props: {
              rowSpan: 1
            },
            children: (
              <Iamed actions={[iamActions.UpdateSource]}>
                <ConfigureButton
                  shouldForbid={shouldForbidModifySource(domain, certInfo)}
                  onClick={handleConfigure}
                >修改配置</ConfigureButton>
              </Iamed>
            )
          })}
        />
      </section>
    )
  }

  const infoList = [
    {
      name: '源站信息',
      desc: configDesc,
      value: getSourceText(userInfoStore, domain)
    },
    {
      name: '回源 HOST',
      desc: (
        <p>
          指定请求的服务器的域名，默认为加速域名。
          <HelpLink href="https://developer.qiniu.com/fusion/kb/4064/understanding-and-setting-up-the-way-back-to-the-source-host" />
        </p>
      ),
      value: sourceHost || '无'
    },
    {
      name: '回源协议',
      desc: '请求回源的协议，如需修改回源协议请先开启 HTTPS',
      value: humanizeSourceURLScheme(sourceURLScheme)
    },
    !shouldForbidSourceUrlRewrite(domain, isOEM, userInfoStore, featureConfig) && (
      {
        name: '回源改写',
        desc: '改写回源请求的 URL，从而匹配源站的 URL',
        value: humanizeURLRewrite(domain.source.urlRewrites)
      }
    )
  ].filter(Boolean)

  const renderOperations = (_: unknown, __: unknown, index: number) => ({
    props: {
      rowSpan: index === 0 ? infoList.length : 0
    },
    children: (
      <Iamed actions={[iamActions.UpdateSource]}>
        <ConfigureButton
          shouldForbid={shouldForbidModifySource(domain, certInfo)}
          onClick={handleConfigure}
        >修改配置</ConfigureButton>
      </Iamed>
    )
  })

  return (
    <section className="content-block">
      <BlockTitle>回源配置</BlockTitle>
      <ConfigTable
        configList={infoList}
        loading={loading}
        renderOperations={renderOperations}
      />
    </section>
  )
}

function humanizeURLRewrite(urlRewrites?: UrlRewrite[]) {
  const count = urlRewrites?.length ?? 0
  return `${count} 条规则`
}

function getSourceText(userInfoStore: UserInfo, domain: IDomainDetail) {
  const { sourceType, sourceQiniuBucket, sourceDomain, sourceIPs, advancedSources } = domain.source
  switch (sourceType) {
    case SourceType.QiniuBucket: {
      const bucket = sourceQiniuBucket
      return (
        <span>
          七牛云存储&nbsp;
          <Link
            to={`${basenameMap[apps.kodo]}/${bucket}/index`}
            disabled={userInfoStore.isIamUser}
          >{bucket}</Link>
        </span>
      )
    }
    case SourceType.Domain:
      return sourceDomain
    case SourceType.Ip: {
      const ips = sourceIPs
      return `${ips[0]} 等共 ${ips.length} 个`
    }
    case SourceType.Advanced: {
      const sources = advancedSources
      return `${sources[0].addr} 等共 ${sources.length} 个`
    }
    default:
  }
  return '未知'
}
