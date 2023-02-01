/**
 * @file OEM 子账号相关的 PAI
 * @author zhuhao <zhuhao@qiniu.com>
 * @author linchen <gakiclin@gmail.com>
 */

import { injectable } from 'qn-fe-core/di'

import { oemPrefix } from 'cdn/constants/api'

import CommonClient from '../clients/common'

export interface ISubAccount {
  createAt: string
  email: string
  modifyAt: string
  name: string
  qemail: string
  role: number
  state: number
  uid: number
  vendor: number
}

export interface ISubAccountsResp {
  infos: ISubAccount[]
  marker: string
}

export enum SubAccountState {
  Normal = 1,
  Frozen = 2
}

export interface ISubAccountsOptions {
  name?: string
  marker?: string
  limit?: number
}

export interface ICreateSubAccountReq {
  email: string
}

export interface ICreateSubAccountResp {
  pwd: string
}

export interface IFreezeSubAccount {
  uid: number
}

@injectable()
export default class SubAccountApis {
  private apiPrefix = `${oemPrefix}/vendor`

  constructor(private client: CommonClient) {}

  getSubAccounts(options: ISubAccountsOptions) {
    return this.client.get<ISubAccountsResp>(`${this.apiPrefix}/subaccounts`, options)
  }

  createSubAccount(options: ICreateSubAccountReq) {
    return this.client.post<ICreateSubAccountResp>(`${this.apiPrefix}/subaccount`, options)
  }

  freezeSubAccount(options: IFreezeSubAccount) {
    return this.client.put<void>(`${this.apiPrefix}/freeze_subaccount`, options)
  }

  unfreezeSubAccount(options: IFreezeSubAccount) {
    return this.client.put<void>(`${this.apiPrefix}/unfreeze_subaccount`, options)
  }
}
