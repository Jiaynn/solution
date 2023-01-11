/**
 * @file Update Bill Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import Drawer from 'react-icecream/lib/drawer'
import Spin from 'react-icecream/lib/spin'
import Form, { FormProps } from 'react-icecream/lib/form'
import PopupContainer from 'react-icecream/lib/popup-container'
import { useLocalStore } from 'qn-fe-core/local-store'

import { ChargeType } from 'cdn/constants/oem'

import Link from 'cdn/components/common/Link/LegacyLink'
import MonthPickerFormItem from 'cdn/components/Financial/common/Inputs/DateRange/MonthPicker'
import ChargeTypeFormItem from 'cdn/components/Financial/common/Inputs/ChargeTypeInput'
import SubChargeTypeFormItem from 'cdn/components/Financial/common/Inputs/SubChargeInput'
import UsageFormItem from 'cdn/components/Financial/common/Inputs/UsageInput'
import ChargeUnitPriceFormItem from 'cdn/components/Financial/common/Inputs/UnitPriceInput'
import ChargeRadixFormItem from 'cdn/components/Financial/common/Inputs/ChargeRadixInput'
import ChargeCoefficientFormItem from 'cdn/components/Financial/common/Inputs/ChargeCoefficientInput'

import { Props, LocalStore, State } from './store'

import './style.less'

export { UpdateBillModalStore } from './store'

const formProps: FormProps = {
  labelCol: {
    span: 3
  },
  wrapperCol: {
    push: 1,
    span: 20
  }
}

const FormView = observer(function _FormView(props: { store: LocalStore, formState: State}) {
  return (
    <Form {...formProps}>
      <MonthPickerFormItem
        extra={
          props.store.bill
            ? null
            : <span className="empty-bill-tip">当前月份账单不存在，请选择其他月份</span>
        }
        label="账单月份"
        state={props.formState.$.month}
      />
      <UsageFormItem
        chargeType={props.formState.$.chargeType.value}
        state={props.formState.$.usageAmount}
      />
      <ChargeTypeFormItem state={props.formState.$.chargeType} />
      {
        props.formState.$.chargeType.value !== ChargeType.Traffic && (
          <SubChargeTypeFormItem state={props.formState.$.subChargeType} />
        )
      }
      <ChargeUnitPriceFormItem
        state={props.formState.$.unitPrice}
        chargeType={props.formState.$.chargeType.value}
      />
      <ChargeRadixFormItem state={props.formState.$.radix} />
      <ChargeCoefficientFormItem state={props.formState.$.coefficient} />
    </Form>
  )
})

type BillTipProps = Pick<Props, 'onFinancialConfig'>

function BillTip(props: BillTipProps) {
  return (
    <Form.Item>
      <div className="bill-tip">
        <p className="bill-tip-title">注释</p>
        <div className="bill-tip-content">
          重新出账只对历史数据生效，修改的计费方式也仅本次生效，若需永久修改账户计费方式请前往
          <Link onClick={props.onFinancialConfig}>计费配置</Link>
        </div>
      </div>
    </Form.Item>
  )
}

interface IFooterExtraProps {
  month: string
  currentCost: number
  originCost: number
}

function FooterExtra(props: IFooterExtraProps) {
  return (
    <div className="price-footer-tip">
      <div className="bill-month">
        ({props.month} 月账单)
      </div>
      <div className="bill-content">
        <div className="bill-content-current">
          <span className="price-title">账单金额：</span>
          <div className="bill-content-current-money">
            <span className="price-unit">¥</span>
            <span className="bill-content-current-money-value">
              {props.currentCost}
            </span>
          </div>
        </div>
        <div className="bill-content-origin">
          <span className="price-title">原金额：</span>
          <div className="bill-content-origin-money">
            <span className="price-unit">¥</span>
            <span className="bill-content-origin-money-value">
              {props.originCost}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default observer(function UpdateBillModal(props: Props) {
  const {
    uid,
    name,
    onSubmit,
    onCancel,
    ...restProps
  } = props

  const store = useLocalStore(LocalStore, {
    uid,
    onSubmit,
    visible: props.visible
  })

  return (
    <Drawer
      className="comp-update-bill-modal"
      width="640px"
      title={`重新出账-${name}`}
      onClose={onCancel}
      onOk={store.handleSubmit}
      okButtonProps={{ disabled: store.formState.hasError || !store.bill }}
      {...restProps}
      footerExtra={
        <FooterExtra
          originCost={store.originCost}
          currentCost={store.currentCost}
          month={store.currentMonth!}
        />
      }
    >
      <Spin spinning={store.isLoading}>
        <PopupContainer>
          <FormView store={store} formState={store.formState} />
          <BillTip onFinancialConfig={props.onFinancialConfig} />
        </PopupContainer>
      </Spin>
    </Drawer>
  )
})
