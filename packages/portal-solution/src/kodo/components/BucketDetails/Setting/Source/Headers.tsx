/**
 * @file 镜像回源 - http headers
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'
import { computed, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Form, Input, Switch, Button, Row, Col } from 'react-icecream/lib'
import { FormItemProps } from 'react-icecream/lib/form'
import { FormState, FieldState, Validator } from 'formstate-x'
import { bindFormItem, bindTextInput, bindSwitch } from 'portal-base/common/form'

import Prompt from 'kodo/components/common/Prompt'

import styles from './style.m.less'

export type HeaderState = FieldState<string>

export type Value = string[]

export type State = FormState<{
  enabled: FieldState<boolean>
  headers: FormState<HeaderState[]>
}>

export interface IProps {
  state: State
  formItemLayout: FormItemProps
}

const maxHeadersCount = 10

function createHeaderState(initialHeader: string, state: State): HeaderState {
  const headerState = new FieldState(initialHeader).validators(validateHeader)
  const duplicateValidator = createHeaderDuplicateValidator(state, headerState)
  headerState.validators(duplicateValidator)
  return headerState
}

export function createState(headers?: Value): State {
  headers = headers || []

  const enabledState = new FieldState(!!headers.length)

  const state: State = new FormState({
    headers: null as any,
    enabled: enabledState
  })

  const headersState = new FormState(
    headers.length
      ? headers.map(header => createHeaderState(header, state))
      : [createHeaderState('', state)] // 非空，至少有 1 条
  ).validators(validateHeaders).disableValidationWhen(
    () => !enabledState.value
  )

  state.$.headers = headersState

  return state
}

export function getValue(state: State): Value {
  return state.$.enabled.value
    ? (state.$.headers.$ || []).map(headerState => headerState.value)
    : []
}

@observer
export default class SourceHeaders extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get formItemLayout() {
    return {
      ...this.props.formItemLayout,
      className: `${this.props.formItemLayout.className} ${styles.headerRow}`
    }
  }

  @action.bound
  handleAdd() {
    const state = this.props.state
    state.$.headers.$.push(
      createHeaderState('', state)
    )
  }

  @action.bound
  handleDelete(index: number) {
    const [header] = this.props.state.$.headers.$.splice(index, 1)
    header.dispose()
  }

  @computed
  get mainView() {
    const headers = this.props.state.$.headers.$ || []
    return [
      ...headers.map((headerState, index) => (
        <Form.Item
          key={index}
          label=" "
          colon={false}
          {...this.formItemLayout}
          {...bindFormItem(headerState)}
        >
          <Row gutter={16}>
            <Col span={23}>
              <Input placeholder="请输入 HTTP headers" {...bindTextInput(headerState)} />
            </Col>
            <Col span={1}>
              {index > 0 && (
                <Button
                  type="danger"
                  icon="minus-circle"
                  ghost
                  className={styles.deleteBtn}
                  onClick={() => this.handleDelete(index)}
                />
              )}
            </Col>
          </Row>
        </Form.Item>
      )),
      <Form.Item key="add-btn" colon={false} label=" " {...this.formItemLayout}>
        <Button
          icon="plus"
          type="dashed"
          disabled={headers.length >= maxHeadersCount}
          onClick={this.handleAdd}
        >
          添加
        </Button>
        <span>
          {headers.length} / {maxHeadersCount}
        </span>
      </Form.Item>
    ]
  }

  labelView = (
    <span className={styles.httpHeader}>
      传递指定的<br />HTTP header
    </span>
  )

  render() {
    const fields = this.props.state.$
    return (
      <>
        <Form.Item
          label={this.labelView}
          labelAlign="left"
          {...this.formItemLayout}
          {...bindFormItem(fields.enabled)}
          extra={
            <Prompt type="normal">
              镜像回源时传递给源站的 HTTP header；最多可以设置 10 个；禁止设置一些标准 header，比如 Content-Length、User-Agent、Range
            </Prompt>
          }
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" {...bindSwitch(fields.enabled)} />
        </Form.Item>
        {this.props.state.$.enabled.value && this.mainView}
      </>
    )
  }
}

const disallowHeaders = [
  'content-length',
  'user-agent',
  'range'
]

function validateHeader(value: string) {
  if (!value || !value.trim()) {
    return '不能为空'
  }
  if (/\s/.test(value)) {
    return '不能有空格等空白符'
  }
  if (disallowHeaders.includes(value.toLowerCase())) {
    return `不能设置 ${disallowHeaders.join('、')}`
  }
  if (value.length > 50) {
    return '不能超过 50 个字符'
  }
}

function createHeaderDuplicateValidator(state: State, currentState: HeaderState): Validator<string> {
  return (header: string) => {
    for (const headerState of (state.$.headers.$ || [])) {
      if (headerState === currentState) {
        continue
      }
      if (headerState.value === header) {
        return 'header 不能重复'
      }
    }
  }
}

function validateHeaders(headers: string[]) {
  if (headers && headers.length > maxHeadersCount) {
    return `header 数量不能超过 ${maxHeadersCount} 个`
  }
}
