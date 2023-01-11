/*
 * @file 行内表单（含提交按钮）
 * @author nighca <nighca@live.cn>
 */

import React, { FormEvent } from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'

import Button from 'react-icecream/lib/button'
import { Loadings } from 'portal-base/common/loading'

import InlineForm from '..'

import './style.less'

export interface IProps {
  children: any
  onSubmit: () => Promise<any>
  submitBtnText?: string
  className?: string
}

enum Loading {
  Submit = 'submit'
}

@observer
export default class InlineFormWithSubmit extends React.Component<IProps> {

  loadings = new Loadings()

  @autobind handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    this.loadings.promise(Loading.Submit, this.props.onSubmit())
  }

  render() {
    const submitBtnText = (
      this.props.submitBtnText == null
      ? '确认查询'
      : this.props.submitBtnText
    )

    const className = [
      'comp-inline-form-with-submit',
      this.props.className
    ].filter(Boolean).join(' ')

    return (
      <InlineForm className={className} onSubmit={this.handleSubmit}>
        <div className="inputs-part">
          {this.props.children}
        </div>
        <div className="submit-part">
          <Button
            className="submit-btn"
            loading={this.loadings.isLoading(Loading.Submit)}
            type="primary"
            htmlType="submit"
          >{submitBtnText}</Button>
        </div>
      </InlineForm>
    )
  }
}
