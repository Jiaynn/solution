/**
 * @file Bucket setting referrer card component
 * @description Bucket setting referrer card
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Button } from 'react-icecream/lib'

import SettingCard from '../Card'
import { injectMainBtnClickHookProps } from '../Card/sensors'
import styles from '../style.m.less'

export interface IProps {
  onOpenForm()
}

@observer
export default class ReferrerCard extends React.Component<IProps> {

  render() {
    return (
      <SettingCard
        className={styles.cardWithEntry}
        title="Referer 防盗链"
        tooltip="HTTP Referer 黑白名单配置，用于防止盗链。"
        doc="safetyReferrer"
      >
        <Button
          className={styles.cardOpBtn}
          onClick={this.props.onOpenForm}
          {...injectMainBtnClickHookProps('Referer 防盗链')}
        >
          设置
        </Button>
      </SettingCard>
    )
  }
}
