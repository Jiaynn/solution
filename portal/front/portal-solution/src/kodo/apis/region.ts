/**
 * @file region api
 * @description region 相关的接口
 * @author yinxulai <me@yinxulai.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'

import { ConfigStore } from 'kodo/stores/config'

import { App } from 'kodo/constants/app'
import { kodov2 } from 'kodo/constants/apis'
import { RegionSymbol } from 'kodo/constants/region'

interface IApplyRegionOptions {
  capacity: string
  region: RegionSymbol
}

export enum ApplyStatus {
  Auditing = 0, // 审核中
  Approved = 1, // 通过
  Rejected = 2 // 拒绝
}

export interface IRegionApplyRecord {
  status: ApplyStatus
  region: RegionSymbol
  product: App.Kodo | App.Fog

  createdAt: number
  updatedAt: number
}

@autobind
@injectable()
export class RegionApis {
  constructor(
    private configStore: ConfigStore,
    private kodoCommonClient: KodoCommonClient
  ) { }

  // 提交区域申请
  applyRegion(options: IApplyRegionOptions): Promise<void> {
    return this.kodoCommonClient.post(kodov2.regionApply, {
      region: options.region,
      capacity: options.capacity,
      product: this.configStore.product
    })
  }

  // 获取区域申请状态
  async getRegionApply(region?: RegionSymbol): Promise<IRegionApplyRecord[]> {
    const response = await this.kodoCommonClient.get<any>(kodov2.regionApply, {
      product: this.configStore.product,
      region
    })
    return response.data
  }
}
