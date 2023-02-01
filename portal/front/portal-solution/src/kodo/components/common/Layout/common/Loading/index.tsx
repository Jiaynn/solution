/**
 * @file component Loading
 * @author yinxulai <me@yinxulai.cn>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Spin } from 'react-icecream/lib'

import styles from './style.m.less'

@observer
export default class Loading extends React.Component {
  render() {
    return (
      <div className={styles.loading}>
        <Spin tip="加载中..." />
      </div>
    )
  }
}
