/*
 * @file component App
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'

import { Route, Switch, Redirect } from 'portal-base/common/router'
import NotFound from 'portal-base/common/components/NotFound'

import { CompleteType } from '../../constants/domain'
import { ProductShortName } from '../../constants/ssl'
import Layout from '../Layout'
import SSLOverview from '../SSLOverview'
import SSLApply, { isValidApplyProps, SSLApplyProps } from '../SSLApply'
import SSLApplyResult from '../SSLApply/SSLApplyResult'
import Complete from '../Complete'
import SSLConfirmation from '../SSLConfirmation'
import SSLRenewal from '../SSLRenewal'
import AddDomain from '../AddDomain'
import SSLInformation from '../SSLInformation'
import Deploy from '../Deploy'
import { basename } from '../../constants/app'
import BootProvider from './BootProvider'

export default observer(function App() {
  return (
    <BootProvider>
      <Route title="证书管理" path={basename}>
        <Layout>
          <Switch placeholder={<NotFound />}>
            <Route relative path="/" exact><Redirect relative to="/ssl" /></Route>
            <Route relative path="/ssl">
              <Switch>
                <Route relative path="/" exact><SSLOverview /></Route>
                <Route
                  relative
                  title="详情"
                  path="/detail/:itemid/:type"
                  component={({ match }) => <SSLInformation itemid={match.params.itemid} type={match.params.type === 'cert' ? 'cert' : 'order'} />}
                />
              </Switch>
            </Route>
            <Route title="购买证书" relative path="/apply">
              <Switch>
                <Route
                  relative
                  path="/renewal/:orderid"
                  component={({ match }) => <SSLRenewal orderid={match.params.orderid} />}
                />
                <Route
                  relative
                  title="支付结果"
                  path="/result/:orderid/:type"
                  component={
                    ({ match }) => <SSLApplyResult orderid={match.params.orderid} type={match.params.type} />
                  }
                />
                <Route
                  relative
                  path="/"
                  component={({ query }) => {
                    const defaultProps = {
                      shortName: ProductShortName.SecureSiteOV,
                      years: undefined,
                      limit: undefined,
                      wildcardLimit: undefined
                    }
                    const { shortName, years, limit, wildcardLimit, renew, orderid, certid } = query
                    const queryParam = {
                      shortName: shortName ? shortName as ProductShortName : ProductShortName.SecureSiteOV,
                      years: years ? Number(years) : undefined,
                      limit: limit ? Number(limit) : undefined,
                      wildcardLimit: wildcardLimit ? Number(wildcardLimit) : undefined
                    }
                    const applyProps: SSLApplyProps = isValidApplyProps(queryParam)
                      ? { ...defaultProps, ...queryParam }
                      : defaultProps
                    return (
                      <SSLApply
                        {...applyProps}
                        renew={!!renew}
                        orderid={orderid as string}
                        certid={certid as string}
                      />
                    )
                  }}
                />
              </Switch>
            </Route>
            <Route title="补全信息"
              relative
              path="/complete/:type/:id"
              component={({ match }) => (
                <Complete id={match.params.id} type={match.params.type as CompleteType} />
              )}
            />
            <Route title="添加域名"
              relative
              path="/reissue/:id/add"
              exact
              component={({ match }) => (
                <AddDomain id={match.params.id} />
              )}
            />
            <Route title="证书部署"
              relative
              path="/deploy/:id"
              component={({ match }) => <Deploy id={match.params.id} />}
            />
            <Route title="公司信息确认函"
              relative
              path="/confirmation/:id"
              component={({ match }) => <SSLConfirmation id={match.params.id} />}
            />
          </Switch>
        </Layout>
      </Route>
    </BootProvider>
  )
})
