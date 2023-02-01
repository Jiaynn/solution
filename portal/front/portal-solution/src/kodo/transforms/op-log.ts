/**
 * @file component OpLog transform TODO: 后期删掉用 portal-base
 * @description 对操作日志类型的解析，支持模板与自定义函数
 * @author Surmon <i@surmon.me>
 */

export interface IOpMap {
  [key: string]: string | ((extraArr: string[]) => string)
}

export const opMap: IOpMap = {
  // gaea
  login: '账户登录',
  logout: '账户登出',
  register: '注册',
  acitvate: '账户激活',
  'forget password': '忘记密码',
  'reset password': '重置密码',
  'modify password': '修改密码',
  'modify account info': '修改账户信息',
  'bind mobile': '绑定手机',
  'change mobile': '更换手机',
  'change email': '更换邮箱',
  'alipay recharge paying': '支付宝支付中,金额 %s',
  'alipay recharge payed': '支付宝支付完成,金额 %s',
  'prepaid card recharge': '储值卡充值,卡号 %s 金额 %s',
  'voucher recharge': '使用抵用券,卡号 %s 金额 %s',
  'third signup': '使用 %s 账号注册',
  'third bind': '绑定 %s 账号',
  'third unbind': '解绑 %s 账号',
  'third login': '使用 %s 账号登录',
  'create secret key': '创建密钥 %s',
  'disable secret key': '停用密钥 %s',
  'enable secret key': '启用密钥 %s',
  'delete secret key': '删除密钥 %s',
  'sso login': '单点账户登录',
  'sso logout': '单点账户登出',

  // kodo & dora
  'create bucket': '创建空间 %s',
  'delete bucket': '删除空间 %s',
  'setup 404 page': '空间 %s 设置404页面',
  'cancel 404 page': '空间 %s 取消404页面',
  'change to public': '空间 %s 设置为公开',
  'change to private': '空间 %s 设置为私有',
  'bucket protect': '空间 %s 开启原图保护',
  'cancel bucket protect': '空间 %s 关闭原图保护',
  'bucket indexpage on': '空间 %s 设置默认首页',
  'bucket indexpage off': '空间 %s 关闭默认首页',
  'bucket maxage': '空间 %s 设置maxage %s',
  'apply black/white list': '空间 %s 更新防盗链设置',
  'delete black/white list': '空间 %s 关闭防盗链',
  'enable log': '空间 %s 启用访问日志',
  'disable log': '空间 %s 关闭访问日志',
  'modify seperator': '修改样式分割符 %s',
  'create new pipeline': '新建队列 %s',
  'create new job': '新建job %s',
  'delete pipeline': '删除队列 %s',
  'create new ufop': '新建自定义数据处理 %s',
  'ufop resize instance': '自定义数据处理实例调整 %s',
  'ufop switch version': '自定义数据处理版本切换 %s',
  'ugrade instance': '自定义数据处理升级实例',
  'instance start': '自定义数据处理实例启动',
  'instance stop': '自定义数据处理实例停止',
  'delete ufop': '删除自定义数据处理 %s',
  'switch flavor': '切换自定义数据处理的配置',
  'third service enable': '启用第三方数据处理 %s',
  'third service disable': '停用第三方数据处理 %s',
  'delete data process style': '删除空间 %s 的图片处理样式 %s',
  'modify data process style': '新建/修改 空间 %s 的图片处理样式 %s',
  'server encryption on': '空间 %s 开启服务端加密',
  'server encryption off': '空间 %s 关闭服务端加密',
  'enable version': '空间 %s 开启版本控制',
  'rules add': '空间 %s 增加生命周期规则 %s',
  'rules delete': '空间 %s 删除生命周期规则 %s',
  'rules update': '空间 %s 更新生命周期规则 %s',
  'events add': '空间 %s 增加事件通知规则 %s',
  'events delete': '空间 %s 删除事件通知规则 %s',
  'events update': '空间 %s 更新事件通知规则 %s',
  'set corsrules': '空间 %s 设置跨域访问规则',
  'image site': '空间 %s 更新源站配置',
  'unimage site': '空间 %s 删除源站配置',
  'set mirror rawquery': '空间 %s 更新带问号回源设置',
  'set source mode': '空间 %s 更新回源模式设置',
  'share create': '空间 %s 更新用户 %s 的授权',
  'share delete': '空间 %s 取消用户 %s 的授权',
  'set pass mirror headers': '空间 %s 更新镜像回源 header 传递规则',
  'bucket add task': '新增跨区域同步任务 %s',
  'bucket stop task': '暂停跨区域同步任务 %s',
  'bucket start task': '启动跨区域同步任务 %s',
  'bucket delete task': '删除跨区域同步任务 %s',
  'bucket bind source domain': '空间 %s 绑定源站域名 %s',
  'bucket unbind source domain': '空间 %s 解绑源站域名 %s',
  'bucket bind cert': '源站域名 %s 绑定证书',
  'bucket unbind cert': '源站域名 %s 解绑证书',
  'bucket update tag': '空间 %s 更新了空间标签',
  'bucket delete tag': '空间 %s 删除了空间标签',
  'bucket add transcode style': '空间 %s 新增转码样式 %s',
  'bucket delete transcode style': '空间 %s 删除转码样式 %s',

  // pili
  'pili create hub': '创建直播空间 %s',
  'pili change hub auth': '修改直播空间 %s 的鉴权方式',
  'pili change callback': '修改直播空间 %s 的回调地址为 %s',
  'pili change persistent cfg': '修改直播空间 %s 的存储空间为 %s，存储过期时间为 %s 天',
  'pili bind domain': '直播空间 %s 绑定域名 %s',
  'pili unbind domain': '直播空间 %s 解绑域名 %s',
  'pili set default domain': '直播空间 %s 设置域名 %s 为默认域名',
  'pili disable stream': '直播空间 %s 禁用流 %s',
  'pili delete hub': '删除直播空间 %s'
}

// 对模板变量进行解析
function formatTemplate(template: string, extraArr: string[]) {
  return extraArr.reduce(
    (result, extraItem) => result.replace('%s', extraItem),
    template
  )
}

export function humanizeOperation(opType: string, extra: string): string {
  const humanizer = opMap[opType]
  const extraArr = extra && extra.split(':')

  // 字符串/模板 -> 替换处理后输出
  if (typeof humanizer === 'string') {

    // 纯字符串
    if (!humanizer || !humanizer.includes('%s')) {
      return humanizer
    }

    // 模板
    if (extraArr) {
      return formatTemplate(humanizer, extraArr)
    }
  }

  // 计算函数 -> 计算判断（附加数据和函数共同成立时才进行计算）
  if (typeof humanizer === 'function' && extraArr) {
    return humanizer(extraArr)
  }

  // 无匹配类型 -> 输出未知
  return `未知操作类型：${opType}`
}
