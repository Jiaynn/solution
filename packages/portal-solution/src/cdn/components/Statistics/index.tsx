import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { Route, Redirect } from 'portal-base/common/router'
import { Iamed, IamPermissionStore } from 'portal-base/user/iam'
import { FeatureConfigStore, Featured } from 'portal-base/user/feature-config'
import Page from 'portal-base/common/components/Page'
import { useLocalStore } from 'portal-base/common/utils/store'

import { SearchType } from 'cdn/constants/statistics'
import Routes from 'cdn/constants/routes'
import IamInfo from 'cdn/constants/iam-info'

import StatisticsMenu from './Menu'
import StatisticsSearch from './Search'
import { PageConfig } from './config'
import LocalStore from './store'

import './style.less'

export interface IProps {
  type: 'usage' | 'log'
  pageConfig: PageConfig[]
}

interface PropsWithDeps extends IProps {
  store: LocalStore
  iamPermissionStore: IamPermissionStore
  featureConfigStore: FeatureConfigStore
  routes: Routes
  iamInfo: IamInfo
}

@observer
class StatisticsInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
  }

  @computed get links() {
    return this.props.pageConfig.filter(
      item => !this.props.iamPermissionStore.shouldOverallDeny({
        product: this.props.iamInfo.iamService,
        actions: item.iamActions
      })
    ).filter(
      item => !item.featureConfigKey || !this.props.featureConfigStore.isDisabled(item.featureConfigKey)
    )
      .map(
        item => ({
          path: this.props.routes.statistics(this.props.type, item.type),
          name: item.text
        })
      )
  }

  render() {
    const { store } = this.props
    const menuParams = store.searchDomain ? { domain: store.searchDomain } : undefined
    const pageRoutes = this.props.pageConfig.map(
      item => {
        const { type, iamActions, featureConfigKey, component: Component } = item
        return (
          <Route relative exact path={type} key={type}>
            <Iamed actions={iamActions}>
              <Featured feature={featureConfigKey!}>
                <Component options={store.searchOptions} type={type} />
              </Featured>
            </Iamed>
          </Route>
        )
      }
    )

    return (
      <Page className="statistics-wrapper" hasSpace={false}>
        <StatisticsMenu links={this.links} params={menuParams} />
        <div className="statistics-main-wrap">
          <Route relative exact path="/">
            {this.links.length > 0 && <Redirect to={this.links[0].path} />}
          </Route>
          <Route
            relative
            exact
            path="/:type"
            component={({ match }) => {
              const type = match.params.type as SearchType
              const iamActions = this.props.pageConfig.find(it => it.type === type)!

              return (
                <Iamed actions={iamActions.iamActions}>
                  <StatisticsSearch
                    type={type}
                    options={store.searchOptions}
                    onSubmit={options => store.updateOptions(options)}
                  />
                </Iamed>
              )
            }}
          />
          {pageRoutes}
        </div>
      </Page>
    )
  }
}

export default function Statistics(props: IProps) {
  const store = useLocalStore(LocalStore, props)
  const featureConfigStore = useInjection(FeatureConfigStore)
  const iamPermissionStore = useInjection(IamPermissionStore)
  const routes = useInjection(Routes)
  const iamInfo = useInjection(IamInfo)

  return (
    <StatisticsInner
      {...props}
      store={store}
      iamPermissionStore={iamPermissionStore}
      featureConfigStore={featureConfigStore}
      routes={routes}
      iamInfo={iamInfo}
    />
  )
}
