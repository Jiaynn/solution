import React, { ReactNode } from 'react'

import styles from './style.m.less'

const SubConfigWrapper: React.FC<{ renderLinks?: ReactNode }> = props => (
  <div className={styles.subConfig}>
    {props.children}
    {props.renderLinks && (
      <div className={styles.links}>{props.renderLinks}</div>
    )}
  </div>
)

export default SubConfigWrapper
