/**
 * @file 标签管理
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { action, observable, makeObservable } from 'mobx'
import { Button } from 'react-icecream/lib'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'
import SettingCard from '../Card'
import { injectMainBtnClickHookProps } from '../Card/sensors'
import Drawer from './Drawer'
import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

@observer
class SettingTagManage extends React.Component<IProps> {
  @observable drawerVisible = false

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @action.bound openDrawer() {
    this.drawerVisible = true
  }

  @action.bound closeDrawer() {
    this.drawerVisible = false
  }

  render() {
    return (
      <>
        <Drawer
          {...this.props}
          onClose={this.closeDrawer}
          visible={this.drawerVisible}
        />
        <SettingCard
          title="标签管理"
          // doc="bucketTagManage" // TODO: 补充文档
          className={styles.cardWithEntry}
          tooltip="可以为空间添加分类标签，每个Bucket最多10对。"
        >
          <Button
            onClick={this.openDrawer}
            className={styles.cardOpBtn}
            {...injectMainBtnClickHookProps('标签管理')}
          >
            设置
          </Button>
        </SettingCard>
      </>
    )
  }
}

export default SettingTagManage
