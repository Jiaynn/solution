/**
 * @file User Financial Component
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

import ChargeTypeFormItem from 'cdn/components/Financial/common/Inputs/ChargeTypeInput'
import SubChargeTypeFormItem from 'cdn/components/Financial/common/Inputs/SubChargeInput'
import ChargeUnitPriceFormItem from 'cdn/components/Financial/common/Inputs/UnitPriceInput'
import ChargeRadixFormItem from 'cdn/components/Financial/common/Inputs/ChargeRadixInput'
import ChargeCoefficientFormItem from 'cdn/components/Financial/common/Inputs/ChargeCoefficientInput'

import { Props, UserFinancialStore, State } from './store'

import './style.less'

export { UserFinancialModalStore } from './store'

const formProps: FormProps = {
  labelCol: {
    span: 3
  },
  wrapperCol: {
    push: 1,
    span: 20
  }
}

const FormView = observer(function _FormView(props: { formState: State }) {
  return (
    <Form {...formProps}>
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

export default observer(function UserFinancialModal(props: Props) {
  const {
    uid,
    name,
    onSubmit,
    onCancel,
    ...restProps
  } = props

  const store = useLocalStore(UserFinancialStore, {
    uid,
    onSubmit,
    visible: props.visible
  })

  return (
    <Drawer
      title={`计费管理-${name}`}
      width="640px"
      onClose={onCancel}
      onOk={store.handleSubmit}
      okButtonProps={{ disabled: store.formState.hasError }}
      {...restProps}
    >
      <Spin spinning={store.isLoading}>
        <PopupContainer>
          <FormView formState={store.formState} />
        </PopupContainer>
      </Spin>
    </Drawer>
  )
})
