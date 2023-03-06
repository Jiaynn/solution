import React, { useMemo } from 'react'
import { observer } from 'mobx-react'
import {
  Redirect,
  Route,
  RouterStore,
  Switch
} from 'portal-base/common/router'
import NotFound from 'portal-base/common/components/NotFound'
import { Divider, Button, Modal } from 'react-icecream'
import { useInjection } from 'qn-fe-core/di'

import { getFirstQuery } from 'kodo/utils/url'
import { SearchType } from 'kodo/routes/bucket'
import { RegionSymbolWithAll } from 'kodo/constants/region'
import { getBooleanQuery, updateQueryString } from 'kodo/utils/route'
import { PrivateType } from 'kodo/constants/bucket/setting/access'
import { ConfigurationHeader } from 'components/image/Configuration/common/ConfigurationHeader'
import OpenService from 'components/image/Configuration/OpenService'
import { BucketStore } from 'kodo/stores/bucket'
import { BucketListStore } from 'kodo/stores/bucket/list'
import { ImageSolutionApis } from 'apis/image'
import ConfigureImageStyle from './ConfigureImageStyle'
import ConfigurationComplete from './ConfigurationComplete'
import DomainName from './DomainName'
import VerifyOwnership from 'cdn/components/Domain/Create/VerifyOwnership'
import DomainCreateResult from 'cdn/components/Domain/Create/Result'
import { imagePath } from 'utils/router'
import BucketList from 'kodo/components/BucketList'

import './style.less'

const prefixCls = 'comp-configuration'

const StepRouter = () => (
  <Switch>
    <Route
      relative
      exact
      path="/step/:id"
      component={match => {
        const id = match.match.params.id
        const query = match.query
        if (id === '1') {
          const {
            region,
            searchTag,
            searchType,
            retrieveDomain,
            searchName,
            shouldCreateBucket,
            redirectAfterCreate,
            privateType
          } = query

          return (
            <BucketList
              searchTag={getFirstQuery(searchTag)}
              searchName={getFirstQuery(searchName)}
              searchType={getFirstQuery(searchType) as SearchType}
              region={getFirstQuery(region) as RegionSymbolWithAll}
              shouldCreateBucket={getBooleanQuery(
                getFirstQuery(shouldCreateBucket)
              )}
              redirectAfterCreate={getFirstQuery(redirectAfterCreate)}
              retrieveDomain={getFirstQuery(retrieveDomain)}
              privateType={
                getFirstQuery(privateType) === PrivateType.Public.toString()
                  ? PrivateType.Public
                  : PrivateType.Private
              }
            />
          )
        }

        if (id === '2') {
          return <DomainName query={query} />
        }

        if (id === '3') {
          return <ConfigureImageStyle query={query} />
        }

        if (id === '4') {
          return (
            <ConfigurationComplete buyResourcesURI="https://qmall.qiniu.com" />
          )
        }

        return <NotFound />
      }}
    />
  </Switch>
)

export default observer(function Configuration() {
  const routerStore = useInjection(RouterStore)
  const bucketStore = useInjection(BucketStore)
  const bucketListStore = useInjection(BucketListStore)
  const imageSolutionApis = useInjection(ImageSolutionApis)
  const currentStep = useMemo(
    () => Number(routerStore.location?.pathname.split('/').pop() || '0'),
    [routerStore.location?.pathname]
  )
  const isStepping = currentStep < 4
  const showPrev = currentStep > 1

  const onStep1Next = () => {
    const { list } = bucketListStore
    const { lastCreatedBucketName } = bucketStore
    const { configurationState } = routerStore.query
    const prefixRoute = `${imagePath}/configuration/step`
    if (lastCreatedBucketName) {
      routerStore.push(
        `${prefixRoute}/${currentStep + 1}?bucket=${lastCreatedBucketName}&configurationState=${configurationState}&fixBucket`
      )
      return
    }
    if (list.length) {
      routerStore.push(
        `${prefixRoute}/${currentStep + 1}?bucket=${list[list.length - 1].tbl
        }&configurationState=${configurationState}&fixBucket`
      )
      return
    }
    Modal.confirm({
      title: '请选创建方案存储空间',
      content: '必须要创建方案专属空间后，才可以继续配置方案',
      okText: '创建空间',
      onOk() {
        updateQueryString(routerStore, {
          shouldCreateBucket: true
        })
      }
    })
  }
  const onStep2Next = () => {
    const prefixRoute = `${imagePath}/configuration/step`
    const { bucket, configurationState } = routerStore.query
    routerStore.push(
      `${prefixRoute}/${currentStep + 1
      }?bucket=${bucket}&configurationState=${configurationState}`
    )
  }
  const onStep3Next = async () => {
    // 发送配置完成的请求，改变是否配置状态
    try {
      await imageSolutionApis.completeSolution({ solution_code: 'image' })
    } catch (error) {
      Modal.error({ content: `${error}` })
    }
    routerStore.push(`${imagePath}/configuration/step/${currentStep + 1}`)
  }

  /**
   * 点击下一步
   */
  const onNext = () => {
    const stepClickList = [onStep1Next, onStep2Next, onStep3Next]
    stepClickList[currentStep - 1]?.()
  }

  const onPrev = () => {
    const prefixRoute = `${imagePath}/configuration/step`
    const { bucket, configurationState } = routerStore.query
    const shouldCreateBucketState = JSON.parse(String(configurationState))
    if (currentStep === 2) {
      routerStore.push(
        `${prefixRoute}/${currentStep - 1}?configurationState=${configurationState}&shouldCreateBucket=${!shouldCreateBucketState}`
      )
    } else if (currentStep === 3) {
      routerStore.push(
        `${prefixRoute}/${currentStep - 1
        }?bucket=${bucket}&configurationState=${configurationState}&fixBucket`
      )
    }
  }

  return (
    <Switch>
      <Route relative exact path="/">
        <Redirect relative to="/open-service" />
      </Route>
      <Route relative path="/open-service">
        <OpenService />
      </Route>
      <Route relative path="/domain/verify-ownership" title="七牛云-验证域名归属权"><VerifyOwnership /></Route>
      <Route relative
        path="/domain/create/result"
        title="七牛云-创建完成"
        component={
          ({ query }) => (
            <DomainCreateResult
              retryImmediately={Boolean(query.retryImmediately)}
            />
          )
        } />
      <Route relative path="/">
        <div className={prefixCls}>
          <ConfigurationHeader stepsVisible current={currentStep} />
          <StepRouter />

          {isStepping && <Divider />}

          {isStepping && showPrev && <Button onClick={onPrev}>上一步</Button>}
          {isStepping && (
            <Button type="primary" onClick={onNext}>
              下一步
            </Button>
          )}
        </div>
      </Route>

    </Switch>
  )
})
