export const standardDomainRegx = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
export const wildcardDomainRegx = /^\*\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/

export enum AuthMethodType {
  Dns = 'DNS',
  File = 'FILE',
  DnsProxy = 'DNS_PROXY'
}

export const authMethodTextMap = {
  [AuthMethodType.Dns]: 'DNS 验证',
  [AuthMethodType.File]: '文件验证',
  [AuthMethodType.DnsProxy]: 'DNS_PROXY 验证'
}

export enum DnsRecordType {
  Txt = 'TXT',
  Cname = 'CNAME'
}

export const dnsRecordTypeTextMap = {
  [DnsRecordType.Txt]: 'TXT 记录',
  [DnsRecordType.Cname]: 'CNAME 记录'
}

export const authMethodOptions = Object.values(AuthMethodType)
  .map(method => ({ value: method, label: authMethodTextMap[method] }))

export enum EncryptType {
  Rsa = 'RSA',
  Ecc = 'ECDSA'
}

export const encryptTextMap = {
  [EncryptType.Rsa]: 'RSA',
  [EncryptType.Ecc]: 'ECC'
}

export const encryptOptions = Object.values(EncryptType)
  .map((encrypt: EncryptType) => ({ value: encrypt, label: encryptTextMap[encrypt] }))

export enum CompleteType {
  First = 'first',
  Renew = 'renew'
}

export enum DomainStatus {
  Processing = 'processing',
  Ready = 'ready',
  Failed = 'failed',
  Success = 'success',
  Frozen = 'frozen',
  Deleted = 'deleted',
  Offlined = 'offlined'
}

export const domainStatusTextMap = {
  [DomainStatus.Processing]: '处理中',
  [DomainStatus.Ready]: '处理中',
  [DomainStatus.Failed]: '失败',
  [DomainStatus.Success]: '成功',
  [DomainStatus.Frozen]: '已冻结',
  [DomainStatus.Deleted]: '已删除',
  [DomainStatus.Offlined]: '已下线'
}

export function humanizeDomainStatus(status: DomainStatus) {
  return domainStatusTextMap[status] || status
}

export enum CertExpireSort {
  Asc = 'asc',
  Desc = 'desc'
}

export enum Protocol {
  Http = 'http',
  Https = 'https'
}
