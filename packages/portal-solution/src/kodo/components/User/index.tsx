/**
 * @file component User
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import autobind from 'autobind-decorator'
import { Tabs } from 'react-icecream/lib'
import { Route, RouterStore } from 'portal-base/common/router'
import { Profile } from 'portal-base/user/account'
import { UserKey } from 'portal-base/user/ak-sk'
import { OpLog } from 'portal-base/user/op-log'  // TODO: @huangbingjie 这里的 LoadMore 更换

import { ConfigStore } from 'kodo/stores/config'
import { KodoIamStore } from 'kodo/stores/iam'

import { TabKey, getUserPath } from 'kodo/routes/user'

import { App } from 'kodo/constants/app'
import Security from './Security'

import styles from './style.m.less'

export interface IProps {
  page: TabKey
}

@observer
class InternalUserCenter extends React.Component<IProps & { inject: InjectFunc }> {
  constructor(props: IProps & { inject: InjectFunc }) {
    super(props)
    makeObservable(this)
  }

  @autobind
  handleUserTabChange(key: TabKey) {
    const routerStore = this.props.inject(RouterStore)
    routerStore.push(getUserPath(this.props.inject, { page: key }))
  }

  getTabPane(key: TabKey, title: string, children: JSX.Element, isEnable: boolean) {
    if (!isEnable) {
      return null
    }

    return (
      <Tabs.TabPane tab={title} key={key}>
        <Route title={title} path={getUserPath(this.props.inject, { page: key })}>
          {children}
        </Route>
      </Tabs.TabPane>
    )
  }

  @computed
  get globalConfig() {
    const configStore = this.props.inject(ConfigStore)
    return configStore.getFull(App.Platform)
  }

  @computed
  get isProfileEnable() {
    const iamStore = this.props.inject(KodoIamStore)
    return this.globalConfig.user.profile.enable && !iamStore.isIamUser
  }

  @computed
  get isKeyEnable() {
    return this.globalConfig.user.key.enable
  }

  @computed
  get isSecurityEnable() {
    const iamStore = this.props.inject(KodoIamStore)
    return this.globalConfig.user.security.enable && !iamStore.isIamUser
  }

  @computed
  get isOplogEnable() {
    const iamStore = this.props.inject(KodoIamStore)
    return this.globalConfig.user.oplog.enable && !iamStore.isIamUser
  }

  @computed
  get akSkHelpDocURl() {
    const configStore = this.props.inject(ConfigStore)
    const globalConfig = configStore.getFull(App.Platform)
    return globalConfig.documentUrls.aksk
  }

  render() {
    return (
      <Tabs
        activeKey={this.props.page}
        onChange={this.handleUserTabChange}
        className={styles.tabWrapper}
      >
        {this.getTabPane(
          TabKey.Profile,
          '个人信息',
          (<Profile />),
          this.isProfileEnable
        )}
        {this.getTabPane(
          TabKey.Key,
          '密钥管理',
          // TODO: UserKey 支持无 doc @yinxulai
          (<UserKey docUrl={this.akSkHelpDocURl || 'about:blank'} />),
          this.isKeyEnable
        )}
        {this.getTabPane(
          TabKey.Security,
          '安全设置',
          (<Security />),
          this.isSecurityEnable
        )}
        {this.getTabPane(
          TabKey.OpLog,
          '操作日志',
          (<OpLog />),
          this.isOplogEnable
        )}
      </Tabs>
    )
  }
}

export default function UserCenter(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalUserCenter {...props} inject={inject} />
    )} />
  )
}
