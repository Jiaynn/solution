/**
 * @file Bucket log setting component
 * @description bucket 日志设置
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import SettingCard from '../Card'
import Form from './Form'

import styles from '../style.m.less'

export interface IProps extends IDetailsBaseOptions { }

@observer
class LogCard extends React.Component<IProps> {

  render() {
    return (
      <SettingCard
        doc="log"
        title="空间日志"
        className={styles.cardWithForm}
        tooltip="将空间访问日志文件写入指定的空间，便于查看管理。"
      >
        <Form {...this.props} />
      </SettingCard>
    )
  }
}
export default LogCard
