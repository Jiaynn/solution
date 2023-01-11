/**
 * @description output tip
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { Tooltip } from 'react-icecream-2'
import { HelpIcon } from 'react-icecream-2/icons'

import styles from './style.m.less'
import baseStyles from '../style.m.less'

export default function TranscodeCmdTip() {
  const title = (
    <div className={styles.tip}>
      <div>{'m3u8 文件名：{源文件名}_stylepreview_{预览时间}.m3u8;'}</div>
      <div>{'ts 文件名：{源文件名}_stylepreview_{预览时间}/$(count).ts，$(count)是 ts 文件的序号值'}</div>
    </div>
  )

  const tooltipView = (
    <Tooltip title={title} overlayClassName={baseStyles.tip} placement="topLeft">
      <HelpIcon className={styles.helpIcon} />
    </Tooltip>
  )

  return (
    <div className={styles.outputTip}>预览生成的 m3u8 和 ts 文件会保存在空间中。{tooltipView}</div>
  )
}
