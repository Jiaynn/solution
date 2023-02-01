/**
 * @file 告警指标选择输入
 * @author gaopeng <gaopeng01@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import { useInjection } from 'qn-fe-core/di'
import { FeatureConfigStore as FeatureConfig } from 'portal-base/user/feature-config'
import { FieldState, FormState } from 'formstate-x'
import { Cascader, CascaderOption, CascaderValue } from 'react-icecream-2'
import { FormItem } from 'react-icecream-2/form-x'

import { alarmItemOptionList, AlarmType, StatusCodeSubType } from 'cdn/constants/alarm'

export interface Value {
  alarmType: AlarmType
  alarmSubType?: StatusCodeSubType
}

type Fields = {
  alarmType: FieldState<AlarmType>
  alarmSubType: FieldState<StatusCodeSubType | undefined>
}

export type State = FormState<Fields>

export const defaultValue: Value = {
  alarmType: AlarmType.Bandwidth,
  alarmSubType: undefined
}

export function createState(value: Value = defaultValue): State {
  return new FormState({
    alarmType: new FieldState(value.alarmType).validators(
      v => !v && '请选择指标项'
    ),
    alarmSubType: new FieldState(value.alarmSubType)
  })
}

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  state: State
  disabled?: boolean
}

export interface RuleInputProps extends Props {
  featureConfigStore: FeatureConfig
}

@observer
class RuleInput extends React.Component<RuleInputProps> {

  constructor(props: RuleInputProps) {
    super(props)
    makeObservable(this)
  }

  @autobind handleCascaderChange([alarmType, alarmSubType]: [AlarmType, StatusCodeSubType]) {
    this.props.state.$.alarmType.onChange(alarmType)
    this.props.state.$.alarmSubType.onChange(alarmSubType)
  }

  @computed get valueForCascader(): CascaderValue | null {
    const fields = this.props.state.$
    // eslint-disable-next-line no-underscore-dangle
    const alarmType = fields.alarmType._value
    // eslint-disable-next-line no-underscore-dangle
    const alarmSubType = fields.alarmSubType._value
    return alarmType === AlarmType.StatusCode
        ? [alarmType, alarmSubType] as Array<string | number>
        : [alarmType]
  }

  render() {
    const options: CascaderOption[] = alarmItemOptionList
    return (
      <div className="rule-input-wrapper">
        <FormItem className="alarm-input-form-item">
          <Cascader
            disabled={this.props.disabled}
            style={{ width: '140px' }}
            options={options}
            value={this.valueForCascader}
            onChange={this.handleCascaderChange}
            placeholder="指标"
          />
        </FormItem>
      </div>
    )
  }
}

export default observer(function RuleInputWrapper(props: Props) {
  const featureConfigStore = useInjection(FeatureConfig)

  return (
    <RuleInput {...props} featureConfigStore={featureConfigStore} />
  )
})
