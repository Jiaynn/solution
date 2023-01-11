
import React from 'react'
import { Button } from 'react-icecream-2'
import { useInjection } from 'qn-fe-core/di'
import { FileStatus } from 'kodo-base/lib/constants'
import { actions as iamActions, IamPermissionStore, IamService } from 'portal-base/user/iam'
import { ListItem, OnCreateBatchActions, OnCreateSingleActions } from 'kodo-base/lib/components/ObjectManager'
import { BatchObjectAction, SingleObjectAction } from 'kodo-base/lib/components/ObjectManager/common/types'

import { trimQueryString } from 'kodo/utils/url'

import { isShared } from 'kodo/transforms/bucket/setting/authorization'

import { ConfigStore } from 'kodo/stores/config'
import { IDomainInfo } from 'kodo/stores/domain'

import { ProtectedMode } from 'kodo/constants/bucket/setting/original-protected'
import { DomainSourceType } from 'kodo/constants/domain'

import { RefreshCdnStore } from 'kodo/components/common/RefreshCdnModal/store'

import { IBucket } from 'kodo/apis/bucket'

import styles from './style.m.less'

interface Props {
  urls: string[]
}

function RefreshCdnButton(props: Props) {
  const store = useInjection(RefreshCdnStore)

  return (
    <Button
      type="link"
      className={styles.extraAction}
      onClick={() => store.open(props.urls)}
    >
      刷新 CDN 缓存
    </Button>
  )
}

export function useCdnRefreshStatus(bucket: IBucket | undefined, domain: IDomainInfo | undefined): boolean {
  const [, forceRefresh] = React.useState(0)

  const configStore = useInjection(ConfigStore)
  const iamStore = useInjection(IamPermissionStore)
  const globalConfig = configStore.getFull()
  const availableBucket = !!(bucket && !isShared(bucket.perm))
  const availableConfig = globalConfig.fusion.enable && globalConfig.fusion.domain.enable
  const availableDomain = !!(domain && [DomainSourceType.CDN, DomainSourceType.CDNAndSource].includes(domain.type))
  const availableIamPermission = !iamStore.shouldSingleDeny({ actionName: iamActions.cdn.Refresh, resource: '*' })

  // 产品要求：公开空间 + 开启原图保护，不提供入口
  const pmProvision = !(bucket && !bucket.private && bucket.protected === ProtectedMode.Enable)

  React.useEffect(() => {
    if (!availableConfig) return // 没必要查了
    // TODO: 减少重复的请求
    iamStore.fetchResourcesOfAction(IamService.Cdn, 'Refresh')
      .finally(() => forceRefresh(p => p + 1))
  }, [availableConfig, iamStore])

  return availableConfig
    && pmProvision
    && availableDomain
    && availableBucket
    && availableIamPermission
}

export function useRefreshCndActions(bucket: IBucket | undefined, domain: IDomainInfo | undefined) {
  const available = useCdnRefreshStatus(bucket, domain)

  const fun: OnCreateSingleActions = (_versionEnabled: boolean) => {
    const actions: Array<SingleObjectAction<ListItem>> = []
    if (available) {
      actions.push({
        sort: 1.01, // 在多媒体相关的前面
        render: object => {
          if (object.type === 'folder') return null
          if (!object.details.preview_url) return null
          if (object.details.status === FileStatus.Disabled) return null
          const urlWithoutSign = trimQueryString(object.details.preview_url, ['e', 'token'])
          return (<RefreshCdnButton urls={[urlWithoutSign]} />)
        }
      })
    }

    return actions
  }

  return fun
}

export function useBatchRefreshCdnActions(bucket: IBucket | undefined, domain: IDomainInfo | undefined) {
  const available = useCdnRefreshStatus(bucket, domain)

  const func: OnCreateBatchActions<ListItem> = () => {
    if (!domain || ![DomainSourceType.CDN, DomainSourceType.CDNAndSource].includes(domain.type)) return []

    const actions: Array<BatchObjectAction<ListItem>> = []
    if (available) {
      const action: BatchObjectAction<ListItem> = {
        sort: 1.1, // 在多媒体相关的前面
        render: selection => {
          if (!selection?.selected.length) return null
          const availableUrls = selection?.selected.filter(i => (
            i.details.preview_url
            && i.details.status !== FileStatus.Disabled
          )) || []
          const withoutSign = availableUrls
            .map(i => i.details.preview_url).filter(Boolean)
            .map(url => trimQueryString(url!, ['e', 'token']))
          return (<RefreshCdnButton urls={withoutSign} />)
        }
      }

      actions.push(action)
    }

    return actions
  }

  return func
}
