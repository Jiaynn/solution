/**
 * @file Current Bill Store
 * @author linchen <linchen@qiniu.com>
 */

import moment from 'moment'
import autobind from 'autobind-decorator'
import { computed, observable, action, autorun } from 'mobx'

import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { ModalStore, IModalProps } from 'cdn/stores/modal'

import FinancialApis, { IBillBase, IBill } from 'cdn/apis/oem/financial'

enum LoadingType {
  GetCurrentBill = 'getCurrentBill'
}

interface IExtraProps {
  uid: number
  name: string
}

export type Props = IExtraProps & IModalProps

@injectable()
export class BillStore extends Store {
  @observable.ref bill?: IBillBase

  loadings = Loadings.collectFrom(this, LoadingType)

  constructor(
    @injectProps() protected props: Props,
    private toasterStore: Toaster,
    private financialApis: FinancialApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @action.bound updateCurrentBill(bill: IBillBase) {
    this.bill = bill
  }

  @computed get billForListView(): IBill[] {
    return this.bill && this.bill.chargeType
      ? [{ ...this.bill, uid: this.props.uid, month: parseInt(moment().format('YYYYMM'), 10) }]
      : []
  }

  @computed get isLoading() {
    return this.loadings.isLoading(LoadingType.GetCurrentBill)
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.GetCurrentBill)
  getCurrentBill() {
    return this.financialApis.getCurrentBill(this.props.uid).then(this.updateCurrentBill)
  }

  init() {
    this.addDisposer(autorun(() => this.props.visible && this.getCurrentBill()))
  }
}

export class CurrentBillModalStore extends ModalStore<IExtraProps> {}
