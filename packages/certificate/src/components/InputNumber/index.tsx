/*
 * @file component InputNumber
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'

import Input from 'react-icecream/lib/input'

import './style.less'

interface IInputNumberProps {
  type: string,
  value: number,
  handleUp?: (type: string) => any,
  handleDown?: (type: string) => any,
  handleChange?: (type: string, value: any) => any,
  handleBlur?: (type: string, value: any) => any,
  canChange?: (direction: string, type: string) => boolean
  disabled?: boolean
}

@observer
export default class InputNumber extends React.Component<IInputNumberProps, any> {
  handleUp = () => {
    if (this.props.handleUp) {
      this.props.handleUp(this.props.type)
    }
  }

  handleDown = () => {
    this.props.handleDown!(this.props.type)
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.handleChange!(this.props.type, e.target.value)
  }

  handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    this.props.handleBlur!(this.props.type, e.target.value)
  }

  render() {
    const disabled = this.props.disabled
    const upDisabled = disabled
                       || !this.props.canChange!('up', this.props.type)
    const downDisabled = disabled
                         || !this.props.canChange!('down', this.props.type)
    return (
      <div className="qn-input-number">
        <div className="qn-input-number-handler-wrap">
          <a
            className={`qn-input-number-handler qn-input-number-handler-up ${upDisabled ? 'disabled' : ''}`}
            onClick={upDisabled ? undefined : this.handleUp}
          ></a>
          <a
            className={`qn-input-number-handler qn-input-number-handler-down ${downDisabled ? 'disabled' : ''}`}
            onClick={downDisabled ? undefined : this.handleDown}
          ></a>
        </div>
        <Input
          value={this.props.value}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          disabled={disabled}
        />
      </div>
    )
  }
}
