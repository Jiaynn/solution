/**
 * @file Create Domain Component
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import { Query, RouterStore } from 'portal-base/common/router'
import { Iamed } from 'portal-base/user/iam'
import Page from 'portal-base/common/components/Page'

import {
  DomainType,
  Platform,
  GeoCover,
  SourceType
} from 'cdn/constants/domain'
import Routes from 'cdn/constants/routes'
import IamInfo from 'cdn/constants/iam-info'

import { CreateResult, ICreateDomainState } from './Result'
import CreateForm, { ConfigInputType, Props as CreateFormProps } from './CreateForm'

import LocalStore from './store'

import './style.less'

export interface Props {
  type?: DomainType; // 设置默认的域名类型
  pareDomain?: string; // 设置默认的父域名（目标为泛子域名时）
  bucket?: string; // 设置默认的源站 bucket
  anchor?: string; // 滚动到指定的锚点
  platform?: Platform; // 设置默认的域名使用场景
  shouldFixBucket?: boolean; // 是否锁定源站 bucket
  geoCover?: GeoCover; // 覆盖范围
  sourceType?: SourceType; // 回源类型
  sourceDomain?: string; // 源站域名
  testURLPath?: string; // 源站测试资源名
}

export const DomainCreate = observer(function DomainCreate(
  props: Props & Partial<Pick<CreateFormProps, 'onCreate' | 'onCancel'>>
) {
  const store = useLocalStore(LocalStore, props)

  const routerStore = useInjection(RouterStore)
  const routes = useInjection(Routes)
  const { iamActions } = useInjection(IamInfo)
  const { onCancel, onCreate } = props

  const handleCreate = React.useCallback(
    () => store.create().then(results => {
      const createDomainState: ICreateDomainState = {
        results,
        domainType: store.domainType,
        createOptions:
          store.domainType === DomainType.Pan
            ? [store.panCreateOptions]
            : store.normalCreateOptionsList
      }
      if (results.some(it => !!it.shouldVerify)) {
        routerStore.push(routes.domainVerifyOwnership(createDomainState))
      } else if (createDomainState.results.every(item => item.result === CreateResult.Success)) {
        onCreate()
      } else {
        routerStore.push(routes.domainCreateResult(createDomainState))
      }
    }),
    [store, routerStore, routes, onCreate]
  )

  return (
    <Iamed actions={[iamActions.CreateDomain]}>
      <Page className="comp-create-domain" mainClassName="page-wrapper">
        <CreateForm
          onCancel={onCancel}
          onCreate={handleCreate}
          domains={store.domains}
          wildcardDomains={store.wildcardDomains}
          hasIcp={store.hasIcp}
          hasIcpChecker={store.hasIcpChecker}
          anchor={props.anchor as ConfigInputType}
          shouldFixBucket={props.shouldFixBucket}
          state={store.state}
          isPrivateBucket={store.isQiniuPrivate}
        />
      </Page>
    </Iamed>
  )
})

export default observer(function DomainCreateWithQuery(props: {
  query: Query;
} & Partial<Pick<CreateFormProps, 'onCreate' | 'onCancel'>>) {
  const {
    type,
    pareDomain,
    bucket,
    platform,
    geoCover,
    sourceType,
    sourceDomain,
    testURLPath,
    fixBucket
  } = props.query
  const { onCancel, onCreate } = props
  const routerStore = useInjection(RouterStore)
  const routeHash = routerStore.location!.hash

  return (
    <DomainCreate
      type={type as DomainType | undefined}
      pareDomain={pareDomain as string | undefined}
      bucket={bucket as string | undefined}
      platform={platform as Platform | undefined}
      geoCover={geoCover as GeoCover | undefined}
      sourceType={sourceType as SourceType | undefined}
      sourceDomain={sourceDomain as string | undefined}
      testURLPath={testURLPath as string | undefined}
      anchor={routeHash ? routeHash.slice(1) : undefined}
      shouldFixBucket={fixBucket != null}
      onCreate={onCreate}
      onCancel={onCancel}
    />
  )
})
