/**
 * @file 镜像回源 - 线路
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Form, Input, InputNumber, Select, Col } from 'react-icecream/lib'
import { FormState, FieldState } from 'formstate-x'
import { bindSelect, bindTextInput, bindInputNumber, bindFormItem } from 'portal-base/common/form'

import { validateURL } from 'kodo/utils/url'

import { ISourceLine } from 'kodo/apis/bucket/setting/source'

import styles from './style.m.less'

interface IFormItemLayout {
  labelCol: object
  wrapperCol: object
}

export type Value = ISourceLine

export type State = FormState<{
  addr: FieldState<string>
  weight: FieldState<number | string>
  backup: FieldState<string>
}>

export interface IProps {
  state: State
  formItemLayout?: IFormItemLayout
}

export function createState(initialValue: Value | void): State {
  const value: Value = {
    addr: '',
    weight: 1,
    backup: false,
    ...initialValue
  }

  return new FormState({
    addr: new FieldState(value.addr).validators(validateAddr),
    weight: new FieldState(value.weight).validators(validateWeight),
    backup: new FieldState(value.backup + '')
  })
}

export function getValue(state: State): Value {
  const value = state.value
  const weight = typeof value.weight === 'string' ? parseFloat(value.weight) : value.weight
  const backup = value.backup === 'true'
  return { ...value, weight, backup }
}

@observer
export default class SourceLine extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get formItemLayout() {
    return {
      ...this.props.formItemLayout,
      className: styles.lineItem
    }
  }

  handleWeightBlur = () => {
    if (!this.props.state.$.weight.value) this.props.state.$.weight.onChange(1)
  }

  render() {
    const fields = this.props.state.$
    return (
      <>
        <Col span={5}>
          <Form.Item {...this.formItemLayout} {...bindFormItem(fields.backup)}>
            <Select {...bindSelect(fields.backup)} className={styles.lineItemInput}>
              <Select.Option value="false">
                主线路
              </Select.Option>
              <Select.Option value="true">
                备线路
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={14}>
          <Form.Item {...this.formItemLayout} {...bindFormItem(fields.addr)}>
            <Input
              {...bindTextInput(fields.addr)}
              placeholder="请输入回源地址如：http(s)://test.com"
              className={styles.lineItemInput}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item {...this.formItemLayout} {...bindFormItem(fields.weight)}>
            <InputNumber
              onBlur={this.handleWeightBlur}
              {...bindInputNumber(fields.weight)}
              className={styles.lineItemInput}
            />
          </Form.Item>
        </Col>
      </>
    )
  }
}

function validateAddr(val: string) {
  if (!val) {
    return '请输入地址'
  }
  if (!val.trim()) {
    return '地址不能为空'
  }
  if (/\s/.test(val)) {
    return '地址不能有空格等空白符'
  }
  return validateURL(val, {
    allowHash: false
  })
}

function validateWeight(val: number | string) {
  if (typeof val !== 'number') {
    return '请输入数字'
  }
  if (val < 1 || val > 100) {
    return '1 ~ 100 之间'
  }
  if (/[.a-fA-F+-]/.test(val + '')) {
    return '必须是普通正整数'
  }
}
