/**
 * @file 空间授权
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import { Button } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Link } from 'portal-base/common/router'

import { getSettingAuthorizationPath } from 'kodo/routes/bucket/setting'
import { IDetailsBaseOptions } from 'kodo/routes/bucket'
import SettingCard from '../Card'
import { injectMainBtnClickHookProps } from '../Card/sensors'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalSettingAuthorization extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get authorizationPagePath() {
    return getSettingAuthorizationPath(
      this.props.inject,
      this.props.bucketName
    )
  }

  render() {
    return (
      <SettingCard
        title="空间授权"
        doc="authorization"
        tooltip="存储空间所有者可以将空间的只读或读写权限授权给其他用户。"
        className={styles.cardWithEntry}
      >
        <Link to={this.authorizationPagePath}>
          <Button className={styles.cardOpBtn} {...injectMainBtnClickHookProps('空间授权')}>设置</Button>
        </Link>
      </SettingCard>
    )
  }
}

export default function SettingAuthorization(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSettingAuthorization {...props} inject={inject} />
    )} />
  )
}
