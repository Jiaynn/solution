/**
 * @file 镜像回源 (image / mirror / source)
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { observable, action, makeObservable } from 'mobx'
import { Button } from 'react-icecream/lib'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'
import SettingCard from '../Card'
import { injectMainBtnClickHookProps } from '../Card/sensors'
import SourceDrawer from './Main'

// import styles from './style.less'
import cardStyles from '../style.m.less'

export interface IProps extends IDetailsBaseOptions { }

@observer
class SettingSource extends React.Component<IProps> {
  @observable drawerVisible = false

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @action.bound
  updateDrawerVisible(visible: boolean) {
    this.drawerVisible = visible
  }

  render() {
    return (
      <>
        <SettingCard
          title="镜像回源"
          tooltip="设置镜像回源后，可以在源站资源（文件/图片等）初次访问时自动同步到空间，实现数据平滑迁移。"
          doc="source"
          className={cardStyles.cardWithEntry}
        >
          <Button
            className={cardStyles.cardOpBtn}
            onClick={() => this.updateDrawerVisible(true)}
            {...injectMainBtnClickHookProps('镜像回源')}
          >
            设置
          </Button>
        </SettingCard>
        <SourceDrawer
          bucketName={this.props.bucketName}
          visible={this.drawerVisible}
          onVisibleChange={this.updateDrawerVisible}
        />
      </>
    )
  }
}

export default SettingSource
