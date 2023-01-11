/**
 * @file 镜像回源 - 线路组
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import classNames from 'classnames'
import * as React from 'react'
import { computed, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FormState, FieldState } from 'formstate-x'
import { Form, Input, Button, Switch, Select, Row, Col, Divider } from 'react-icecream/lib'
import PopupContainer from 'react-icecream/lib/popup-container'
import Disposable from 'qn-fe-core/disposable'
import { bindFormItem, bindSwitch, bindSelect, bindTextInput } from 'portal-base/common/form'

import { isUrlWithHostname, urlEqual, validateURL } from 'kodo/utils/url'

import { humanizeStorageSize } from 'kodo/transforms/unit'

import { SourceMode, SourceFragmentSize, sourceModeTextMap } from 'kodo/constants/bucket/setting/source'

import Prompt from 'kodo/components/common/Prompt'

import { ISourceLine, ISourceFragmentOptions } from 'kodo/apis/bucket/setting/source'
import SourceLine, * as sourceLine from './SourceLine'
import Headers, * as headers from './Headers'

import styles from './style.m.less'

const MAX_LINE_COUNT = 10
const lineMaxCountExceedText = `最多不能超过 ${MAX_LINE_COUNT} 条线路`

export const linesEmptyError = new Error('线路不能为空')
export const isLinesEmpty = (lines: ISourceLine[]) => !lines || !lines.length

// tslint:disable-next-line:interface-over-type-literal
export type Value = {
  lines: ISourceLine[]
  mode: SourceMode
  host?: string
  rawQueryEnabled?: boolean
  fragmentSize?: ISourceFragmentOptions['fragment_size']
  ignoreEtagCheck?: ISourceFragmentOptions['ignore_etag_check']
  sourceRetryCodes?: number[]
  headers?: headers.Value
}

export type State = FormState<{
  enabled: FieldState<boolean>
  lines: FormState<sourceLine.State[]>
  headers: headers.State
  mode: FieldState<SourceMode>
  host: FieldState<string>
  rawQueryEnabled: FieldState<boolean>
  fragmentSize: FieldState<number>
  etagCheckEnabled: FieldState<boolean>
  sourceRetryCodes: FieldState<string[]>
}>

export interface IProps {
  state: State
  bucketName: string
}

function createSourceRetryCodesState(value?: Array<string | number>) {
  const initCodes = (value || []).map(String)
  return new FieldState(initCodes).validators(async codes => {
    // HACK: onBlur 的时候会把还没用回车确认的输入给自动确定下来，该行为有延迟并且无法去掉
    // 它产生的一个副作用是输入了合法数字并且 enter 或 onBlur 前如果直接点击了表单的提交按钮
    // 那么在这个新的值被确定下来前，validate 已经结束了并且开始 submit 了，实际上新值还没触发 onChange
    // 然后延迟若干毫秒后、submit 结束前，这个值会被确认下来，并且产生相应的视觉效果，但值实际没被提交
    // 临时的解决办法是先稍微多等一会儿
    await new Promise(resolve => setTimeout(resolve, 10))

    if (!codes || codes.length === 0) {
      return
    }

    if (!codes.every(code => /^4\d\d$/.test(code + ''))) {
      return '只能设置 4xx Code'
    }

    if (codes.length > 3) {
      return '最多只能设置 3 个'
    }
  })
}

function createSourceLineState(value: sourceLine.Value | undefined, state: State) {
  const lineState = sourceLine.createState(value)
  const addrValidator = createAddrValidator(state, lineState)
  lineState.$.addr.validators(addrValidator)
  return lineState
}

export function createState(value?: Value): State {
  const newValue = {
    lines: new Array<ISourceLine>(),
    host: '',
    headers: new Array<string>(),
    mode: SourceMode.Normal,
    rawQueryEnabled: false,
    fragmentSize: SourceFragmentSize.FourMB,
    ignoreEtagCheck: false,
    sourceRetryCodes: new Array<number>(),
    ...value
  }

  const state: State = new FormState({
    enabled: new FieldState(!isLinesEmpty(newValue.lines)),
    lines: new FormState<sourceLine.State[]>([]),
    host: new FieldState<string>(''),
    mode: new FieldState(newValue.mode),
    rawQueryEnabled: new FieldState(newValue.rawQueryEnabled),
    fragmentSize: new FieldState(newValue.fragmentSize),
    etagCheckEnabled: new FieldState(!newValue.ignoreEtagCheck),
    sourceRetryCodes: createSourceRetryCodesState(newValue.sourceRetryCodes),
    headers: headers.createState(newValue.headers)
  })

  state.$.host = new FieldState(newValue.host).validators(
    validateHost,
    createHostValidatorByAddrs(state)
  )

  state.$.lines = new FormState<sourceLine.State[]>(
    newValue.lines.length
      ? newValue.lines.map(line => createSourceLineState(line, state))
      : [createSourceLineState(undefined, state)] // 非空，至少有 1 条
  ).validators(validateLines)

  state.disableValidationWhen(() => !state.$.enabled.value)

  return state
}

export function getValue(state: State): Value {
  const fields = state.$
  return {
    lines: fields.enabled.value ? fields.lines.$.map(sourceLine.getValue) : [],
    host: fields.host.value && fields.host.value.trim(),
    mode: fields.mode.value,
    rawQueryEnabled: fields.rawQueryEnabled.value,
    fragmentSize: fields.fragmentSize.value,
    ignoreEtagCheck: !fields.etagCheckEnabled.value,
    sourceRetryCodes: (fields.sourceRetryCodes.value || []).map(Number),
    headers: headers.getValue(fields.headers)
  }
}

// TODO: icecream 升级后检查样式
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 19 },
  className: styles.formItemBase
} as const

@observer
export default class Source extends React.Component<IProps> {
  disposable = new Disposable()

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @action.bound
  handleAddLine() {
    const state = this.props.state
    const lines = state.$.lines
    const lineState = createSourceLineState(undefined, state)
    lines.$.push(lineState)
  }

  @action.bound
  handleDeleteLine(index: number) {
    const state = this.props.state.$.lines
    const [line] = state.$.splice(index, 1)
    // TODO: 如何保证不漏掉这种；同 Headers 模块
    this.disposable.addDisposer(line.dispose)
  }

  @computed
  get linesView() {
    const lines = this.props.state.$.lines.$
    return (
      <div className={styles.linesWrapper}>
        <Row gutter={16} className={styles.linesHeader}>
          <Col span={5}>主/备线路</Col>
          <Col span={14}>回源地址</Col>
          <Col span={4}>权重</Col>
          <Col span={1}>{/* 删除 */}</Col>
        </Row>
        <div>
          {lines.map((lineState, index) => (
            <Row key={index} gutter={16} className={styles.lineWrapper}>
              <SourceLine state={lineState} />
              <Col span={1} className={styles.lineItem}>
                {index > 0 && (
                  <Button
                    type="danger"
                    icon="minus-circle"
                    ghost
                    className={`${styles.lineItemInput} ${styles.deleteBtn}`}
                    onClick={() => this.handleDeleteLine(index)}
                  />
                )}
              </Col>
            </Row>
          ))}
        </div>
        <div>
          <Button
            icon="plus"
            type="dashed"
            className={styles.addLine}
            onClick={this.handleAddLine}
            disabled={lines.length === MAX_LINE_COUNT}
          >
            添加线路
          </Button>
          <span>
            {lines.length} / {MAX_LINE_COUNT}
          </span>
        </div>
      </div>
    )
  }

  @computed
  get fragmentView() {
    const fields = this.props.state.$
    const visible = fields.mode.value === SourceMode.Fragment

    const fragmentSizeOptions = [SourceFragmentSize.OneMB, SourceFragmentSize.FourMB]
    // 如果当前值不是以上选项中的任一个，则将当前值作为一个自定义项展示之
    if (!fragmentSizeOptions.includes(fields.fragmentSize.value)) {
      fragmentSizeOptions.push(fields.fragmentSize.value)
    }

    return (
      <div className={classNames({ [styles.hidden]: !visible })}>
        <Form.Item label="Etag 校验" {...formItemLayout} {...bindFormItem(fields.etagCheckEnabled)}>
          <Switch checkedChildren="开启" unCheckedChildren="关闭" {...bindSwitch(fields.etagCheckEnabled)} />
        </Form.Item>
        <Form.Item label="分片大小" {...formItemLayout} {...bindFormItem(fields.fragmentSize)}>
          <Select className={styles.select} {...bindSelect(fields.fragmentSize)}>
            {fragmentSizeOptions.map(size => (
              <Select.Option key={size} value={size}>
                {humanizeStorageSize(size)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>
    )
  }

  render() {
    const fields = this.props.state.$
    return (
      <PopupContainer>
        <Form.Item label="镜像回源" {...formItemLayout} {...bindFormItem(fields.enabled)}>
          <Switch checkedChildren="开启" unCheckedChildren="关闭" {...bindSwitch(fields.enabled)} />
        </Form.Item>
        <div className={classNames({ [styles.hidden]: !fields.enabled.value })}>
          {this.linesView}
          <Divider />
          <Form.Item label="镜像空间" {...formItemLayout}>
            <Input disabled value={this.props.bucketName} />
          </Form.Item>
          <Form.Item
            label="回源 host"
            {...formItemLayout}
            {...bindFormItem(fields.host)}
            extra={
              <Prompt>
                镜像回源请求 Header 里的「Host」，不设置时，默认为回源地址的域名。
              </Prompt>
            }
          >
            <Input placeholder="请输入回源 host（可选）" {...bindTextInput(fields.host)} />
          </Form.Item>

          <Form.Item label="URL 参数" {...formItemLayout} {...bindFormItem(fields.rawQueryEnabled)}>
            <Switch checkedChildren="保留" unCheckedChildren="不保留" {...bindSwitch(fields.rawQueryEnabled)} />
          </Form.Item>
          <Form.Item label="回源模式" {...formItemLayout} {...bindFormItem(fields.mode)}>
            <Select className={styles.select} {...bindSelect(fields.mode)}>
              <Select.Option value={SourceMode.Normal}>
                {sourceModeTextMap[SourceMode.Normal]}
              </Select.Option>
              <Select.Option value={SourceMode.Range}>
                {sourceModeTextMap[SourceMode.Range]}
              </Select.Option>
              <Select.Option value={SourceMode.Fragment}>
                {sourceModeTextMap[SourceMode.Fragment]}
              </Select.Option>
            </Select>
          </Form.Item>
          {this.fragmentView}
          <Form.Item
            label="重试 Code"
            {...formItemLayout}
            {...bindFormItem(fields.sourceRetryCodes)}
            extra={
              <Prompt type="normal">
                只允许设置 4xx Code，最多 3 个；不设置时，默认源站响应 5xx 会做回源重试
              </Prompt>
            }
          >
            <Select
              mode="tags"
              {...bindSelect(fields.sourceRetryCodes)}
              dropdownStyle={{ display: 'none' }}
              placeholder="回车输入重试 Code（可选）"
              className={styles.select}
            />
          </Form.Item>
          <Headers state={fields.headers} formItemLayout={formItemLayout} />
        </div>
      </PopupContainer>
    )
  }
}

function validateHost(val: string) {
  if (!val || !val.trim()) {
    return
  }

  if (/\s/.test(val)) {
    return '域名不能有空格等空白符'
  }

  if (/^https?:\/\//i.test(val)) {
    return '请勿输入 http(s) 协议头'
  }

  return validateURL(val, {
    allowPort: false,
    allowHash: false,
    allowSearch: false,
    ignoreProtocol: true
  })
}

// 回源地址不能与该镜像空间绑定的回源 host 相同
function validateAddrAndHost(addr: string, host: string) {
  if (isUrlWithHostname(addr, host)) {
    return '回源地址不能与该镜像空间绑定的回源 host 相同'
  }
}

function createHostValidatorByAddrs(state: State) {
  return (host: string) => {
    for (const sourceLineState of state.$.lines.$) {
      const addr = sourceLine.getValue(sourceLineState).addr
      const invalid = validateAddrAndHost(addr, host)
      if (invalid) {
        return invalid
      }
    }
  }
}

function createAddrValidator(state: State, currentSourceLineState: sourceLine.State) {
  return (addr: string) => {
    const invalid = validateAddrAndHost(addr, state.$.host.value)
    if (invalid) {
      return invalid
    }
    for (const target of state.$.lines.$) {
      if (target === currentSourceLineState) {
        continue
      }
      const targetAddr = sourceLine.getValue(target).addr
      if (urlEqual(targetAddr, addr)) {
        return '回源地址重复'
      }
    }
  }
}

// TODO:
// 1、这个逻辑怎么跟表单的校验结合（比如 handleAddLine 或添加按钮的 disabled 重复了 MAX_LINE_COUNT 的逻辑）
// 2、如何正常展示这些错误（toaster 或 form item 或别的什么）
// 3、考虑 disableValidationWhen
// 4、同 Headers 模块
function validateLines(lines: any[]) {
  if (isLinesEmpty(lines)) {
    return linesEmptyError.message
  }

  if (lines.length > MAX_LINE_COUNT) {
    return lineMaxCountExceedText
  }
}
