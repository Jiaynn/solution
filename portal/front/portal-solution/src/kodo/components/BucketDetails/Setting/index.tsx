/**
 * @file Bucket setting routes component
 * @description Bucket 设置路由
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Route, Switch } from 'portal-base/common/router'

import { BucketStore } from 'kodo/stores/bucket'
import { ConfigStore } from 'kodo/stores/config'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { NotFoundRedirect } from 'kodo/components/common/NotFoundRedirect'
import { AuthRoute } from 'kodo/components/common/Auth'
import Authorization from './Authorization/Main'
import CrossOrigin from './CrossOrigin/Main'
import Lifecycle from './Lifecycle/Main'
import Event from './Event/Main'
import Routing from './Routing/Main'
import SettingMain from './Main'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalSetting extends React.Component<IProps & DiDeps> {
  bucketStore = this.props.inject(BucketStore)
  configStore = this.props.inject(ConfigStore)

  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get bucketInfo() {
    return this.bucketStore.getDetailsByName(this.props.bucketName)
  }

  @computed
  get regionConfig() {
    return this.bucketInfo && this.configStore.getRegion({
      region: this.bucketInfo.region
    })
  }

  render() {
    return (
      <div>
        <Switch>
          <Route relative exact path="/">
            <SettingMain regionConfig={this.regionConfig} {...this.props} />
          </Route>
          {(this.regionConfig && this.regionConfig.objectStorage.bucketShare.enable) && (
            <Route relative title="空间授权" path="/authorization">
              <AuthRoute featureKeys={['KODO.KODO_BUCKET_SHARE']} notIamUser>
                <Authorization {...this.props} />
              </AuthRoute>
            </Route>
          )}
          <Route relative title="跨域设置" path="/cross-origin">
            <CrossOrigin {...this.props} />
          </Route>
          <Route relative title="生命周期设置" path="/lifecycle">
            {this.bucketInfo && (
              <Lifecycle
                {...this.props}
                region={this.bucketInfo.region}
              />
            )}
          </Route>
          <Route relative title="事件通知" path="/event">
            {this.bucketInfo && (
              <Event
                {...this.props}
                region={this.bucketInfo.region}
              />
            )}
          </Route>
          {(this.regionConfig && this.regionConfig.objectStorage.bucketRoutingRule.enable) && (
            <Route relative title="重定向" path="/routing">
              <AuthRoute notIamUser>
                {this.bucketInfo && (
                  <Routing
                    {...this.props}
                  />
                )}
              </AuthRoute>
            </Route>
          )}
          <Route relative path="*">
            <NotFoundRedirect />
          </Route>
        </Switch>
      </div>
    )
  }
}

export default function Setting(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSetting {...props} inject={inject} />
    )} />
  )
}
