import Store from 'qn-fe-core/store'
import { action, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'

@injectable()
export class AuthStore extends Store {
  @observable.ref isAuth = false // 是否在白名单中

  /**
   * 更新用户白名单权限
   * @param isAuth
   */
  @action.bound
  updateAuth = (isAuth: boolean) => {
    this.isAuth = isAuth
  }
}
