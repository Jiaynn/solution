/**
 * @desc 自动启用 CDN 分发 开关
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'

import Switch from 'react-icecream/lib/switch'
import Form from 'react-icecream/lib/form'

export type IValue = boolean

export interface IProps {
  value: IValue
  onChange(val: IValue): void
  formItemLayout?: IFormItemLayout
  simple?: boolean // 是否为简易模式（无 label & 无文字提示 (?)）
}

export const defaultFormItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
}

export default observer(function AutoEnableSwitchInput(props: IProps) {
  const switchRestProps = {
    checkedChildren: !props.simple ? '开启' : null,
    unCheckedChildren: !props.simple ? '关闭' : null
  }

  const switchComp = (
    <Switch
      checked={props.value}
      onChange={props.onChange}
      {...switchRestProps}
    />
  )

  if (props.simple) {
    return switchComp
  }

  const tips = (
    <ol>
      <li>1. 开启后，当视频文件瘦身成功时会自动启用 CDN 分发，将瘦身后的视频文件预取到各 CDN 节点；</li>
      <li>2. 通过本配置「已启用」CDN 分发的文件，可在「视频瘦身列表」的「操作」中单独停用。</li>
    </ol>
  )

  const formItemProps = {
    ...(props.formItemLayout || defaultFormItemLayout),
    label: '自动启用 CDN 分发',
    extra: tips
  }

  return (
    <Form.Item {...formItemProps}>
      {switchComp}
    </Form.Item>
  )
})
