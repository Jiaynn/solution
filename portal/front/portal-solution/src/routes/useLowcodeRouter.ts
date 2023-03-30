import { RouterStore } from 'portal-base/common/router'
import { useInjection } from 'qn-fe-core/di'
import { withQueryParams } from 'qn-fe-core/utils'

import { interactMarketingPath } from 'utils/router'

const prefix = interactMarketingPath

export default function useInteractMarketingRouter() {
  const routerStore = useInjection(RouterStore)

  /**
   * 未开通用户进入
   */
  const toOpenService = () => {
    routerStore.push(`${prefix}/open-service`)
  }

  /**
   * 用户开通后，提示可以创建应用，点击后跳转到「应用列表」
   * */
  const toAppList = () => {
    routerStore.push(`${prefix}/app/list`)
  }

  const toAppInfo = (appId: string) => {
    routerStore.push(withQueryParams(`${prefix}/app/info`, { appId }))
  }

  const toAppEdit = (appId: string, step: '1' | '2' | '3' = '1') => {
    routerStore.push(
      withQueryParams(`${prefix}/app/edit/step/${step}`, { appId })
    )
  }

  const toEditCompleted = (appId: string) => {
    routerStore.push(withQueryParams(`${prefix}/app/edit/completed`, { appId }))
  }

  const toAppCreate = (step: '1' | '2' | '3' = '1') => {
    routerStore.push(`${prefix}/app/create/step/${step}`)
  }

  const toCreateCompleted = (appId: string) => {
    routerStore.push(
      withQueryParams(`${prefix}/app/create/completed`, { appId })
    )
  }

  return {
    routerStore,
    toAppList,
    toEditCompleted,
    toCreateCompleted,
    toAppInfo,
    toAppEdit,
    toAppCreate,
    toOpenService
  }
}
