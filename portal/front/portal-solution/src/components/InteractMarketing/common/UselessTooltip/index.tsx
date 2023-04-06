import React, { CSSProperties } from 'react'
import { Alert, Icon, Tooltip } from 'react-icecream'

import styles from './style.m.less'

export interface UselessTooltipProps {
  className?: string
  style?: CSSProperties
  infoName: string
  loading?: boolean
  usable?: boolean
}

/**
 * 数据不可用时提示的组件
 */
const UselessTooltip: React.FC<UselessTooltipProps> = props => {
  const { className, infoName, style, loading = false, usable = false } = props
  return (
    <Tooltip
      className={`${className} ${styles.icon}`}
      style={style}
      overlayClassName={styles.alert}
      arrowPointAtCenter
      placement="topLeft"
      title={
        <Alert
          message={`此${infoName}当前已经不可用或者被删除，请检查确认，否则将会影响应用的正常运行`}
          type="warning"
          showIcon
        />
      }
    >
      {loading && <Icon type="loading" />}
      {!usable && <Icon type="exclamation-circle" />}
    </Tooltip>
  )
}

export default UselessTooltip
