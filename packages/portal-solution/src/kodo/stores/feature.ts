/**
 * @file Feature store
 * @author yinxulai <me@yinxulai.cn>
 */

import { makeObservable, when } from 'mobx'
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { UserInfoStore } from 'portal-base/user/account'
import { FeatureConfigApis, FeatureConfigStore as BaseFeatureConfig } from 'portal-base/user/feature-config'

import { FeatureKey } from 'kodo/types/feature'

@injectable()
export class FeatureConfigStore extends BaseFeatureConfig {
  constructor(
    private userInfoStore: UserInfoStore,
    featureConfigApis: FeatureConfigApis
  ) {
    super(featureConfigApis)
    makeObservable(this)
  }

  @autobind
  isDisabled(feature: FeatureKey): boolean {
    // 应该放弃之前的 disable 默认 false 的方式
    // 对于控制性功能 默认应为 disable: true 更安全
    // TODO: 这逻辑确认没问题之后 长远来说应该挪进 portal-base 里
    // TODO: 未来合 portal-base 的时候可以并且应该用循环来实现
    // https://github.com/qbox/kodo-web/pull/570#discussion_r318906018

    const keys = (feature || '').split('.')
    if (!keys || !keys.length) {
      // 无 key 默认禁用
      return true
    }

    const defaultFeature = [false, true]

    // app 级的配置
    const appConfig = this.data[keys[0]]

    if (!appConfig) {
      // FIXME: 现在的正确性依赖于 defaultFeature[0] === false, 也就是跟 defaultFeature 的值强耦合
      return defaultFeature[keys.length - 1]
    }

    // 目标是 app 级别
    if (keys.length === 1) {
      return appConfig.disable == null ? defaultFeature[0] : appConfig.disable
    }

    // 如果 app 级被 disabled，子模块全部 disabled
    if (appConfig.disable === true) {
      return true
    }

    // app 下具体的某一模块功能的配置
    const moduleConfig = appConfig[keys[1]]
    if (!moduleConfig || moduleConfig.disable == null) {
      return defaultFeature[1]
    }

    return super.isDisabled(feature)
  }

  async init() {
    await when(() => this.userInfoStore.inited)

    if (!this.userInfoStore.isGuest) {
      await super.init()
    }
  }
}
