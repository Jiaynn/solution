/**
 * @file KodoUserInfo apis with cache
 * @description 针对 get 添加了缓存能力的 UserInfoApis
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import { GaeaClient } from 'portal-base/user/gaea-client'
import { IUserInfo, UserInfoApis } from 'portal-base/user/account'

// 背景
// 当前在应用初始化时有两次 UserInfoApis.get 请求难以避免：
// - ConfigStore 在初始化获取配置前需要明确当前的用户状态，所以会调用一次
// - UserInfoStore 在 portal-base 注入时会做一次 init，在 init 时会调用一次
// 且 ConfigStore 无法在 portal-base 注入 UserInfoStore 之后再做初始化
// 所以这里针对 ConfigStore、UserInfoStore 这两者，使用这个加装缓存能力的 UserInfoApisWithCache
// 在 ConfigStore 初始化时对 UserInfoApis.get 的成功结果进行缓存，在 UserInfoStore 第一次 init 时复用该结果
// 从而达到减少 UserInfoApis.get 请求的目的
// 了解更多：https://github.com/qbox/kodo-web/pull/1468#discussion_r843642373

@injectable()
export class UserInfoApisWithCache extends UserInfoApis {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(gaeaClient: GaeaClient) {
    super(gaeaClient)
  }

  private cachedUserInfo?: IUserInfo

  setCache(value: IUserInfo) {
    this.cachedUserInfo = value
  }

  async get() {
    if (this.cachedUserInfo) {
      const result = this.cachedUserInfo
      this.cachedUserInfo = undefined
      return result
    }

    return super.get()
  }
}
