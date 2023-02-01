/**
 * @file Warning component
 * @author zhuhao <zhuhao@zhuhao@qiniu.com>
 */

import React from 'react'
import classNames from 'classnames'

export interface IProps {
  warning?: React.ReactNode
  className?: string
}

export default function Warning(props: React.PropsWithChildren<IProps>) {
  if (!props.warning && !props.children) {
    return null
  }

  return (
    <span className={classNames('warning-wrapper', props.className)}>
      {props.children || props.warning}
    </span>
  )
}
