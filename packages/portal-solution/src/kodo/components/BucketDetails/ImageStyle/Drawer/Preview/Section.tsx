/**
 * @description section component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'

import styles from './style.m.less'

interface Props {
  title: React.ReactNode
  extra?: React.ReactNode
  className?: string
}

export function Section(props: React.PropsWithChildren<Props>) {
  const { title, extra, className, children } = props
  return (
    <div className={`${styles.section} ${className || ''}`}>
      <div className={styles.head}>
        <div className={styles.title}>{title}</div>
        <div className={styles.extra}>{extra}</div>
      </div>
      {children}
    </div>
  )
}
