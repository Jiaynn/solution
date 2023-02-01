/**
 * @file component MetaInfoDrawer 文件的 meta
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Drawer } from 'react-icecream/lib'

import MetaManage from '../MetaManage'
import styles from './style.m.less'

export interface IProps {
  visible: boolean
  bucketName: string
  fname: string
  onClose(): void
  domain?: string
  version?: string
}

export default observer(function MetaInfoDrawer(props: IProps) {
  const { visible, onClose, domain, fname, version, bucketName } = props
  return (
    <Drawer
      className={styles.metaDrawer}
      visible={visible}
      onClose={onClose}
      onOk={onClose}
      okText="关闭"
      width={620}
      title="文件详情"
    >
      <MetaManage bucketName={bucketName} visible={visible} domain={domain} fname={fname} version={version} />
    </Drawer>
  )
})
