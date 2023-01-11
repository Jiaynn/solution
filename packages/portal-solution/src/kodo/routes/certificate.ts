/**
 * @file certificate routes
 * @description certificate 路由方法
 * @author yinxulai <me@yinxulai.com>
 */

import * as qs from 'query-string'
import { InjectFunc } from 'qn-fe-core/di'

import { ConfigStore } from 'kodo/stores/config'

export interface ICertificatePageOptions {
  openUpload?: boolean
}

// 获取证书管理页面的路径
export function getCertificatePath(inject: InjectFunc, options?: ICertificatePageOptions): string {
  const configStore = inject(ConfigStore)
  const globalConfig = configStore.getFull()
  const appRootPath = configStore.rootPath

  if (globalConfig.certificate.service === 'storage') {
    const query = options ? qs.stringify(options) : ''
    return `${appRootPath}/certificate${query ? '?' + query : ''}`
  }

  if (globalConfig.certificate.service === 'fusion') {
    return '/certificate/ssl#cert'
  }

  throw new Error('不正确的证书服务配置！')
}
