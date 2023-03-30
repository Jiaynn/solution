import React, { CSSProperties } from 'react'

import styles from './style.m.less'

const SubConfigTitle: React.FC<{
  style?: CSSProperties
  id?: string
  // 决定配置标题的字体颜色
  safety?: boolean
}> = props => {
  const { id, style, safety = true, children } = props
  return (
    <div
      id={id}
      tabIndex={0}
      className={styles.subConfigTitle}
      style={{ ...style, color: safety ? 'black' : '#dd2f1e' }}
    >
      {children}
    </div>
  )
}

export default SubConfigTitle
