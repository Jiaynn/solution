/**
 * @file certificate transforms
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { InjectFunc } from 'qn-fe-core/di'

import { KodoIamStore } from 'kodo/stores/iam'
import { ConfigStore } from 'kodo/stores/config'
import { StorageDeployMode } from 'kodo/stores/config/types'

// 检查 Certificate 模块是否开启
export function isCertificateAvailable(inject: InjectFunc) {
  const iamStore = inject(KodoIamStore)
  const configStore = inject(ConfigStore)

  const globalConfig = configStore.getFull()

  if (!globalConfig.certificate.enable) {
    return false
  }

  if (globalConfig.certificate.service === 'fusion') {
    return globalConfig.fusion.enable
  }

  if (globalConfig.certificate.service === 'storage') {
    // K8S 部署模式不支持证书管理
    if (globalConfig.objectStorage.deployMode === StorageDeployMode.K8S) {
      return false
    }
  }

  return !iamStore.isIamUser
}
