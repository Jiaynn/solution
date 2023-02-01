/**
 * @file 域名托管相关的常量/类型定义
 * @author linchen <linchen@qiniu.com>
 */

export enum DomainStatus {
  Success = 2,
  Invalid = 1,
  Failure = 0
}

export const domainStatusTextMap = {
  [DomainStatus.Success]: '已生效',
  [DomainStatus.Invalid]: '未生效',
  [DomainStatus.Failure]: '添加失败'
}

// 域名托管的操作提示开关，只提示一次
export const localStorageKey = 'domain-hosting'

// 检测托管域名的有效性 5 秒内只允许促发一次
export const throttleInterval = 1000 * 5

export const addDomainTip = '使用此功能可以将平台的 CNAME 后缀修改成您托管的域名。'
