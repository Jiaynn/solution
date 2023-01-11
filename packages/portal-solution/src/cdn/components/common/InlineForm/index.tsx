/*
 * @file 行内表单，主要封装样式
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'

import Form from 'react-icecream/lib/form'

import './style.less'

export interface IProps {
  className?: string
  onSubmit?: React.FormEventHandler<any>
  children: any
}

export default observer(function InlineForm(props: IProps) {
  const className = ['comp-inline-form', props.className].filter(Boolean).join(' ')
  return (
    <Form
      className={className}
      onSubmit={props.onSubmit}
      layout="inline"
    >
      {props.children}
    </Form>
  )
})
