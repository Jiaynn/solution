/**
 * @file iam store
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'
import { computed, when, makeObservable } from 'mobx'
import {
  actions,
  IamService,
  IamActionsOf,
  ISingleIamInfo,
  IamPermissionStore,
  iamServiceMap as productMap,
  IamAction
} from 'portal-base/user/iam'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'

import { valuesOf } from 'kodo/utils/ts'

const product = productMap.kodo
const defaultResourceActions = [...valuesOf(actions[product])]

// 相比 ISingleIamInfo 约束了一下 actionName 的类型
// 等 portal-base/user/iam 类型都搞好了删掉这个
export interface SingleIamInfo extends ISingleIamInfo {
  actionName?: IamAction
}

@injectable()
export class KodoIamStore extends Store {

  constructor(
    private userInfoStore: UserInfo,
    private iamPermissionStore: IamPermissionStore
  ) {
    super()
    makeObservable(this)
  }

  @computed
  get isIamUser() {
    // iam 都是作控制权限用，涉及的都是限制，所以默认值 true
    return this.userInfoStore.isIamUser !== null ? this.userInfoStore.isIamUser : true
  }

  @computed
  get isLoadingEffects() {
    return this.iamPermissionStore.isLoading
  }

  isActionDeny(data: SingleIamInfo) {
    return this.iamPermissionStore.shouldSingleDeny({
      ...(data.resource && { resource: `bucket/${data.resource}` }),
      product,
      actionName: actions[product][data.actionName!]
    })
  }

  fetchIamActions() {
    return Promise.all([
      this.iamPermissionStore.fetchAvailableServices(),
      this.iamPermissionStore.fetchActionsEffects()
    ])
  }

  // FIXME: 既然是 fetch resource，就不应该把 bucket 写死在里面
  // 目前的实现实际上是 fetch bucket
  fetchIamActionsByResource(resource: string, force?: true): Promise<void>
  fetchIamActionsByResource(resource: string, force?: false): void
  fetchIamActionsByResource(resource: string, force = false) {
    const params = {
      actions: defaultResourceActions,
      resources: [`bucket/${resource}`],
      product
    }

    this.iamPermissionStore.fetchEffects(params) // enqueue
    if (force) return this.iamPermissionStore.realFetchEffects() // fetch
  }

  async fetchResourceByActions(iamActions: Array<IamActionsOf<IamService.Kodo>>): Promise<void> {
    await Promise.all(iamActions.map(action => (
      this.iamPermissionStore.fetchResourcesOfAction(IamService.Kodo, action)
    )))
  }

  async init() {
    await when(() => (
      this.userInfoStore.inited
      && !this.userInfoStore.isGuest
      && this.userInfoStore.isIamUser
    ))

    this.fetchIamActions()
  }
}
