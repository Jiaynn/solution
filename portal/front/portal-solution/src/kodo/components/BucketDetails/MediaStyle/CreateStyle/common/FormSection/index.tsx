/**
 * @file Form 中的每一块区域
 */
import React, { PropsWithChildren, ReactNode } from 'react'

import styles from './style.m.less'

export default function FormSection({ title, children }: PropsWithChildren<{ title: ReactNode }>) {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  )
}
