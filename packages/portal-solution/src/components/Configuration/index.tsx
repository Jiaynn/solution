import React, { useMemo } from 'react'
import { observer } from 'mobx-react'

import { Redirect, Route, RouterStore, Switch } from 'portal-base/common/router'

import NotFound from 'portal-base/common/components/NotFound'

import { Steps, Divider, Button } from 'react-icecream'

import { StepProps } from 'react-icecream/lib/steps'

import { useInjection } from 'qn-fe-core/di'

import BucketList from 'kodo/components/BucketList'
import { getFirstQuery } from 'kodo/utils/url'
import { SearchType } from 'kodo/routes/bucket'
import { RegionSymbolWithAll } from 'kodo/constants/region'
import { getBooleanQuery } from 'kodo/utils/route'
import { PrivateType } from 'kodo/constants/bucket/setting/access'
import OpenService from 'components/Configuration/OpenService'
import { Header } from 'components/Configuration/Header'

import './style.less'

const prefixCls = 'comp-configuration'

const { Step } = Steps

const steps: StepProps[] = [
  { title: '存储空间配置', description: '提供默认存储服务，支持多存储地址管理' },
  {
    title: '加速域名配置',
    description: '为空间绑定自定义 CDN 加速域名，通过 CDN 边缘节点缓存数据，提高存储空间内的文件访问响应速度。'
  },
  { title: '图片处理配置', description: '自定义图片处理服务，支持加速、裁剪及水印等配置' }
]

const descriptions: Array<{
  title?: string;
  content?: string;
}> = [
  { title: '存储空间管理', content: '下方列表展示本方案的专属空间，可以点击「操作」栏中的「概览」可以查看空间的详细信息' },
  { title: '自定义CDN加速域名', content: '为空间绑定自定义CDN加速域名，通过CDN边缘节点缓存数据，提高存储空间内的文件访问响应速度' },
  { title: '图片样式处理配置', content: '' }
]

const StepRouter = () => <Switch>
  <Route
    relative
    path="/step/0"
    component={({ query }) => {
      const {
        region, searchTag, searchType, retrieveDomain,
        searchName, shouldCreateBucket, redirectAfterCreate,
        privateType
      } = query

      return (
        <BucketList
          searchTag={getFirstQuery(searchTag)}
          searchName={getFirstQuery(searchName)}
          searchType={getFirstQuery(searchType) as SearchType}
          region={getFirstQuery(region) as RegionSymbolWithAll}
          shouldCreateBucket={getBooleanQuery(getFirstQuery(shouldCreateBucket))}
          redirectAfterCreate={getFirstQuery(redirectAfterCreate)}
          retrieveDomain={getFirstQuery(retrieveDomain)}
          privateType={getFirstQuery(privateType) === PrivateType.Public.toString()
            ? PrivateType.Public
            : PrivateType.Private}
        />
      )
    }}
  />
  <Route relative path="/step/1">
    <div>/step/1</div>
  </Route>
  <Route relative path="/step/2">
    <div>/step/2</div>
  </Route>
  <Route relative path="/step/3">
    <div>/step/3</div>
  </Route>
</Switch>

export default observer(function Configuration() {
  const routerStore = useInjection(RouterStore)

  const step = useMemo(() => Number(routerStore.location?.pathname.split('/').pop() || '0'), [routerStore.location?.pathname])

  /**
   * 点击下一步
   */
  const onNext = () => {
    if (step < 3) {
      routerStore.push(`/kodo/configuration/step/${step + 1}`)
    }
  }

  const onPrev = () => {
    routerStore.push(`/kodo/configuration/step/${step - 1}`)
  }

  const isStepping = step < 3
  const showPrev = step > 0

  const curDescription = descriptions[step]

  return (
    <Switch placeholder={<NotFound />}>
      <Route relative exact path="/"><Redirect relative to="/open-service" /></Route>
      <Route relative path="/open-service"><OpenService /></Route>
      <Route relative path="/">
        <div className={prefixCls}>
          <Header />

          <div className={`${prefixCls}-title`}>
            配置向导
          </div>
          <Steps className={`${prefixCls}-steps`} current={step}>
            {steps.map((stepItem, index) => <Step {...stepItem} className={`${prefixCls}-step`} key={index} />)}
          </Steps>

          {
            isStepping && curDescription && <div className={`${prefixCls}-description`}>
              <div className={`${prefixCls}-description-title`}>{curDescription.title}</div>
              <Divider className={`${prefixCls}-description-divider`} />
              <div className={`${prefixCls}-description-content`}>{curDescription.content}</div>
            </div>
          }
          <StepRouter />
          {isStepping && <Divider />}

          {isStepping && showPrev && <Button onClick={onPrev}>上一步</Button>}
          {isStepping && <Button type="primary" onClick={onNext}>下一步</Button>}
        </div>
      </Route>
    </Switch>
  )
})
