/**
 * @file store authentication store (TODO: 挪到 portal-base)
 * @author yinxulai <me@yinxulai.com>
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import { observable, action, makeObservable } from 'mobx'
import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import { makeCancelled } from 'qn-fe-core/exception'

export interface IVerifyOptions {
  content?: React.ReactNode
}

@injectable()
export class AuthenticationStore extends Store {
  constructor() {
    super()

    makeObservable(this)
  }

  @observable visible = false // 显示与否
  @observable.ref content: React.ReactNode = null

  onMatch: () => void
  onCancel: () => void

  @action.bound
  reset() {
    this.visible = false
    this.onCancel = () => { /**/ }
    this.onMatch = () => { /**/ }
  }

  // TODO: 解决冲突调用
  // 例如：手动调用 verify 过后当前事务未完成状态下、异步再次触发 verify 方法
  @action.bound
  verify(options?: IVerifyOptions): Promise<void> {
    this.visible = true
    this.content = options ? options.content : null

    return new Promise((resolve, reject) => {
      this.onMatch = action(() => {
        this.reset()
        resolve() // 校验通过
      })

      this.onCancel = action(() => {
        this.reset()
        reject(makeCancelled()) // 取消
      })
    })
  }
}
