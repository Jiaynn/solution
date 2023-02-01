
import { ICertInfo } from 'portal-base/certificate'

import { isEnabled as isIpACLEnabled } from 'cdn/transforms/domain/ip-acl'
import { isEnabled as isBsAuthEnabled } from 'cdn/transforms/domain/bs-auth'
import { isEnabled as isTimeRefererEnabled } from 'cdn/transforms/domain/time-referer'
import { isEnabled as isRefererEnabled } from 'cdn/transforms/domain/referer'
import { forbidByCertExpiredAndForceHttps, isSecondLevelDomain } from 'cdn/transforms/domain'

import { CertInputType, DomainType } from 'cdn/constants/domain'

import { IHttpsConfig } from 'cdn/components/Domain/Inputs/HttpsConfigInput/ForEdit'

import { IHttps, IFreeCertForHttps, IDomainDetail } from 'cdn/apis/domain'

export function transformHttpsConfigForSubmit(
  { certInputType, certId, uploadCertId, forceHttps, http2Enable }: IHttpsConfig,
  domain: IDomainDetail
): IHttps | IFreeCertForHttps | undefined {
  switch (certInputType) {
    case CertInputType.Existed:
      return {
        ...domain.https,
        certId,
        forceHttps,
        http2Enable
      }
    case CertInputType.Local:
      return {
        ...domain.https,
        certId: uploadCertId,
        forceHttps,
        http2Enable
      }
    case CertInputType.Free:
      return {
        forceHttps,
        http2Enable,
        freeCert: true
      }
    default:
  }
}

// 判断域名是否可以申请免费 HTTPS 证书
export function shouldForbidFreeCert(domain: IDomainDetail) {
  if (domain.type !== DomainType.Normal) {
    return '当前域名不是普通域名'
  }
  return null
}

// 判断域名是否可以自动（一键）申请免费 HTTPS 证书
export function shouldForbidAutoFreeCert(domain: IDomainDetail, certInfo?: ICertInfo) {
  if (forbidByCertExpiredAndForceHttps(domain, certInfo)) {
    return '当前域名正在使用的证书已过期且配置为“强制 HTTPS 访问”'
  }
  // 目前的实现要求域名未开启访问控制（以便自动实现验证过程）
  if (isBsAuthEnabled(domain.bsauth)) {
    return '当前域名开启了回源鉴权功能'
  }
  if (isTimeRefererEnabled(domain.timeACL)) {
    return '当前域名开启了时间戳防盗链功能'
  }
  if (isIpACLEnabled(domain.ipACL)) {
    return '当前域名开启了 IP 黑白名单功能'
  }
  if (isRefererEnabled(domain.referer)) {
    return '当前域名开启了 Referer 防盗链功能'
  }
  if (isSecondLevelDomain(domain.name)) {
    return '当前域名是二级域名'
  }
  if (domain.name.startsWith('www')) {
    return '当前域名是以 www 开头的特殊域名'
  }
}
