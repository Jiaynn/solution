/*
 * @file component EditableCell
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import React, { ChangeEvent } from 'react'
import { observer } from 'mobx-react'
import { observable, action, computed, makeObservable } from 'mobx'
import Input from 'react-icecream/lib/input'
import Icon from 'react-icecream/lib/icon'

import { Loadings } from 'portal-base/common/loading'

import './style.less'

interface IEditableCellProps {
  value: string,
  editable: boolean,
  onChange: (value: string) => any,
  onCancel: () => any
}
@observer
export default class EditableCell extends React.Component<IEditableCellProps, any> {
  constructor(props: IEditableCellProps) {
    super(props)
    makeObservable(this)
    this.inputValue = this.props.value
    this.handleChange = this.handleChange.bind(this)
    this.confirmChange = this.confirmChange.bind(this)
    this.cancelChange = this.cancelChange.bind(this)
  }

  @observable inputValue = ''
  @observable loadings = new Loadings('save')

  @computed get isSaving() {
    return this.loadings.isLoading('save')
  }

  @action handleChange(evt: ChangeEvent<HTMLInputElement>) {
    this.inputValue = evt.target.value
  }

  @action confirmChange() {
    if (this.isSaving) {
      return Promise.reject('not end')
    }
    const result = this.props.onChange(this.inputValue)
    return this.loadings.promise('save', result)
  }

  @action cancelChange() {
    this.inputValue = this.props.value
    if (this.props.onCancel) {
      this.props.onCancel()
    }
  }

  render() {
    if (!this.props.editable) {
      return <span>{this.props.value}</span>
    }

    const styleForBtns = {
      display: this.isSaving ? 'none' : 'inline-block'
    }

    return (
      <div className="editable-cell">
        <Input
          size="small"
          value={this.inputValue}
          disabled={this.isSaving}
          onChange={evt => this.handleChange(evt)}
          onPressEnter={() => this.confirmChange()}
        />
        <span onClick={() => this.confirmChange()} style={styleForBtns}>
          <Icon type="check" className="confirm" />
        </span>
        <span onClick={() => this.cancelChange()} style={styleForBtns}>
          <Icon type="close" className="cancel" />
        </span>
      </div>
    )
  }
}
