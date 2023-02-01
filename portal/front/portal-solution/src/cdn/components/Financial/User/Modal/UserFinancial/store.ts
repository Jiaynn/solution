/**
 * @file User Financial store
 * @author linchen <linchen@qiniu.com>
 */

import { FormState } from 'formstate-x'
import autobind from 'autobind-decorator'
import { observable, autorun, action, reaction, computed } from 'mobx'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { UnknownException } from 'qn-fe-core/exception'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { ModalStore, IModalProps } from 'cdn/stores/modal'

import { ChargeType, ChargeRadix } from 'cdn/constants/oem'

import * as chargeTypeInput from 'cdn/components/Financial/common/Inputs/ChargeTypeInput'
import * as subChargeTypeInput from 'cdn/components/Financial/common/Inputs/SubChargeInput'
import * as chargeUnitPriceInput from 'cdn/components/Financial/common/Inputs/UnitPriceInput'
import * as chargeRadixInput from 'cdn/components/Financial/common/Inputs/ChargeRadixInput'
import * as chargeCoefficientInput from 'cdn/components/Financial/common/Inputs/ChargeCoefficientInput'

import FinancialApis, { IFinancialBase } from 'cdn/apis/oem/financial'

interface IExtraProps {
  uid: number
  name: string
}

export type Props = IExtraProps & IModalProps<Value>

export class UserFinancialModalStore extends ModalStore<IExtraProps, Value> {}

export type State = FormState<{
  chargeType: chargeTypeInput.State
  subChargeType: subChargeTypeInput.State
  unitPrice: chargeUnitPriceInput.State
  radix: chargeRadixInput.State
  coefficient: chargeCoefficientInput.State
}>

export type Value = IFinancialBase

function createState(value?: IFinancialBase): State {
  const chargeType = chargeTypeInput.createState(value?.chargeType ?? ChargeType.Traffic)
  const subChargeType = subChargeTypeInput
    .createState(value?.subChargeType)
    .disableValidationWhen(() => chargeType.value === ChargeType.Traffic)
  const formState = new FormState({
    chargeType,
    subChargeType,
    radix: chargeRadixInput.createState(value?.radix),
    unitPrice: chargeUnitPriceInput.createState(value?.unitPrice),
    coefficient: chargeCoefficientInput.createState(value?.coefficient)
  })

  return formState
}

function getValue(state: State): Value {
  return {
    ...state.value,
    coefficient: chargeCoefficientInput.getValue(state.$.coefficient),
    unitPrice: chargeUnitPriceInput.getValue(state.$.unitPrice)
  }
}

enum LoadingType {
  GetFinancialDetail = 'getFinancialDetail'
}

@injectable()
export class UserFinancialStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  @observable.ref financial?: IFinancialBase
  @observable.ref formState = createState()

  constructor(
    @injectProps() protected props: Props,
    private toasterStore: Toaster,
    private financialApis: FinancialApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @computed get isLoading() {
    return this.loadings.isLoading(LoadingType.GetFinancialDetail)
  }

  @action.bound
  updateFinancialDetail(financial: IFinancialBase) {
    this.financial = financial
  }

  @action.bound
  updateFormState(formState: State) {
    this.formState = formState
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

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.GetFinancialDetail)
  getFinancialDetail(uid: number) {
    return this.financialApis.getFinancialDetail(uid).then(this.updateFinancialDetail)
  }

  init() {
    this.addDisposer(autorun(() => {
      if (this.props.visible && this.props.uid) {
        this.getFinancialDetail(this.props.uid)
      }
    }))

    this.addDisposer(reaction(
      () => this.financial,
      financial => {
        this.updateFormState(createState(financial))
      }
    ))

    this.addDisposer(reaction(
      () => this.formState.$.chargeType.value,
      chargeType => {
        if (this.financial && this.financial.chargeType) {
          return
        }
        this.formState.$.radix.set(
          chargeType === ChargeType.Bandwidth
            ? ChargeRadix.Radix1000
            : ChargeRadix.Radix1024
        )
      },
      { fireImmediately: true }
    ))
  }
}
