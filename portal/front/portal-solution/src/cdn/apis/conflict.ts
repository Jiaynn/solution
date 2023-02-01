import { injectable } from 'qn-fe-core/di'

import { prefix } from 'cdn/constants/api'

import CommonClient from './clients/common'
import DomainProxyClient from './clients/domain-proxy'

export interface IGetVerifyFileResp {
  rtn: string
  msg: string
  findDomain: string
}

export interface IVerifyParam {
  conflictDomain: string
  targetprod?: string
}

@injectable()
export default class ConflictApis {
  constructor(
    private commonClient: CommonClient,
    private domainProxyClient: DomainProxyClient
  ) {}

  getVerifyFile(domain: string) {
    return this.domainProxyClient.get<IGetVerifyFileResp>(`/findback/downloadverifyfile/${domain}`)
  }

  verifyDomain(verifyParam: IVerifyParam) {
    // 产品线默认为 fusion
    return this.commonClient.post<unknown>(`${prefix}/verify`, {
      ...verifyParam,
      targetprod: verifyParam.targetprod ?? 'fusion'
    })
  }
}
