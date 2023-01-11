/**
 * @file not found path
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { InjectFunc } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'

import { ConfigStore } from 'kodo/stores/config'

import { App } from 'kodo/constants/app'

import { upsertUrlQuery } from '../utils/url'

/** @deprecated */
export function getPlatformNotFoundUrl(inject: InjectFunc) {
  const configStore = inject(ConfigStore)
  const routerStore = inject(RouterStore)

  const globalConfig = configStore.getBase(App.Platform)
  const currentHref = routerStore.createHref(routerStore.location!)
  return formatURL(`${globalConfig.site.rootPath}/404`, { from: currentHref })
}

/**
 * 获取 404 页面路径
 * - 当配置了当前产品的 site.notFoundPage 时返回该配置指定的 url 以及来源参数；
 * - 当未配置当前产品的 site.notFoundPage 时则返回内置的 404 页面路径并使用 from 作为默认的跳转来源参数；
 */
export function getNotFoundUrl(inject: InjectFunc): string {
  const configStore = inject(ConfigStore)
  const routerStore = inject(RouterStore)

  const { site: { rootPath, notFoundPage } } = configStore.isApp(App.Platform)
    ? configStore.getBase(App.Platform)
    : configStore.getBase()

  const url = notFoundPage && notFoundPage.url ? notFoundPage.url : `${rootPath}/404`
  const fromUrlParamName = notFoundPage && notFoundPage.fromUrlParamName ? notFoundPage.fromUrlParamName : 'from'
  const currentHref = routerStore.createHref(routerStore.location!)

  return upsertUrlQuery(url, { [fromUrlParamName]: currentHref })
}
