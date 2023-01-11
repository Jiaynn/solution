/**
 * @file Preformatted component
 * @description 主要用于预格式文本
 * @author zhangheng01<zhangheng01@qiniu.com>
 */

import * as React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'

import styles from './style.m.less'

export interface IProps {
  children: React.ReactNode
  className?: string
}

export default observer(function Preformatted(props: IProps) {
  return <span className={classNames(styles.formatted, props.className)}>{props.children}</span>
})
