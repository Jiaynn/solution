/**
 * @file certificate apis
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'

import DomainProxyClient from './clients/domain-proxy'

export type CertStatResponse = {
  // 已部署至 CDN 域名的证书总数
  used: number
  // 待续费证书数量
  renewable: number
}

// TODO: portal-base 有一个 SslProxyClient，由于 prefix 不同所以暂时不能复用
@injectable()
export default class CertificateApis {
  constructor(
    private client: DomainProxyClient
  ) {}

  // 获取证书概览数据
  getCertStat(): Promise<CertStatResponse> {
    return this.client.get('/domain/cert/stat', null, { withProduct: true })
  }
}
