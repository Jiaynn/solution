/**
 * @file dashboard route
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import { InjectFunc } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'

import { ConfigStore } from 'kodo/stores/config'

import { ReportType } from 'kodo/constants/dashboard'

export function getDashboardPath(inject: InjectFunc, key?: ReportType) {
  const configStore = inject(ConfigStore)
  const appRootPath = configStore.rootPath
  return `${appRootPath}/dashboard` + (key ? `/${key}` : '')
}

export function gotoDashboardPage(inject: InjectFunc, key?: ReportType) {
  const routerStore = inject(RouterStore)
  routerStore.push(getDashboardPath(inject, key))
}
