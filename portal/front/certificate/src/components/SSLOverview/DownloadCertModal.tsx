/*
 * @file component DownloadCertModal in SSLOverview
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observable, computed, action, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Modal from 'react-icecream/lib/modal'

import { shortNameToInfo } from '../../utils/certificate'
import SslApis, { IOrderDetail } from '../../apis/ssl'
import DownloadCertForm from './DownloadCertForm'
import DrawerStore from '../../stores/drawer'

export interface IDownloadCertModal {
  store: DownloadCertModalStore
}

export default observer(function _DownloadCertModal({ store }: IDownloadCertModal) {
  return (
    <Modal
      title="证书下载"
      visible={store.visible}
      onCancel={() => store.cancel()}
      footer={null}
      width="50%"
    >
      <div className="lightbox-form-wrap">
        <DownloadCertForm
          {...store.certFormData}
        />
      </div>
    </Modal>
  )
})

enum LoadingType {
  GetOrderDetail = 'GetOrderDetail'
}

const defaultCertFormData = {
  certId: '',
  brand: '',
  sslType: ''
}

export class DownloadCertModalStore extends DrawerStore<string, IOrderDetail> {

  loading = Loadings.collectFrom(this, LoadingType)

  constructor(
    toasterStore: ToasterStore,
    private sslApis: SslApis
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, toasterStore)
  }

  @observable.ref order?: IOrderDetail

  @computed get isLoading() {
    return !this.loading.isAllFinished()
  }

  @computed get certFormData() {
    if (!this.order) {
      return defaultCertFormData
    }

    const { product_short_name, certID } = this.order
    const certBaseInfo = shortNameToInfo(product_short_name)

    return {
      certId: certID,
      brand: certBaseInfo.brand,
      sslType: certBaseInfo.certType
    }
  }

  @action updateOrder(order: IOrderDetail) {
    this.order = order
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetOrderDetail)
  getOrderDetail(orderId: string) {
    return this.sslApis.fetchOrderPrepareInfo(orderId)
      .then(order => this.updateOrder(order))
  }

  init() {
    this.addDisposer(reaction(
      () => this.extra,
      orderId => {
        this.getOrderDetail(orderId!)
      }
    ))
  }
}
