/**
 * @file Update Bill Store
 * @author linchen <linchen@qiniu.com>
 */

import moment from 'moment'
import autobind from 'autobind-decorator'
import { action, observable, autorun, computed, reaction } from 'mobx'
import { FormState } from 'formstate-x'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { UnknownException } from 'qn-fe-core/exception'

import { transformCentToYuan } from 'cdn/transforms/financial'

import { ModalStore, IModalProps } from 'cdn/stores/modal'

import { ChargeType, ChargeRadix } from 'cdn/constants/oem'

import * as monthPickerInput from 'cdn/components/Financial/common/Inputs/DateRange/MonthPicker'
import * as chargeTypeInput from 'cdn/components/Financial/common/Inputs/ChargeTypeInput'
import * as subChargeTypeInput from 'cdn/components/Financial/common/Inputs/SubChargeInput'
import * as chargeUnitPriceInput from 'cdn/components/Financial/common/Inputs/UnitPriceInput'
import * as chargeRadixInput from 'cdn/components/Financial/common/Inputs/ChargeRadixInput'
import * as chargeCoefficientInput from 'cdn/components/Financial/common/Inputs/ChargeCoefficientInput'
import * as usageInput from 'cdn/components/Financial/common/Inputs/UsageInput'

import FinancialApis, { IUpdateBill, IBillDetail } from 'cdn/apis/oem/financial'

export type State = FormState<{
  month: monthPickerInput.State
  usageAmount: usageInput.State
  chargeType: chargeTypeInput.State
  subChargeType: subChargeTypeInput.State
  unitPrice: chargeUnitPriceInput.State
  radix: chargeRadixInput.State
  coefficient: chargeCoefficientInput.State
}>

export type Value = IUpdateBill

function createState(bill?: Partial<IBillDetail>): State {
  const month = bill?.month ?? parseInt(moment().subtract(1, 'month').format('YYYYMM'), 10)

  const chargeType = chargeTypeInput.createState(bill?.chargeType ?? ChargeType.Traffic)
  const subChargeType = subChargeTypeInput
    .createState(bill?.subChargeType)
    .disableValidationWhen(() => chargeType.value === ChargeType.Traffic)

  const formState = new FormState({
    chargeType,
    subChargeType,
    month: monthPickerInput.createState(moment(String(month), 'YYYYMM')),
    usageAmount: usageInput.createState(chargeType.value, bill?.usageAmount),
    unitPrice: chargeUnitPriceInput.createState(bill?.unitPrice),
    radix: chargeRadixInput.createState(bill?.radix ?? ChargeRadix.Radix1000),
    coefficient: chargeCoefficientInput.createState(bill?.coefficient)
  })

  return formState
}

function getValue(state: State): Value {
  return {
    ...state.value,
    month: parseInt(state.$.month.value.format('YYYYMM'), 10),
    unitPrice: chargeUnitPriceInput.getValue(state.$.unitPrice),
    coefficient: chargeCoefficientInput.getValue(state.$.coefficient),
    usageAmount: usageInput.getValue(state.$.usageAmount, state.$.chargeType.value)
  }
}

enum LoadingType {
  GetBillDetail = 'getBillDetail'
}

interface IExtraProps {
  uid: number
  name: string
  onFinancialConfig: () => void
}

export class UpdateBillModalStore extends ModalStore<IExtraProps, Value> {}

export type Props = IExtraProps & IModalProps<Value>

@injectable()
export class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  @observable.ref formState: State = createState()
  @observable.ref bill?: IBillDetail

  constructor(
    @injectProps() protected props: Props,
    private toasterStore: Toaster,
    private financialApis: FinancialApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @action.bound updateBill(bill: IBillDetail) {
    this.bill = bill
  }

  @action.bound
  updateFormState(formState: State) {
    this.formState = formState
  }

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @computed get currentMonth() {
    return this.formState.$.month.value ? this.formState.$.month.value.format('YYYYMM') : null
  }

  @computed get currentCost() {
    const { chargeType, unitPrice, usageAmount, radix, coefficient } = getValue(this.formState)
    if (!usageAmount || !unitPrice || !chargeType) {
      return 0
    }
    const value = chargeType === ChargeType.Traffic
      ? usageAmount / (radix ** 3) * (coefficient / 100) * unitPrice
      : usageAmount / (radix ** 2) * (coefficient / 100) * unitPrice
    return transformCentToYuan(Math.floor(value))
  }

  @computed get originCost() {
    return transformCentToYuan(this.bill?.monthCost ?? 0)
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.GetBillDetail)
  getBillDetail(uid: number, month: number) {
    return this.financialApis.getBillDetail(uid, month).then(this.updateBill)
  }

  @autobind
  @Toaster.handle()
  async handleSubmit() {
    const result = await this.formState.validate()
    if (result.hasError) {
      throw new UnknownException('请检查输入')
    }
    this.props.onSubmit(getValue(this.formState))
  }

  init() {
    this.addDisposer(autorun(() => (
      this.formState && this.addDisposer(this.formState.dispose)
    )))

    this.addDisposer(autorun(() => {
      if (this.props.uid && this.props.visible && this.currentMonth) {
        this.getBillDetail(this.props.uid, parseInt(this.currentMonth, 10))
      }
    }))

    this.addDisposer(reaction(
      () => this.bill,
      bill => {
        const currentMonth = this.currentMonth != null ? Number(this.currentMonth) : undefined
        this.updateFormState(createState({ month: currentMonth, ...bill }))
      }
    ))
  }
}
