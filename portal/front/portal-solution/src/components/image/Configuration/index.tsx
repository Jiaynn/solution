import React, { useMemo } from 'react'
import { observer } from 'mobx-react'

import {
  Redirect,
  Route,
  RouterStore,
  Switch
} from 'portal-base/common/router'

import NotFound from 'portal-base/common/components/NotFound'

import { Steps, Divider, Button, Modal } from 'react-icecream'

import { useInjection } from 'qn-fe-core/di'

import BucketList from 'kodo/components/BucketList'
import { getFirstQuery } from 'kodo/utils/url'
import { SearchType } from 'kodo/routes/bucket'
import { RegionSymbolWithAll } from 'kodo/constants/region'
import { getBooleanQuery, updateQueryString } from 'kodo/utils/route'
import { PrivateType } from 'kodo/constants/bucket/setting/access'
import { Header } from 'components/common/Header'
import OpenService from 'components/image/Configuration/OpenService'
import { BucketStore } from 'kodo/stores/bucket'
import { BucketListStore } from 'kodo/stores/bucket/list'
import { getSolutionPath } from 'constants/routes'
import { SolutionApis } from 'apis/imageSolution'

import ConfigureImageStyle from './ConfigureImageStyle'
import ConfigurationComplete from './ConfigurationComplete'
import DomainName from './DomainName'

import './style.less'

const prefixCls = 'comp-configuration'

const { Step } = Steps

const steps = [
  {
    title: '存储空间配置',
    description: '提供默认存储服务，支持多存储地址管理'
  },
  {
    title: '加速域名配置',
    description:
      '为空间绑定自定义 CDN 加速域名，通过 CDN 边缘节点缓存数据，提高存储空间内的文件访问响应速度。'
  },
  {
    title: '图片处理配置',
    description: '自定义图片处理服务，支持加速、裁剪及水印等配置'
  }
] as const

const descriptions = [
  {
    title: '存储空间管理',
    content:
      '下方列表展示本方案的专属空间，可以点击「操作」栏中的「概览」可以查看空间的详细信息'
  },
  {
    title: '自定义CDN加速域名',
    content:
      '为空间绑定自定义CDN加速域名，通过CDN边缘节点缓存数据，提高存储空间内的文件访问响应速度'
  },
  { title: '图片样式处理配置', content: '' }
] as const

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
  const solutionAPi = useInjection(SolutionApis)
  const step = useMemo(
    () => Number(routerStore.location?.pathname.split('/').pop() || '0'),
    [routerStore.location?.pathname]
  )
  const isStepping = step < 4
  const showPrev = step > 1

  const onStep1Next = () => {
    const { list } = bucketListStore
    const { lastCreatedBucketName } = bucketStore
    const { configurationState } = routerStore.query
    const prefixRoute = `${getSolutionPath('image')}/configuration/step`
    if (lastCreatedBucketName) {
      routerStore.push(
        `${prefixRoute}/${step + 1
        }?bucket=${lastCreatedBucketName}&configurationState=${configurationState}&fixBucket`
      )
      return
    }
    if (list.length) {
      routerStore.push(
        `${prefixRoute}/${step + 1}?bucket=${list[list.length - 1].tbl
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
    const prefixRoute = `${getSolutionPath('image')}/configuration/step`
    const { bucket, configurationState } = routerStore.query
    routerStore.push(
      `${prefixRoute}/${step + 1
      }?bucket=${bucket}&configurationState=${configurationState}`
    )
  }
  const onStep3Next = async () => {
    // 发送配置完成的请求，改变是否配置状态
    try {
      await solutionAPi.completeSolution({ solution_code: 'image' })
    } catch (error) {
      Modal.error({ content: `${error}` })
    }
    routerStore.push(`${getSolutionPath('image')}/configuration/step/${step + 1}`)
  }

  /**
   * 点击下一步
   */
  const onNext = () => {
    const stepClickList = [onStep1Next, onStep2Next, onStep3Next]
    stepClickList[step - 1]?.()
  }

  const onPrev = () => {
    const prefixRoute = `${getSolutionPath('image')}/configuration/step`
    const { bucket, configurationState } = routerStore.query
    const shouldCreateBucketState = JSON.parse(String(configurationState))
    if (step === 2) {
      routerStore.push(
        `${prefixRoute}/${step - 1}?configurationState=${configurationState}&shouldCreateBucket=${!shouldCreateBucketState}`
      )
    } else if (step === 3) {
      routerStore.push(
        `${prefixRoute}/${step - 1
        }?bucket=${bucket}&configurationState=${configurationState}&fixBucket`
      )
    }
  }

  const curDescription = descriptions[step - 1]

  return (
    <Switch>
      <Route relative exact path="/">
        <Redirect relative to="/open-service" />
      </Route>
      <Route relative path="/open-service">
        <OpenService />
      </Route>
      <Route relative path="/">
        <div className={prefixCls}>
          <Header />

          <div className={`${prefixCls}-title`}>配置向导</div>
          <Steps className={`${prefixCls}-steps`} current={step - 1}>
            {steps.map((stepItem, index) => (
              <Step {...stepItem} className={`${prefixCls}-step`} key={index} />
            ))}
          </Steps>

          {isStepping && curDescription && (
            <div className={`${prefixCls}-description`}>
              <div className={`${prefixCls}-description-title`}>
                {curDescription.title}
              </div>
              <Divider className={`${prefixCls}-description-divider`} />
              <div className={`${prefixCls}-description-content`}>
                {curDescription.content}
              </div>
            </div>
          )}
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
