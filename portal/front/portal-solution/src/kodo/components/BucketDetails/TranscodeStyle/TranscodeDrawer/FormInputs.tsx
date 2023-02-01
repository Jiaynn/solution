/**
 * @file Component TranscodeDrawer FormInput
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { bindInput, FieldState, FormState } from 'formstate-x'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Input, Select, Button } from 'react-icecream/lib'
import { ToasterStore } from 'portal-base/common/toaster'
import { RouterStore } from 'portal-base/common/router'

import { isURL } from 'kodo/utils/url'
import { keysOf } from 'kodo/utils/ts'

import { BucketListStore } from 'kodo/stores/bucket/list'
import { BucketStore } from 'kodo/stores/bucket'

import { getCreatePrivatePipelinePath } from 'kodo/routes/transcode-style'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'
import { transcodeCommand, custom, magicWords } from 'kodo/constants/transcode-style'

import { IPrivatePipeline } from 'kodo/apis/transcode-style'

import styles from './style.m.less'

// 输入组件的 props 类型
export interface IProps {
  state: FieldState<string>
}

interface DiDeps {
  inject: InjectFunc
}

export type CommandState = FormState<{
  normalCommand: FieldState<string>
  customCommand: FieldState<string>
}>

export interface ICommandProps {
  state: CommandState
}

export interface ITargetBucketProps extends IProps {
  bucketName: string
}

export interface INameInputProps extends IProps {
  disabled: boolean
}

export interface IBucketSelectProps extends IProps {

}

export interface IPipelineProps extends IProps {
  privatePipelines: IPrivatePipeline[]
}

export function createCallbackState(data: string) {
  return new FieldState(data).validators(value => {
    if (value && !isURL(value)) {
      return '地址格式输入有误'
    }
  })
}

export const Callback = observer(function _Callback({ state }: IProps) {
  return (
    <Input placeholder="请输入回调 URL（可选）" {...bindInput(state, e => e.currentTarget.value)} />
  )
})

export function validateTargetName(value: string) {
  if (!value.trim()) {
    return '目标文件名不能为空'
  }

  if (value.length > 128) {
    return '文件名最大长度不能超过 128 个字符'
  }

  const warning = '目标文件名格式错误'
  const targetNamePattern = /\$(\{.*?\}|\(.*?\))/g
  const bracePattern = /\$\{(.+?)\}/
  const curvesPattern = /\$\((.+?)\)/
  const matchedData = value.match(targetNamePattern)

  if (!matchedData) {
    return false
  }

  for (const item of matchedData) {
    const braceMatchResult = bracePattern.exec(item)
    const curvesMatchResult = curvesPattern.exec(item)
    if (!braceMatchResult && !curvesMatchResult) {
      return warning
    }

    if (braceMatchResult && !magicWords.includes(braceMatchResult[1])) {
      return warning
    }

    if (curvesMatchResult && !magicWords.includes(curvesMatchResult[1])) {
      return warning
    }
  }
}

export function createTargetNameState(data: string) {
  return new FieldState(data).validators(validateTargetName)
}

// eslint-disable-next-line no-template-curly-in-string
const targetNamePlaceholder = '${fprefix}.${ext}'

export const TargetName = observer(function _TargetName({ state }: IProps) {
  return (
    <Input {...bindInput(state, e => e.currentTarget.value)} placeholder={targetNamePlaceholder} />
  )
})

export function createNameState(data: string) {
  return new FieldState(data).validators(value => {
    if (!value || !value.trim()) {
      return '转码名称不能为空'
    }

    if (value.length > 128) {
      return '文件名最大长度不能超过 128 个字符'
    }
  })
}

// 输入组件
export const Name = observer(function _Name({ state, disabled }: INameInputProps) {
  return (
    <Input {...bindInput(state, e => e.currentTarget.value)} disabled={disabled} placeholder="请输入转码配置名称" />
  )
})

export function createTargetBucketState(data: string) {
  return new FieldState(data).validators(value => {
    if (!value) {
      return '目标空间不能为空'
    }
  })
}

@observer
class InternalTargetBucket extends React.Component<ITargetBucketProps & DiDeps> {
  constructor(props: ITargetBucketProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(ToasterStore)
    ToasterStore.bindTo(this, toaster)
  }

  bucketStore = this.props.inject(BucketStore)
  bucketListStore = this.props.inject(BucketListStore)

  @autobind
  @ToasterStore.handle()
  fetchBucketList() {
    return this.bucketListStore.fetchList()
  }

  componentDidMount() {
    this.fetchBucketList()
  }

  @autobind
  isAvailableBucket(bucketName: string) {
    const bucketInfo = this.bucketListStore.getByName(bucketName)
    if (this.currentBucketInfo == null || bucketInfo == null) return false
    // 不能是只读空间且空间区域与当前空间保持一致
    return this.currentBucketInfo.region === bucketInfo.region && bucketInfo.perm !== ShareType.ReadOnly
  }

  @computed
  get currentBucketInfo() {
    return this.bucketStore.getDetailsByName(this.props.bucketName)
  }

  @computed
  get bucketNameList() {
    return this.bucketListStore.nameList.filter(name => this.isAvailableBucket(name))
  }

  render() {
    return (
      <Select
        showSearch
        optionFilterProp="value"
        placeholder="请选择目标空间"
        {...bindInput(this.props.state)}
      >
        {this.bucketNameList.map(bucket => (
          <Select.Option key={bucket} value={bucket}>{bucket}</Select.Option>
        ))}
      </Select>
    )
  }
}

export function TargetBucket(props: ITargetBucketProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalTargetBucket {...props} inject={inject} />
    )} />
  )
}

export function createCommandState(command: string, process = '') {
  // 判断当前转码命令是否是自定义的
  const normalCommand = new FieldState<string>(command === custom ? command : process).validators(value => {
    if (!value) {
      return '转码命令不能为空'
    }
  })

  const customCommand = new FieldState(command === custom ? process : '').validators(value => {
    if (!value || !value.trim()) {
      return '自定义命令不能为空'
    }
  }).disableValidationWhen(() => normalCommand.value !== custom) // 如果没选自定义，则不用进行校验

  return new FormState({ normalCommand, customCommand })
}

export const Command = observer(function _Command({ state }: ICommandProps) {
  return (
    <>
      <Select
        showSearch
        optionFilterProp="children"
        placeholder="请选择转码命令"
        {...bindInput(state.$.normalCommand)}
        // 解决 antd Select 组件 value = null 或 "" 时 placeholder 不显示问题
        value={state.$.normalCommand.value || undefined}
      >
        <Select.Option value={custom}>{custom}</Select.Option>
        {keysOf(transcodeCommand).map(key => (
          <Select.Option key={key} value={transcodeCommand[key]}>{key}</Select.Option>
        ))}
      </Select>
      <Input.TextArea
        placeholder="请输入自定义的接口命令"
        className={state.$.normalCommand.value === custom ? styles.customInput : styles.hide}
        {...bindInput(state.$.customCommand, e => e.currentTarget.value)}
      />
    </>
  )
})

export function createPrivatePipelineState(data: string, privatePipelines: IPrivatePipeline[]) {
  return new FieldState(data).validators(value => {
    if (
      value && privatePipelines
      && privatePipelines.length && !privatePipelines.some(item => item.name === value)
    ) {
      return '当前选择的队列不存在，请修改设置'
    }
  })

}

@observer
class InternalPrivatePipeline extends React.Component<IPipelineProps & DiDeps> {
  constructor(props: IPipelineProps & DiDeps) {
    super(props)

    const toaster = this.props.inject(ToasterStore)
    ToasterStore.bindTo(this, toaster)
  }

  router = this.props.inject(RouterStore)

  @autobind
  gotoCreatePrivatePipeline() {
    this.router.push(getCreatePrivatePipelinePath())
  }

  render() {
    const { state } = this.props
    if (!this.props.privatePipelines.length) {
      return (
        <Button icon="plus" onClick={this.gotoCreatePrivatePipeline}>创建私有队列</Button>
      )
    }

    return (
      <Select {...bindInput(state)}>
        <Select.Option value="">请选择私有队列</Select.Option>
        {this.props.privatePipelines.map(item => (
          <Select.Option key={item.name} value={item.name}>{item.name}</Select.Option>
        ))}
      </Select>
    )
  }
}

export function PrivatePipeline(props: IPipelineProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalPrivatePipeline {...props} inject={inject} />
    )} />
  )
}
