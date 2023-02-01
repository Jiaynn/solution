/**
 * @file certificate store
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { computed, observable, action } from 'mobx'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import CertificateApis, { CertStatResponse } from 'cdn/apis/certificate'

enum LoadingType {
  CertStat = 'certStat'
}

@injectable()
export default class LocalStore extends Store {
  constructor(
    private toasterStore: Toaster,
    private certificateApis: CertificateApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, LoadingType)

  @observable.ref certStat?: CertStatResponse

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @action.bound
  updateCertStat(certStat: CertStatResponse) {
    this.certStat = certStat
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.CertStat)
  fetchCertStat() {
    return this.certificateApis.getCertStat().then(this.updateCertStat)
  }

  init() {
    this.fetchCertStat()
  }
}
