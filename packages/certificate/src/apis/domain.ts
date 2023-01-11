/**
 * @file Domain API
 * @author zhuhao <zhuhao@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'

import { DomainStatus, CertExpireSort, Protocol } from '../constants/domain'
import { SslClient } from './client'

export interface ISearchDomainOptions {
  from: number
  size: number
  currentCertId?: string
  currentOrderId?: string
  currentCertNames: string[]
  currentCertFilter?: boolean
  certExpiredSort?: CertExpireSort
  canDeployFilter?: boolean
}

export interface IDeployDomainCertInfo {
  certId: string
  certName: string
  expiredTime: string
}

export interface IDeployDomain {
  certInfo: IDeployDomainCertInfo
  domainName: string
  domainStatus: DomainStatus
  isCurrentCert: boolean
  isOrdered: boolean
  protocol: Protocol
  canDeploy: boolean
}

export interface ISearchDomain {
  domains: IDeployDomain[]
  total: number
  from: number
  size: number
}

export interface ISslizeOptions {
  certid: string
  domainNames: string[]
}

export interface IDeployResult {
  // domainNames 表示部署失败的域名
  domainNames: string[]
}

@injectable()
export default class DomainApis {
  constructor(private sslClient: SslClient) { }

  searchDomain(options: ISearchDomainOptions) {
    const { currentCertFilter, canDeployFilter, ...otherOptions } = options
    let domainSearchOptions: ISearchDomainOptions = otherOptions
    if (currentCertFilter != null) {
      domainSearchOptions = { ...domainSearchOptions, currentCertFilter }
    }
    if (canDeployFilter != null) {
      domainSearchOptions = { ...domainSearchOptions, canDeployFilter }
    }
    return this.sslClient.get<ISearchDomain>('/domainsearch', domainSearchOptions)
  }

  sslize(options: ISslizeOptions) {
    return this.sslClient.post<IDeployResult>('/sslize', options)
  }

  updateHttpsConf(options: ISslizeOptions) {
    return this.sslClient.post<IDeployResult>('/https/conf', options)
  }
}
