/**
 * @desc Stream push main component
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { Component } from 'react'
import { Tabs } from 'react-icecream'
import PopupContainer from 'react-icecream/lib/popup-container'
import { action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { keyBy } from 'lodash/fp'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Route, Switch } from 'portal-base/common/router'

import { getStreamPushPath, gotoStreamPushPage } from 'kodo/routes/stream-push'

import { StreamPushTabKey, streamPushTabNameMap } from 'kodo/constants/stream-push'

import { NotFoundRedirect } from 'kodo/components/common/NotFoundRedirect'

import ExecHistoryList from './ExecHistoryList'
import TaskList from './TaskList'

import styles from './style.m.less'

export interface StreamPushProps {
  type: string
  taskName?: string
}

export interface StreamPushTabConfig {
  key: StreamPushTabKey
  name: string
  path: string
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalStreamPush extends Component<StreamPushProps & DiDeps> {
  constructor(props: StreamPushProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @action.bound
  handleTabChange(key: StreamPushTabKey) {
    gotoStreamPushPage(this.props.inject, key)
  }

  @computed
  get tabsConfig(): StreamPushTabConfig[] {
    return [
      {
        key: StreamPushTabKey.Tasks,
        name: streamPushTabNameMap[StreamPushTabKey.Tasks],
        path: getStreamPushPath(this.props.inject, StreamPushTabKey.Tasks)
      },
      {
        key: StreamPushTabKey.Histories,
        name: streamPushTabNameMap[StreamPushTabKey.Histories],
        path: getStreamPushPath(this.props.inject, StreamPushTabKey.Histories)
      }
    ]
  }

  @computed
  get tabView() {
    return (
      <Tabs activeKey={this.props.type} onChange={this.handleTabChange}>
        {this.tabsConfig.map(page => <Tabs.TabPane tab={page.name} key={page.key} />)}
      </Tabs>
    )
  }

  @computed
  get routesView() {
    const { tasks, histories } = keyBy<StreamPushTabConfig>('key')(this.tabsConfig)

    return (
      <Switch>
        <Route exact title={tasks.name} path={tasks.path}>
          <TaskList />
        </Route>
        <Route exact title={histories.name} path={histories.path}>
          <ExecHistoryList taskName={this.props.taskName} />
        </Route>
        <Route relative path="*">
          <NotFoundRedirect />
        </Route>
      </Switch>
    )
  }

  render() {
    return (
      <PopupContainer>
        {this.tabView}
        <div className={styles.content}>
          {this.routesView}
        </div>
      </PopupContainer>
    )
  }
}

export default function StreamPush(props: StreamPushProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalStreamPush {...props} inject={inject} />
    )} />
  )
}
