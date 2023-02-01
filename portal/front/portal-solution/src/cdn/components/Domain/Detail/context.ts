import React from 'react'

import { IDomainDetail } from 'cdn/apis/domain'

export interface DomainDetailCtxValue {
  /** 刷新域名信息 */
  refreshDomainDetail: () => void
  /** 域名信息 */
  domainDetail: IDomainDetail
}

/** 域名详情上下文 */
export const domainDetailCtx = React.createContext<DomainDetailCtxValue>({
  refreshDomainDetail: () => null,
  domainDetail: null!
})

/** 用于获取域名详情的上下文信息 */
export function useDomainDetailCtx() {
  return React.useContext(domainDetailCtx)
}
