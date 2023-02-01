/**
 * @file 私有云登录
 * @author lizhifeng <lizhifeng@qiniu.com>
 * @author zhangheng <zhangheng01@qiniu.com>
 * @author yinxulai <yinxulai@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { GaeaClient } from 'portal-base/user/gaea-client'

export interface IExternalSsoInfo {
  signin_url: string
  signout_url: string
}

@autobind
@injectable()
export class SignInApis {
  constructor(private gaeaClient: GaeaClient) { }

  // 获取外部 sso 登录/登出配置信息
  async getExternalSsoInfo(): Promise<IExternalSsoInfo> {
    return this.gaeaClient.get('/api/gaea/private/external/sso/info', {})
  }
}

// 历史代码的一些记录
// TODO: https://github.com/qbox/portal-base/blob/b89ca997bd136a7bae348f3a35a0190c90ca45e8/user/stores/user-info.ts#L159
// 1、支持公有云 & 私有云（里面的实现一半是公有的，一半是私有的）
// 2、定制 url 或 route，即 pathname / query 和 redirect 等
// 3、处理跟 ChangePasswordModal.tsx 和 user-info store 的关系
// CODE: https://github.com/qbox/kodo-web/blob/d1a7aafb7d4906c9b6a4de5291c1d1d65266109c/portal/front/src/apis/sign-in.ts#L27
