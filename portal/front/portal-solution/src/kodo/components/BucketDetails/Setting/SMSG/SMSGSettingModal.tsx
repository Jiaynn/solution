/**
 * @desc 空间 流媒体网关（Stream Media Storage Gateway，SMSG） 设置模态窗
 * @author hovenjay <hovenjay@outlook.com>
 */

import { observer } from 'mobx-react'
import React from 'react'
import { Modal } from 'react-icecream'
import { ModalProps } from 'react-icecream/esm/modal'

import Prompt from 'kodo/components/common/Prompt'

import SMSGSwitch from './SMSGSwitch'

import styles from './style.m.less'

export interface SMSGSettingModalProps extends ModalProps {
  bucket?: string

  onSMSGSwitchChange(checked: boolean): void
}

export default observer(
  ({ bucket, onSMSGSwitchChange, visible, onOk, onCancel, okButtonProps }: SMSGSettingModalProps) => {
    if (!bucket) return null

    return (
      <Modal
        title="开启流媒体网关"
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        okButtonProps={okButtonProps}
      >
        <Prompt>拉流转推到七牛云存储空间，需要开启流媒体网关功能。</Prompt>
        <div className={styles.bucketSMSGSetting}>
          <span className={styles.bucketSMSGSwitchLabel}>
            空间 <span className={styles.bucketName}>{bucket}</span> 流媒体网关：
          </span>
          <SMSGSwitch
            bucketName={bucket}
            onChange={onSMSGSwitchChange}
          />
        </div>
      </Modal>
    )
  }
)
