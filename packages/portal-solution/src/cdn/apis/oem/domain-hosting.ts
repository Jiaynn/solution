/**
 * @file 域名托管模块 api
 * @author linchen <linchen@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'

import { oemPrefix } from 'cdn/constants/api'
import { DomainStatus } from 'cdn/constants/domain-hosting'

import CommonClient from '../clients/common'

export interface ICheckDomainInfo {
  id: string
  status: DomainStatus
}

export interface IDomainInfo {
  id: string
  cname: string
  status: DomainStatus
}

export interface IGetDomainListResp {
  records: IDomainInfo[]
}

const getUpdateBody = (item: IDomainInfo) => ({ domain: item.cname })

@injectable()
export default class DomainHostingApis {
  constructor(private client: CommonClient) {}

  createDomain(domain: string) {
    return this.client.post<void>(`${oemPrefix}/dnspod/domain/${domain}`, {})
  }

  updateDomain(item: IDomainInfo) {
    return this.client.put<void>(`${oemPrefix}/dnspod/domain/by/id/${item.id}`, getUpdateBody(item))
  }

  getDomainList() {
    return this.client.get<IGetDomainListResp>(`${oemPrefix}/dnspod/domains`)
      .then(resp => {
        resp.records = resp.records || []
        return resp
      })
  }

  checkDomain(domain: string) {
    return this.client.get<ICheckDomainInfo>(`${oemPrefix}/dns/valid/domain/${domain}`)
  }
}
