/**
 * @file Prompt component
 * @description Prompt 组件
 * @author yinxulai <me@yinxulai.com>
 */

// TODO: 改为使用 Alert
import * as React from 'react'

import styles from './style.m.less'

export type PromptType = 'normal' | 'warning' | 'error' | 'assist'

export interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: PromptType
  className?: string
}

// eslint-disable-next-line react/prefer-stateless-function
export default class Prompt extends React.Component<IProps> {

  static defaultProps = {
    type: 'normal'
  }

  render() {
    const { className, children, ...restProps } = this.props
    const typeClassName = this.props.type ? styles[this.props.type] : ''

    return (
      <div className={`${styles.base} ${typeClassName} ${className || ''}`} {...restProps}>
        {children}
      </div>
    )
  }
}
