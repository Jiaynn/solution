import React from 'react'

import reflashPng from './reflash.png'
import styles from './style.m.less'

interface ReflashProps {
  onReflash: () => void
  spinning?: boolean
}

function Reflash(props: ReflashProps) {
  const { onReflash, spinning = false } = props
  const className = `${styles.img} ${spinning && styles.rotate}`
  return (
    <img
      className={className}
      onClick={onReflash}
      src={reflashPng}
      alt="刷新"
    />
  )
}
export default Reflash
