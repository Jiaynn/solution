/**
 * @desc Stream push route functions
 * @author hovenjay <hovenjay@outlook.com>
 */

import { InjectFunc } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'

import { ConfigStore } from 'kodo/stores/config'

import { StreamPushTabKey } from 'kodo/constants/stream-push'

export function getStreamPushPath(inject: InjectFunc, key?: StreamPushTabKey) {
  const configStore = inject(ConfigStore)
  return configStore.rootPath + '/stream-push' + (key ? '/' + key : '')
}

export function gotoStreamPushPage(inject: InjectFunc, key?: StreamPushTabKey) {
  const routerStore = inject(RouterStore)
  routerStore.push(getStreamPushPath(inject, key))
}

export function gotoStreamPushTaskHistoryPage(inject: InjectFunc, taskName?: string) {
  const routerStore = inject(RouterStore)
  const qs: string = taskName ? '?name=' + taskName : ''
  routerStore.push(getStreamPushPath(inject, StreamPushTabKey.Histories) + qs)
}
