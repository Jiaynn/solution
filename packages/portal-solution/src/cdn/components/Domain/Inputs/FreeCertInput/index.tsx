import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import Checkbox, { CheckboxChangeEvent } from 'react-icecream/lib/checkbox'
import { ICertInfo } from 'portal-base/certificate'

import { shouldForbidAutoFreeCert, shouldForbidFreeCert } from 'cdn/transforms/domain/https-config'
import { forbidByCertExpiredAndForceHttps } from 'cdn/transforms/domain'

import { IDomainDetail } from 'cdn/apis/domain'

import './style.less'

export interface IFreeCertInputProps {
  value: boolean
  needConfigureCname: boolean
  onChange: (value: boolean) => void
  domain: IDomainDetail
  certInfo?: ICertInfo
  error?: any
}

@observer
export default class FreeCertInput extends React.Component<
  IFreeCertInputProps,
  {}
> {

  constructor(props: IFreeCertInputProps) {
    super(props)
    makeObservable(this)
  }

  @computed get cnameConfigureMessage() {
    const { needConfigureCname } = this.props
    return needConfigureCname
      ? (
        <p className="warning-message">
          请配置 CNAME&nbsp;
          <a
            className="cname-help-link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://developer.qiniu.com/fusion/kb/1322/how-to-configure-cname-domain-name"
          >
            如何配置
          </a>
        </p>
      )
      : null
  }

  render() {
    const { domain, value: agreeLicense, onChange, certInfo } = this.props

    if (shouldForbidFreeCert(domain)) {
      return <ForbidFreeCertWarning msg={shouldForbidFreeCert(domain)!} />
    }

    if (shouldForbidAutoFreeCert(domain, certInfo)) {
      return (
        <ForbidAutoFreeCertWarning
          domain={domain}
          certInfo={certInfo}
        />
      )
    }

    return (
      <div className="free-cert-input">
        <div className="content">
          <div>使用七牛云 DV 版免费证书需要注意：</div>
          <div>
            1.免费证书只支持绑定单个普通域名，若您需要使用一级域名的免费证书，请到
            <a target="_blank" rel="noopener noreferrer" href={`${window.location.origin}/certificate/apply`}>
              购买证书
            </a>
            页购买免费证书
          </div>
          <div>
            2.开启了以下功能会导致代理验证失败，无法代理申请证书：
            回源鉴权、时间戳防盗链、IP 黑白名单、referer 防盗链和证书到期后的强制 HTTPS 访问
          </div>
          <div>
            3.当前加速域名需要 CNAME 到七牛给您分配的 CNAME 域名&nbsp;
            {this.cnameConfigureMessage}
          </div>
          <div>
            4.当前加速域名的 DNS 记录中不能有 CAA 记录，或者 CAA 记录包含
            Digicert.com 和 digicert.com
          </div>
          <div>5.免费证书有效期为一年，过期请重新申请</div>
          <div>6.需要授权七牛云代申请免费证书</div>
          <div>7.
            <p className="warning-message">免费证书申请耗时相对较长，平均需要 15 分钟，期间域名访问不受到影响，部分配置不可修改</p>
          </div>
        </div>
        <div className="agree">
          <Checkbox
            checked={agreeLicense}
            onChange={(e: CheckboxChangeEvent) => onChange(e.target.checked)}
          >
            <span className="agreeDesc">同意七牛云代申请免费证书</span>
          </Checkbox>
        </div>
      </div>
    )
  }
}

function ForbidFreeCertWarning(props: { msg: string }) {
  return (
    <div className="warning-message-box">
      {props.msg}，暂不支持免费证书。您可以前往七牛云证书服务处购买符合条件的证书或上传本地证书。
      <a
        className="cname-help-link"
        href="/certificate/ssl"
        target="_blank"
      >
        七牛云证书服务
      </a>
    </div>
  )
}

function ForbidAutoFreeCertWarning(props: { domain: IDomainDetail, certInfo?: ICertInfo }) {
  const msg = shouldForbidAutoFreeCert(props.domain, props.certInfo)
  const information = forbidByCertExpiredAndForceHttps(props.domain, props.certInfo)
    ? (
      <>
        {msg}，因此暂不支持自动申请免费证书。您可以强制关闭“强制 HTTPS 访问”后申请或直接在
        <a
          className="cname-help-link"
          href="/certificate/ssl"
          target="_blank"
        >
          七牛云证书服务
        </a>
        购买证书。
      </>
    )
    : (
      <>
        {msg}，暂不支持自动申请免费证书。您可以前往
        <a
          className="cname-help-link"
          href="/certificate/ssl"
          target="_blank"
        >
          七牛云证书服务
        </a>
        处申请并按照提示进行操作。
      </>
    )
  return (
    <div className="warning-message-box">
      {information}
    </div>
  )
}
