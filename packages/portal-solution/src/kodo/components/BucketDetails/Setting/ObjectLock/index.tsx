/**
 * @file Bucket Object Lock Setting
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { Component } from 'react'
import { observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button } from 'react-icecream/lib'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import SettingCard from '../Card'
import SettingDrawer from './SettingDrawer'
import { injectMainBtnClickHookProps } from '../Card/sensors'
import styles from '../style.m.less'

export interface IProps extends IDetailsBaseOptions { }

@observer
class ObjectLock extends Component<IProps> {
  @observable settingDrawerVisibility = false

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @action.bound toggleSettingDrawerVisibility() {
    this.settingDrawerVisibility = !this.settingDrawerVisibility
  }

  render() {
    return (
      <>
        <SettingCard
          className={styles.cardWithEntry}
          title="对象锁定"
          tooltip="使用一次写入多次读取（WORM）模型存储对象，以防止对象在固定的时间段内或无限期地被删除或覆盖。"
          doc="worm"
        >
          <Button
            {...injectMainBtnClickHookProps('对象锁定')}
            className={styles.cardOpBtn}
            onClick={this.toggleSettingDrawerVisibility}
          >
            设置
          </Button>
        </SettingCard>
        <SettingDrawer
          bucketName={this.props.bucketName}
          visible={this.settingDrawerVisibility}
          onClose={this.toggleSettingDrawerVisibility}
        />
      </>
    )
  }
}

export default ObjectLock
