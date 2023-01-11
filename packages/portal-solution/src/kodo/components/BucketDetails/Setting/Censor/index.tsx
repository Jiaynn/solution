/**
 * @file Bucket censor setting component
 * @description bucket 审核设置
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
export default class Censor extends React.Component<IProps> {

  render() {
    return (
      <SettingCard
        title="内容审核"
        className={styles.cardWithForm}
        tooltip="对空间内存量和增量图片/视频进行内容审核，根据用户设定的审核规则。"
        doc="censor"
      >
        <Form {...this.props} />
      </SettingCard>
    )
  }
}
