/**
 * @file Domain List BatchMenu Messages
 * @author linchen <gakiclin@gmail.com>
 */

export const moreActions = {
  cn: '更多操作',
  en: 'More actions'
}

export const checkDomains = {
  cn: '请先勾选域名',
  en: 'Please check the domain name first.'
}

export const batchOperationSuccess = {
  cn: (op: string) => `成功${op}域名`,
  en: (op: string) => `Domain ${op} succeed.`
}

export const batchOperationFailure = {
  cn: (op: string) => `域名${op}失败`,
  en: (op: string) => `Domain ${op} failed.`
}

export const batchOperationPartialFailure = {
  cn: (op: string) => `部分域名${op}失败`,
  en: (op: string) => `Some domain ${op} failed.`
}

export const checkOperationType = {
  cn: '请检查操作类型',
  en: 'Please check the operation type.'
}

export const confirmOperation = {
  cn: (op: string) => `确定${op}域名吗？`,
  en: (op: string) => `Are you sure about the ${op} domain name?`
}

export const confirmTotalOperation = {
  cn: (op: string, total: number) => `确定要${op}已选中的 ${total} 个域名吗？`,
  en: (op: string, total: number) => `Do you confirm ${total} domain names selected by ${op}.`
}

export const notAllowOperation = {
  cn: (op: string) => `选中的域名不支持${op}操作，请检查域名状态`,
  en: (op: string) => `The selected domain name does not support ${op} operation. Please check the domain name status.`
}

export const partialNotAllowOperation = {
  cn: (op: string, total: number, operableCount: number) => `有 ${total - operableCount} 个域名不支持${op}，要继续${op}其余 ${operableCount} 个域名吗？`,
  en: (op: string, total: number, operableCount: number) => `There are ${total - operableCount} domain names that do not support ${op}. Do you want to continue ${op} the remaining ${operableCount} domain names?`
}
