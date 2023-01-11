/**
 * @file IP 协议
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { useInjection } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { observeInjectable as injectable } from 'qn-fe-core/store'
import { useLocalStore, injectProps } from 'qn-fe-core/local-store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Iamed } from 'portal-base/user/iam'
import { ICertInfo } from 'portal-base/certificate'
import Modal from 'react-icecream/lib/modal'
import Button from 'react-icecream/lib/button'

import { shouldForbidModifyIpTypes } from 'cdn/transforms/domain'

import { ModalStore } from 'cdn/stores/modal'

import IamInfo from 'cdn/constants/iam-info'
import { GeoCover, IpTypes, OperatingState } from 'cdn/constants/domain'

import IpTypesInput, * as ipTypesInput from 'cdn/components/Domain/Inputs/IpTypesInput'

import TipIcon from 'cdn/components/TipIcon'

import DomainApis, { IDomainDetail } from 'cdn/apis/domain'

export interface Props {
  domain: IDomainDetail
  certInfo?: ICertInfo
  onConfigOk: () => void
}

export default observer(function IpTypesConfigBlock(props: Props) {
  const { domain, certInfo } = props
  const store = useLocalStore(IpTypesConfigStore, props)
  const shouldForbid = shouldForbidModifyIpTypes(domain, certInfo)
  const { onSubmit, ...restModalProps } = store.ipTypesModal.bind()
  const { iamActions } = useInjection(IamInfo)

  if (domain.geoCover === GeoCover.Foreign && domain.ipTypes !== IpTypes.IPv6) {
    return null
  }

  return (
    <Iamed actions={[iamActions.UpdateIPv6]}>
      <Button
        onClick={store.openModal}
        className="basic-block-btn"
        disabled={!!shouldForbid}
        type="link"
      >
        {store.isDomainProcessing ? '处理中' : '修改'}
      </Button>
      {shouldForbid && <TipIcon className="basic-block-tip" tip={shouldForbid} />}
      <Modal
        title="修改 IP 协议"
        className="basic-block-modal"
        okButtonProps={{
          disabled: store.shouldDisableOkButton
        }}
        onOk={onSubmit}
        {...restModalProps}
      >
        <div className="basic-block-content">
          <IpTypesInput state={store.state} geoCover={domain.geoCover} />
        </div>
      </Modal>
    </Iamed>
  )
})

@injectable()
class IpTypesConfigStore extends Disposable {
  ipTypesModal = new ModalStore()

  constructor(
    @injectProps() protected props: Props,
    private toasterStore: Toaster,
    private domainApis: DomainApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @observable.ref state = ipTypesInput.createState(this.props.domain.ipTypes)

  @autobind
  @Toaster.handle()
  openModal() {
    return this.ipTypesModal.open()
      .then(() => this.domainApis.updateIpTypes(this.props.domain.name, {
        ipTypes: this.state.value
      }))
      .then(() => {
        this.props.onConfigOk()
      })
  }

  @computed get isDomainProcessing() {
    return this.props.domain.operatingState === OperatingState.Processing
  }

  @computed get shouldDisableOkButton() {
    return this.state.value === this.props.domain.ipTypes
  }

  init() {
    this.addDisposer(this.state.dispose)
    this.addDisposer(this.ipTypesModal.dispose)
  }
}
