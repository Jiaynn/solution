import React from 'react'
import classNames from 'classnames'

import './style.less'

const prefixCls = 'lowcode-header'

interface Props {
  className?: string
  style?: React.CSSProperties
}

export const LowCodeHeader: React.FC<Props> = props => {
  const { className, style } = props
  return (
    <div className={classNames(prefixCls, className)} style={style}>
      Header
    </div>
  )
}
