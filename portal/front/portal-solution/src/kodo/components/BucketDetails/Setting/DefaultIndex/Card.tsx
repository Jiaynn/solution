/**
 * @description Bucket setting index page card
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import { observer } from 'mobx-react'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'
import SettingCard from '../Card'
import Switch from './Switch'
import styles from '../style.m.less'

export interface IProps extends IDetailsBaseOptions { }

@observer
class DefaultIndex extends React.Component<IProps> {

  render() {
    return (
      <SettingCard
        className={styles.cardWithEntry}
        title="默认首页设置"
        tooltip="开启功能后，空间根目录及子目录中的 index.html（或 index.htm）文件将会作为默认首页进行展示。"
      >
        <Switch {...this.props} />
      </SettingCard>
    )
  }
}

export default DefaultIndex
