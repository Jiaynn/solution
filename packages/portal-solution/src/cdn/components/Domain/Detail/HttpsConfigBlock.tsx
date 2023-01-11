
import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ICertInfo } from 'portal-base/certificate'
import { Iamed } from 'portal-base/user/iam'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'

import {
  shouldForbidSslize,
  shouldForbidUnsslize,
  shouldForbidModifyHttpsCert
} from 'cdn/transforms/domain'

import IamInfo from 'cdn/constants/iam-info'
import { Protocol } from 'cdn/constants/domain'

import { IDomainDetail } from 'cdn/apis/domain'

import BlockTitle from './BlockTitle'
import ConfigTable from './ConfigTable'
import ConfigureButton from './ConfigureButton'
import ConfigStatus from './ConfigStatus'

export default React.forwardRef(function HttpsConfigBlock(props: {
  domain: IDomainDetail
  certInfo: ICertInfo
  loading: boolean
  handleConfigure: () => void
}, ref: React.Ref<HTMLElement>) {
  const { domain, certInfo, loading, handleConfigure } = props
  const { iamActions } = useInjection(IamInfo)

  const infoList = [
    {
      name: '开启 HTTPS',
      desc: '开启 HTTPS 安全加速，支持 SSL 证书绑定及 HTTPS 状态管理',
      value: <ConfigStatus enabled={domain.protocol === Protocol.Https} />
    },
    {
      name: '更换证书',
      desc: '更换即将过期或泄漏的证书',
      value: (certInfo && certInfo.name) || '无' // TODO: 获取证书名
    },
    {
      name: '强制 HTTPS',
      desc: (
        <p>
          开启后 HTTP 请求会强制跳转到 HTTPS 进行访问。
          <br />
          关闭时默认兼容用户的 HTTP/HTTPS 请求
        </p>
      ),
      value: <ConfigStatus enabled={domain.https.forceHttps} />
    },
    {
      name: 'HTTP/2 访问',
      desc: 'HTTP/2 是最新的 HTTP 协议，用以最小化网络延迟，提升网络速度，优化用户的网络使用体验；\n'
          + '如需使用请您先配置 HTTPS 证书',
      value: <ConfigStatus enabled={domain.https.http2Enable} />
    }
  ]

  const userInfo = useInjection(UserInfo)

  const renderOperations = (_: unknown, __: unknown, index: number) => ({
    props: {
      rowSpan: index === 0 ? infoList.length : 0
    },
    children: (
      <Iamed actions={[iamActions.UpdateHttps]}>
        <ConfigureButton
          shouldForbid={shouldForbidConfigure(domain, userInfo, certInfo)}
          onClick={handleConfigure}
        >
          修改配置
        </ConfigureButton>
      </Iamed>
    )
  })

  return (
    <section ref={ref} className="content-block">
      <BlockTitle>HTTPS 配置</BlockTitle>
      <ConfigTable
        configList={infoList}
        loading={loading}
        renderOperations={renderOperations}
      />
    </section>
  )
})

function shouldForbidConfigure(domain: IDomainDetail, userInfo: UserInfo, certInfo: ICertInfo) {
  if (domain.protocol === Protocol.Http) {
    return shouldForbidSslize(domain, userInfo)
  }
  return shouldForbidModifyHttpsCert(domain) && shouldForbidUnsslize(domain, userInfo, certInfo)
}
