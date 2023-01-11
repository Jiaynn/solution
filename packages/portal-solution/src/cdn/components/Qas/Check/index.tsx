/**
 * @file QAS 服务确认对话框组件
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { observable, action } from 'mobx'
import autobind from 'autobind-decorator'

import Button from 'react-icecream/lib/button'
import Modal from 'react-icecream/lib/modal'
import Checkbox from 'react-icecream/lib/checkbox'

import { PrimeLevel, primeLevelTextMap } from 'cdn/constants/qas'
import Specification from '../Specification'

export interface ICheckProps {
  level?: PrimeLevel
}

export const SpecificationCheck = ({ level }: ICheckProps) => {
  const current = (
    level
      ? `您目前已经申请或者使用${primeLevelTextMap[level]}套餐，若您希望更换套餐，请重新确认以下服务条款。`
      : null
  )

  return (
    <div className="prime-specific-check">
      <p className="prime-specific-current">{current}</p>
      <div className="prime-specific-content-wrap">
        <Specification />
      </div>
    </div>
  )
}

export interface IProps {
  current?: PrimeLevel
  visible: boolean
  onOK: () => void
  onCancel: () => void
}

@observer
export default class CheckModal extends React.Component<IProps> {
  @observable isChecked = false

  @action.bound
  updateCheckPrime(checked: boolean) {
    this.isChecked = checked
  }

  @autobind
  handleCancel() {
    this.updateCheckPrime(false)
    this.props.onCancel()
  }

  @autobind
  handleOk() {
    this.updateCheckPrime(false)
    this.props.onOK()
  }

  renderModalFooter() {
    return (
      <div className="prime-check-model-footer">
        <Checkbox
          className="prime-specific-checkbox"
          checked={this.isChecked}
          onChange={e => this.updateCheckPrime(e.target.checked)}
        >请详细阅读后确认开启服务</Checkbox>
        <div className="prime-check-model-operation">
          <Button onClick={this.handleCancel}>取消</Button>
          <Button type="primary" onClick={this.handleOk} disabled={!this.isChecked}>确定</Button>
        </div>
      </div>
    )
  }

  render() {
    return (
      <Modal
        title="服务条款说明"
        closable={false}
        maskClosable={false}
        className="prime-check-model"
        visible={this.props.visible}
        footer={this.renderModalFooter()}
      >
        <SpecificationCheck level={this.props.current} />
      </Modal>
    )
  }
}
