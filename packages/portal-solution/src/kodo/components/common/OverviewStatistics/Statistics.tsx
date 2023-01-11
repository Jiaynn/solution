/**
 * @file component Statistics of OverviewStatistics
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import { Spin, Icon } from 'react-icecream/lib'

import { Arrow } from '.'
import styles from './style.m.less'

interface IProps {
  isLoading: boolean
  currentText: string
  lastText: string
  currentData: number | string
  lastData: number | string
  icon?: string
}

export default observer(function Statistics(props: IProps) {
  const { currentData, lastData, currentText, lastText, icon } = props
  return (
    <Spin spinning={props.isLoading}>
      <section className={styles.statisticsCard}>
        <span className={styles.currentData}>{currentData}</span>
        <div className={styles.currentText}>
          {currentText}
          {icon && (
            <Icon type={icon} className={classNames({
              [styles.arrowDown]: icon === Arrow.Down,
              [styles.arrowUp]: icon === Arrow.Up
            })} />
          )}
        </div>
        <div className={styles.lastText}>
          {lastText} {lastData}
        </div>
      </section>
    </Spin>
  )
})
