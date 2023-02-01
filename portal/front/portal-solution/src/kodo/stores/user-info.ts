/**
 * @file store of kodo UserInfo
 * @author yinxulai <yinxulai@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { observeInjectable } from 'qn-fe-core/store'

import { AuthApis, UserInfoStore } from 'portal-base/user/account'
import { GaeaApiException } from 'portal-base/user/gaea-client'
import { LocalStorageStore } from 'portal-base/common/utils/storage'
import { CommonEntryMap } from 'portal-base/common/router'

import { UserInfoApisWithCache } from 'kodo/apis/user-info'

@observeInjectable()
export class KodoUserInfoStore extends UserInfoStore {

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    localStorage: LocalStorageStore,
    userInfoApis: UserInfoApisWithCache,
    authApis: AuthApis,
    commonEntryMap: CommonEntryMap
  ) {
    super(
      localStorage,
      userInfoApis,
      authApis,
      commonEntryMap
    )
  }

  @autobind async fetch(): Promise<void> {
    try {
      return await super.fetch()
    } catch (error) {
      // 403 意味着当前用户已经被禁用或者用户的类型不正确
      if (error instanceof GaeaApiException && (error.code as number) === 403) {
        this.update({ is_guest: true })
        return
      }
      throw error
    }
  }
}
