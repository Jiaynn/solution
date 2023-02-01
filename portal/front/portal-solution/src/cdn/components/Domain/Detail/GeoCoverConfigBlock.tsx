/**
 * @file Geo Coverage Config component
 * @description 域名加速覆盖区域的切换。 禁止修改若 1. 该域名未进行 ICP 备案
 * @author hejinxin <hejinxin@hejinxin.com>
 */

import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import { isEmpty } from 'lodash'
import autobind from 'autobind-decorator'
import { useInjection } from 'qn-fe-core/di'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { useLocalStore, injectProps } from 'qn-fe-core/local-store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { ICertInfo } from 'portal-base/certificate'
import { UserInfoStore } from 'portal-base/user/account'
import Spin from 'react-icecream/lib/spin'
import Modal from 'react-icecream/lib/modal'
import Button from 'react-icecream/lib/button'

import { isBucketOversea, shouldForbidModifyGeoCover } from 'cdn/transforms/domain'

import { ModalStore } from 'cdn/stores/modal'

import BucketStore from 'cdn/stores/bucket'

import { isQiniu } from 'cdn/constants/env'
import { OperatingState, DomainType, SourceType } from 'cdn/constants/domain'

import TipIcon from 'cdn/components/TipIcon'
import DomainGeoCoverInput, * as domainGeoCoverInput from 'cdn/components/Domain/Inputs/GeoCoverInput'

import DomainApis, { IDomainDetail } from 'cdn/apis/domain'

import './style.less'

export interface Props {
  domain: IDomainDetail
  hasIcp: boolean
  certInfo?: ICertInfo
  onConfigOk: () => void
}

export default observer(function GeoCoverConfigBlock(props: Props) {
  const store = useLocalStore(GeoCoverConfigStore, props)
  const { onSubmit, ...restModalProps } = store.geoCoverModal.bind()

  const alertTips = [
    isQiniu && '调整加速区域后，流量价格按对应区域计费',
    '海外暂时不支持 IPv6 访问'
  ].filter(Boolean)
  const geoCoverAlert = (
    <div className="domain-detail-alert">
      {alertTips.join('；')}。
    </div>
  )

  const userInfoStore = useInjection(UserInfoStore)
  const shouldForbid = shouldForbidModifyGeoCover(props.domain, userInfoStore, props.certInfo)

  if (store.isTestDomain) {
    return null
  }

  return (
    <>
      <Button
        onClick={store.openModal}
        className="basic-block-btn"
        disabled={!!shouldForbid}
        type="link"
      >
        {
          store.isDomainProcessing ? '处理中' : '修改'
        }
      </Button>
      { shouldForbid && <TipIcon className="basic-block-tip" tip={shouldForbid} /> }
      <Modal
        title="修改覆盖区域"
        className="basic-block-modal"
        okButtonProps={{
          disabled: store.shouldDisableOkButton
        }}
        onOk={onSubmit}
        {...restModalProps}
      >
        <Spin spinning={store.isLoading}>
          {geoCoverAlert}
          <div className="basic-block-content">
            <DomainGeoCoverInput
              hasIcp={props.hasIcp}
              isCNBucket={store.isCNBucket}
              state={store.state}
            />
          </div>
        </Spin>
      </Modal>
    </>
  )
})

@injectable()
class GeoCoverConfigStore extends Store {
  geoCoverModal = new ModalStore()

  constructor(
    @injectProps() protected props: Props,
    private toasterStore: Toaster,
    private bucketStore: BucketStore,
    private domainApis: DomainApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @observable.ref state = domainGeoCoverInput.createState(this.props.domain.geoCover)

  @computed
  get isLoading() {
    return !this.bucketStore.bucketsFetched
  }

  @computed get isCNBucket() {
    const { sourceQiniuBucket, sourceType } = this.props.domain.source
    const bucketInfo = this.bucketStore.getBucket(sourceQiniuBucket)
    return !isEmpty(bucketInfo) && sourceType === SourceType.QiniuBucket && !isBucketOversea(bucketInfo!.zone)
  }

  @autobind
  @Toaster.handle()
  openModal() {
    return this.geoCoverModal.open()
      .then(() => {
        const name = this.props.domain.name

        return this.domainApis.updateGeoCover(name, {
          domains: [name],
          geoCover: this.state.value,
          notifyUser: true
        })
      })
      .then(() => {
        this.props.onConfigOk()
      })
  }

  /* 测试域名不提供域名覆盖区域修改 */
  @computed get isTestDomain() {
    return this.props.domain.type === DomainType.Test
  }

  @computed get isDomainProcessing() {
    return this.props.domain.operatingState === OperatingState.Processing
  }

  @computed get shouldDisableOkButton() {
    return this.state.value === this.props.domain.geoCover
  }

  init() {
    this.addDisposer(this.state.dispose)
    this.addDisposer(this.geoCoverModal.dispose)
  }
}
