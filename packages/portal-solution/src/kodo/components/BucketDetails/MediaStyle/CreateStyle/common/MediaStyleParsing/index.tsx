
import * as React from 'react'
import { Loading } from 'react-icecream-2'

import styles from './style.m.less'

export function MediaStyleParsing() {
  return (
    <div className={styles.mediaStyleParsing}>
      <Loading />
      <span className={styles.text}>样式解析中...</span>
    </div>
  )
}
