/**
 * @desc 空间 流媒体网关（Stream Media Storage Gateway，SMSG） 设置面板
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { Component } from 'react'
import { observer } from 'mobx-react'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import SMSGSwitch from './SMSGSwitch'
import StreamPushAddrQueryModal from './StreamPushAddrQueryModal'
import SettingCard from '../Card'
import styles from '../style.m.less'

export interface IProps extends IDetailsBaseOptions {}

@observer
class SMSG extends Component<IProps> {
  render() {
    return (
      <SettingCard
        className={styles.cardWithEntry}
        title="流媒体网关"
        tooltip="七牛流媒体存储网关，提供直播流视频存储和录制回放的服务，推荐以七牛拉流转推模式对接接入。"
      >
        <SMSGSwitch
          bucketName={this.props.bucketName}
          renderWhenChecked={<StreamPushAddrQueryModal bucketName={this.props.bucketName} />}
        />
      </SettingCard>
    )
  }
}

export default SMSG
