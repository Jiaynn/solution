/**
 * @file certification api
 * @description certification 相关的接口
 * @author yinxulai <me@yinxulai.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'

import { KodoCommonClient } from 'portal-base/kodo/apis/common'
import { KodoProxyApiException, KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy, kodov2 } from 'kodo/constants/apis'

// TODO：通过自定义 client._send 支持接口自定义 errorMassage
const messageMap = new Map<(RegExp | string), string>([
  ['invalid id', '无效的 ID'],
  ['invalid domain', '请检查域名'],
  ['certification name too long', '证书名称过长'],
  ['invalid X.509 PEM certification', '证书不符合 X.509 PEM 规范'],
  ['invalid PKCS1/PKCS8 private key', '证书私钥不符合 PKCS1/PKCS8 规范'],
  [/certification expire day should more than (\d*) days/, '证书的有效期不足 $1 天']
])

// one certificate 特有的 produceError
async function produceError(error: unknown): Promise<any> {
  if (error instanceof KodoProxyApiException) {
    const errorKey = error.payload.error
    if (!errorKey) throw error

    // 处理 map
    messageMap.forEach((message, key) => {
      if (key === errorKey) {
        throw error.withMessage(message)
      }

      if (key instanceof RegExp && key.test(errorKey)) {
        // 支持正则替换
        // 例如配置为：[/abc(\d*)/, '包含数字 $1']
        // 当 `errorKey` 为 `abc123` 时, `message` 输出结果为: '包含数字 123'
        throw error.withMessage(errorKey.replace(key, message))
      }
    })
  }

  throw error
}

export interface IAddCertificateOptions {
  ca: string
  pri: string
  name: string
}

export interface ICertificate {
  uid: number
  name: string
  certid: string
  dnsnames: string[]
  not_after: number
  not_before: number
  common_name: string
  auto_renew: boolean
  cert_type: string
  child_order_id: string
  create_time: number
  enable: boolean
  encrypt: string
  encryptParameter: string
  orderid: string
  product_short_name: string
  product_type: string
  state: string
}

export interface ICertificateDetail extends ICertificate {
  ca: string
  pri: string
}

export interface ICertificateWithDomain {
  uid: number
  name: string // 证书别名
  certid: string // 证书 id
  domain: string // 绑定的域名
}

@autobind
@injectable()
export class CertificateApis {
  constructor(
    private kodoCommonClient: KodoCommonClient,
    private kodoProxyClient: KodoProxyClient
  ) { }

  // 添加证书
  addCertificate(options: IAddCertificateOptions): Promise<void> {
    return this.kodoProxyClient.post<void>(
      `${proxy.certificate}`,
      options
    ).catch(produceError)
  }

  // 删除证书
  deleteCertificate(id: string): Promise<void> {
    return this.kodoProxyClient.delete<void>(
      `${proxy.certificate}/${id}`
    ).catch(produceError)
  }

  getCertificate(certId: string): Promise<{ cert: ICertificateDetail }> {
    return this.kodoProxyClient.get<{ cert: ICertificateDetail }>(
      proxy.certificate + '/' + certId
    ).catch(produceError)
  }

  // 获取所有的证书
  getCertificates(): Promise<{ certs: ICertificate[] }> {
    return this.kodoProxyClient.get<{ certs: ICertificate[] }>(
      proxy.certificate
    ).catch(produceError)
  }

  // 通过域名查询绑定的证书
  getCertificatesByDomain(domain: string): Promise<ICertificate[]> {
    return this.kodoProxyClient.get<ICertificate[]>(
      `${proxy.getCertificatesByDomain}/${domain}`
    ).catch(produceError)
  }

  // 获取所有绑定域名的证书
  getCertificatesWithDomain(): Promise<ICertificateWithDomain[]> {
    return this.kodoCommonClient.get(kodov2.getCertificatesWithDomain, {})
  }

  // 给域名绑定证书
  bindCertificateToDomain(domain: string, certId: string): Promise<void> {
    return this.kodoProxyClient.post<void>(
      proxy.bindCertificateToDomain,
      { domain, certid: certId }
    ).catch(produceError)
  }

  // 解绑域名证书
  unbindCertificateWithDomain(domain: string, certId: string): Promise<void> {
    return this.kodoProxyClient.post<void>(
      proxy.unbindCertificateWithDomain,
      { domain, certid: certId }
    ).catch(produceError)
  }
}
