/**
 * @file Component CorsRuleModal
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { reaction, action, observable, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { FormState, FieldState } from 'formstate'
import { Loadings } from 'portal-base/common/loading'
import { Form, Drawer, InputNumber, Input, Checkbox, Icon, Tooltip } from 'react-icecream/lib'
import Disposable from 'qn-fe-core/disposable'

import { valuesOfEnum } from 'kodo/utils/ts'
import { validateURL } from 'kodo/utils/url'
import { bindFormItem, getValuesFromFormState } from 'kodo/utils/formstate'

import docStyles from 'kodo/styles/card.m.less'

import Prompt from 'kodo/components/common/Prompt'
import FormTrigger from 'kodo/components/common/FormTrigger'
import HelpDocLink from 'kodo/components/common/HelpDocLink'

import { ICrossOriginRule, Method } from 'kodo/apis/bucket/setting/cross-origin'
import styles from './style.m.less'

const CheckboxGroup = Checkbox.Group

type EditRuleFormState = FormState<{
  allowed_origin: FieldState<string[]>
  exposed_header: FieldState<string[]>
  allowed_header: FieldState<string[]>
  allowed_method: FieldState<Method[]>
  max_age: FieldState<number>
}>

export interface IProps {
  title: string // title
  visible: boolean // 显示隐藏
  onSubmit(rule: ICrossOriginRule): Promise<any> | void // 点击提交
  onCancel(): void // 点击取消
  data?: ICrossOriginRule
}

enum Loading {
  GetRule = 'getRule',
  SetRule = 'setRule'
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 17 }
} as const

function hasRepeatedRules(rules: string[]) {
  return new Set(rules).size !== rules.length
}

// allow origin 验证
// 支持 http://qiniu.com https://*.qiniu.com http://*.com http://www.*.com *
function allowOriginValidator(value: string[]) {
  const rules = value.map(item => item.trim()).filter(Boolean)

  if (rules.length <= 0) {
    return '至少输入一项'
  }

  if (hasRepeatedRules(rules)) {
    return '请检查是否有重复的输入'
  }

  for (const rule of rules) {
    if (rule === '*') {
      continue
    }

    if (rule.split('*').length > 2) {
      return '每行最多一个 *'
    }

    const validateResult = validateURL(rule, { allowGeneric: true })
    if (validateResult) {
      return validateResult
    }
  }
}

// exposed headers 验证
function exposedHeadersValidator(value: string[]) {
  const pattern = /^([a-zA-Z0-9-_]+){1,}$/
  const rules = value.map(item => item.trim()).filter(Boolean)

  if (!rules.every(item => pattern.test(item))) {
    return '请检查你的输入'
  }

  if (hasRepeatedRules(rules)) {
    return '请检查是否有重复的输入'
  }
}

// allow headers 验证
function allowHeadersValidator(value: string[]) {
  const pattern = /^(([a-zA-Z0-9-_]+)|([*]{1}))$/
  const rules = value.map(item => item.trim()).filter(Boolean)

  if (!rules.every(item => pattern.test(item))) {
    return '请检查你的输入'
  }

  if (hasRepeatedRules(rules)) {
    return '请检查是否有重复的输入'
  }
}

// allow methods 验证
function allowMethodsValidator(value: Method[]) {
  if (value.length === 0) {
    return '请至少选择一个'
  }
}

function maxAgeValidator(value: number) {
  if (!Number.isInteger(value)) {
    return '请输入整数'
  }

  if (value < 0) {
    return '缓存时间不得小于 0'
  }

  return false
}

@observer
export default class EditRuleDrawer extends React.Component<IProps> {
  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))
  @observable.ref form: EditRuleFormState

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.visible,
        visible => visible && this.resetForm(),
        { fireImmediately: true }
      )
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @action.bound
  resetForm() {
    this.form = this.createFormState(this.props.data)
  }

  createFormState(data?: ICrossOriginRule) {
    const snapData = {
      allowed_origin: data && data.allowed_origin || [''],
      exposed_header: data && data.exposed_header || [''],
      allowed_header: data && data.allowed_header || [''],
      allowed_method: data && data.allowed_method || [Method.GET],
      max_age: data && data.max_age || 0
    }

    const state = new FormState({
      allowed_origin: new FieldState(snapData.allowed_origin).validators(allowOriginValidator),
      exposed_header: new FieldState(snapData.exposed_header).validators(exposedHeadersValidator),
      allowed_header: new FieldState(snapData.allowed_header).validators(allowHeadersValidator),
      allowed_method: new FieldState(snapData.allowed_method).validators(allowMethodsValidator),
      max_age: new FieldState(snapData.max_age).validators(maxAgeValidator)
    })

    return state
  }

  @autobind
  @Loadings.handle(Loading.SetRule)
  async handleSubmit() {
    const result = await this.form.validate()
    if (result.hasError) {
      return
    }

    return this.props.onSubmit(getValuesFromFormState(this.form))
  }

  @autobind
  handleMaxAgeBlur() {
    if (!this.form.$.max_age.value) this.form.$.max_age.reset(0)
  }

  render() {
    if (!this.form) {
      return null
    }

    const {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      allowed_origin, allowed_header, allowed_method, exposed_header, max_age
    } = this.form.$

    return (
      <Drawer
        width={560}
        {...this.props}
        title={
          <span>
            {this.props.title}
            <Tooltip title="文档">
              <HelpDocLink className={docStyles.extraButton} doc="crossOrigin" anchor="#set">
                <Icon type="file-text" />
              </HelpDocLink>
            </Tooltip>
          </span>
        }
        onOk={this.handleSubmit}
        confirmLoading={this.loadings.isLoading(Loading.SetRule)}
        onClose={this.props.onCancel}
        okButtonProps={{ disabled: this.loadings.isLoading(Loading.SetRule) }}
      >
        <Form
          onSubmit={e => {
            e.preventDefault()
            this.handleSubmit()
          }}
        >
          <FormTrigger />
          <Form.Item
            label="来源"
            required
            {...formItemLayout}
            {...bindFormItem(allowed_origin)}
            extra={(<Prompt>来源可以设置多个，每行一个，每行最多能有一个通配符[*]</Prompt>)}
          >
            <Input.TextArea
              placeholder="请输入来源"
              value={allowed_origin.value.join('\n')}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => (
                allowed_origin.onChange(e.target.value.split('\n'))
              )}
            />
          </Form.Item>
          <Form.Item
            required
            label="允许 Methods"
            {...formItemLayout}
            {...bindFormItem(allowed_method)}
          >
            <CheckboxGroup
              className={styles.method}
              options={valuesOfEnum(Method)}
              value={allowed_method.value.slice()}
              onChange={(value: Method[]) => allowed_method.onChange(value)}
            />
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="允许 Headers"
            {...bindFormItem(allowed_header)}
            extra={(
              <Prompt>允许 Headers 可以设置多个，每行一个，如果有通配符[*]，则单行只能是通配符[*]</Prompt>
            )}
          >
            <Input.TextArea
              placeholder="请输入允许 Headers（可选）"
              value={allowed_header.value.join('\n')}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => (
                allowed_header.onChange(e.target.value.split('\n'))
              )}
            />
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="暴露 Headers"
            {...bindFormItem(exposed_header)}
            extra={(<Prompt>暴露 Headers 可以设置多个，每行一个，不允许出现通配符[*]</Prompt>)}
          >
            <Input.TextArea
              placeholder="请输入暴露 Headers（可选）"
              value={exposed_header.value.join('\n')}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => (
                exposed_header.onChange(e.target.value.split('\n'))
              )}
            />
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="缓存时间（秒）"
            {...bindFormItem(max_age)}
          >
            <InputNumber
              onBlur={this.handleMaxAgeBlur}
              value={max_age.value}
              onChange={max_age.onChange}
            />
          </Form.Item>
        </Form>
      </Drawer>
    )
  }
}
