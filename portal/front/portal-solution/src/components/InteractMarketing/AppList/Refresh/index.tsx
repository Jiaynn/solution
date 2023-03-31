import React from 'react'

import refreshPng from './refresh.png'
import styles from './style.m.less'

interface RefreshProps {
  onRefresh: () => void
  spinning?: boolean
}

function Refresh(props: RefreshProps) {
  const { onRefresh, spinning = false } = props
  const className = `${styles.img} ${spinning && styles.rotate}`
  return (
    <img
      className={className}
      onClick={onRefresh}
      src={refreshPng}
      alt="刷新"
    />
  )
}
export default Refresh
