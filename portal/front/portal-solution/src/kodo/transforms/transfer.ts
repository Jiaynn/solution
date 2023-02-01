/**
 * @file transfer transforms
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { InjectFunc } from 'qn-fe-core/di'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import { KodoIamStore } from 'kodo/stores/iam'
import { ConfigStore } from 'kodo/stores/config'

// 跨区域同步功能是否开启
export function isTransferAvailable(inject: InjectFunc, getIamAvailable?: () => boolean) {
  const iamStore = inject(KodoIamStore)
  const configStore = inject(ConfigStore)
  const featureStore = inject(FeatureConfigStore)
  const internalGetIamAvailable = getIamAvailable || (() => !iamStore.isIamUser)

  const globalConfig = configStore.getFull()
  const allRegionConfig = configStore.getRegion({
    allRegion: true
  })

  if (!globalConfig.objectStorage.transfer.enable) {
    return false
  }

  if (featureStore.isDisabled('KODO.KODO_TRANSFER_USER')) {
    return false
  }

  // 当前产的区域大于等于两个或者开启了跨产品同步则模块启用
  if (allRegionConfig.length < 2 && !globalConfig.objectStorage.transfer.crossProduct.enable) {
    return false
  }

  return internalGetIamAvailable()
}
