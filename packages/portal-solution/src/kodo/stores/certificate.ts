/**
 * @file certification store
 * @author yinxulai <me@yinxulai.cn>
 */

import autobind from 'autobind-decorator'
import { observable, computed, action, makeObservable } from 'mobx'
import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import { Loadings } from 'portal-base/common/loading'

import { valuesOfEnum } from 'kodo/utils/ts'

import { CertificateApis, ICertificate, IAddCertificateOptions, ICertificateWithDomain } from 'kodo/apis/certificate'

// store 的 loading 是指 store 内数据的可用状态
export enum Loading {
  Certificate = 'Certificate', // 全部的证书数据的 loading 状态
  CertificateWithDomain = 'CertificateWithDomain' // 已绑定域名的证书数据的 loading 状态
}

@injectable()
export class CertStore extends Store {
  constructor(private certificateApis: CertificateApis) {
    super()
    makeObservable(this)
  }

  // loadings
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))
  // 全部的证书数据 name => certification 全部的证书
  certificateMap = observable.map<string, ICertificate>(undefined, { deep: false })

  // 已绑定域名的证书 domain => certification
  certificationWithDomainMap = observable.map<string, ICertificateWithDomain>(undefined, { deep: false })

  @computed
  get idList() {
    return [...this.certificateMap.keys()]
  }

  @computed
  get certificationList() {
    return this.idList.map(certid => this.certificateMap.get(certid)!)
  }

  @computed
  get isLoadingCertificate() {
    return this.loadings.isLoading(Loading.Certificate)
  }

  @computed
  get isLoadingCertificateWithDomain() {
    return this.loadings.isLoading(Loading.CertificateWithDomain)
  }

  @computed
  get isLoading() {
    return !this.loadings.isAllFinished()
  }

  // 获取指定域名可用的证书
  @autobind
  getSuitableListByDomain(domain?: string) {
    if (!domain) {
      return []
    }

    const rules = [domain]
    if (domain.indexOf('.') !== -1) {
      // *.com 泛证书适用, ssl 不支持多级泛域名证书
      rules.push(domain.replace(/^[^.]+/, '*'))
    }

    // 根据规则查询符合的证书
    return this.certificationList.filter(
      cert => rules.some(
        // 从证书的 dnsname 与 common_name 寻找与域名匹配的证书
        rule => cert.common_name === rule || cert.dnsnames && cert.dnsnames.includes(rule)
      )
    )
  }

  @autobind
  getProtocolByDomain(domain: string): 'https' | 'http' {
    return this.certificationWithDomainMap.get(domain) ? 'https' : 'http'
  }

  @action.bound
  updateCertificateMap(data: ICertificate | ICertificate[], force = false) {
    if (force) {
      this.certificateMap.clear()
    }

    if (!data) {
      return
    }

    if (!Array.isArray(data)) {
      this.certificateMap.set(data.certid, data)
      return
    }

    data.forEach(cert => this.certificateMap.set(cert.certid, cert))
  }

  @action.bound
  updateCertificateWithDomainMap(data: ICertificateWithDomain | ICertificateWithDomain[], force = false) {
    if (force) {
      this.certificationWithDomainMap.clear()
    }

    if (!data) {
      return
    }

    if (!Array.isArray(data)) {
      this.certificationWithDomainMap.set(data.domain, data)
      return
    }

    data.forEach(item => this.certificationWithDomainMap.set(item.domain, item))
  }

  // 获取所有证书的信息
  @autobind
  @Loadings.handle(Loading.Certificate)
  fetchList() {
    const req = this.certificateApis.getCertificates()
    req.then(res => this.updateCertificateMap(res.certs, true)).catch(() => { /**/ })
    return req
  }

  // 获取所有绑定了域名的证书
  @autobind
  @Loadings.handle(Loading.CertificateWithDomain)
  fetchListWithDomain() {
    const req = this.certificateApis.getCertificatesWithDomain()
    req.then(res => this.updateCertificateWithDomainMap(res, true)).catch(() => { /**/ })
    return req
  }

  // 添加证书
  @autobind
  add(options: IAddCertificateOptions) {
    const req = this.certificateApis.addCertificate(options)
    req.then(this.fetchList).catch(() => { /**/ })
    return req
  }

  // 删除证书
  @autobind
  delete(id: string) {
    const req = this.certificateApis.deleteCertificate(id)
    req.then(this.fetchList).catch(() => { /**/ })
    return req
  }

  // 给域名绑定证书
  @autobind
  bindDomain(domain: string, certId: string) {
    const req = this.certificateApis.bindCertificateToDomain(domain, certId)
    req.then(() => this.fetchListWithDomain()).catch(() => { /**/ })
    return req
  }

  // 解绑指定域名的证书
  @autobind
  unbindDomain(domain: string, certId: string) {
    const req = this.certificateApis.unbindCertificateWithDomain(domain, certId)
    req.then(() => this.fetchListWithDomain()).catch(() => { /**/ })
    return req
  }
}
