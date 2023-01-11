/**
 * @desc component for RoleConsumer for GuideGroup
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { observable, action, makeObservable } from 'mobx'

import { roleContextName } from '.'

interface IProps<T> {
  onRolesDomChange(rolesDom: Map<T, Element>): void
}

@observer
export default class RoleConsumer<T extends string> extends React.Component<IProps<T>> {
  /**
   * 通过 context 为 Role 提供注册 ref 的方法
   */
  static childContextTypes = {
    [roleContextName]: PropTypes.func
  }

  constructor(props: IProps<T>) {
    super(props)
    makeObservable(this)
  }

  getChildContext() {
    return {
      [roleContextName]: this.setRoleTarget // 注册一个 Role 的方法
    }
  }

  rolesMap = observable.map<T, Element>({}, { deep: false })
  @action.bound setRoleTarget(guideName: T, ref: React.ReactInstance) {
    // eslint-disable-next-line
    this.rolesMap.set(guideName, ReactDOM.findDOMNode(ref) as Element)
  }

  componentDidMount() {
    this.props.onRolesDomChange(this.rolesMap)
  }

  render() {
    return <>{this.props.children}</>
  }
}
