/**
 * @desc component for Role
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React, { ReactInstance } from 'react'
import { observer } from 'mobx-react'
import { reaction, observable, action, makeObservable } from 'mobx'
import PropTypes from 'prop-types'

import Disposable from 'qn-fe-core/disposable'

export const roleContextName = 'registeRole'

export interface IRoleProps {
  name: string // name of role
}

@observer
export default class Role extends React.Component<IRoleProps> {
  /**
   * 通过 context 获取上层消费者提供的相关的方法和信息
   */
  static contextTypes = {
    [roleContextName]: PropTypes.func // 注册一个 Role 的方法
  }

  constructor(props: IRoleProps) {
    super(props)
    makeObservable(this)
  }

  disposable = new Disposable()

  @observable.ref ref: ReactInstance | null = null

  @action.bound updateRef(ref: ReactInstance | null) {
    this.ref = ref
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.ref,
      ref => {
        if (!this.props.name || !ref) { return }

        const registeRole = this.context[roleContextName]
        if (registeRole) {
          registeRole(this.props.name, this.ref)
        }
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    const { name, children } = this.props

    // 统一包一层 ClassComponent 以保证可以使用 ref，同时不增加额外的 dom 节点
    return (
      <ClassComponent ref={this.updateRef} data-role={name} data-role-name="role-wrapper">
        {children}
      </ClassComponent>
    )
  }
}

// eslint-disable-next-line react/prefer-stateless-function
class ClassComponent extends React.Component {
  render() {
    return <>{this.props.children}</>
  }
}
