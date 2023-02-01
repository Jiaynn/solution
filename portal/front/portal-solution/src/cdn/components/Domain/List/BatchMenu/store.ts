/**
 * @file batch menu store
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import { UnknownException } from 'qn-fe-core/exception'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { I18nStore } from 'portal-base/common/i18n'

import { OperationType, batchOperationTypeTextMap, batchOperationTypes, refreshDelay } from 'cdn/constants/domain'

import DomainApis, { IBatchResponse, IDomain } from 'cdn/apis/domain'

import { PwdConfirmStore } from '../../PwdConfirm'
import * as messages from './messages'
import { IProps } from '.'

@injectable()
export default class LocalStore extends Store {
  pwdConfirmStore = new PwdConfirmStore()

  constructor(
    @injectProps() protected props: IProps,
    private toasterStore: Toaster,
    private domainApis: DomainApis,
    private i18n: I18nStore
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @Toaster.handle()
  async onSubmit(type: OperationType, operableDomains: IDomain[]) {
    const options = {
      domainNames: operableDomains.map(li => li.name)
    }

    const res = await (() => {
      switch (type) {
        case OperationType.OnlineDomain:
          return this.domainApis.batchOnline(options)
        case OperationType.OfflineDomain:
          return this.domainApis.batchOffline(options)
        case OperationType.UnfreezeDomain:
          return this.domainApis.batchUnfreeze(options)
        case OperationType.DeleteDomain:
          return this.domainApis.batchDelete(options)
        default:
          throw new UnknownException(this.i18n.t(messages.checkOperationType))
      }
    })()

    return this.handleBatchResult(res, type)
  }

  @autobind
  handleBatchResult(data: IBatchResponse, type: OperationType) {
    const failedDomainNames = data.batchResp.map(it => it.failDomains)
    const failedCount = failedDomainNames.length
    const t = this.i18n.t
    const operationText = t(batchOperationTypeTextMap[type as typeof batchOperationTypes[number]])

    if (failedCount === 0) {
      this.toasterStore.success(t(messages.batchOperationSuccess, operationText))
      setTimeout(() => {
        this.props.onRefresh()
      }, refreshDelay)
    } else if (failedCount === this.props.domains.length) {
      this.toasterStore.error(t(messages.batchOperationFailure, operationText))
    } else {
      this.toasterStore.error(t(messages.batchOperationPartialFailure, operationText))
      setTimeout(() => {
        this.props.onRefresh(failedDomainNames)
      }, refreshDelay)
    }
  }

  init() {
    this.addDisposer(this.pwdConfirmStore.dispose)
  }
}
