/**
 * @file config api
 * @description region 相关的接口
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'

import { IKodoFogBaseConfig, IKodoFogConfig, IPlatformBaseConfig, IPlatformConfig } from 'kodo/stores/config/types'

import { App } from 'kodo/constants/app'
import { kodov2 } from 'kodo/constants/apis'

type WithProductUrl<T> = T & { productUrl: string[] | string }

export interface IConfigResponse {
  [App.Platform]?: WithProductUrl<IPlatformConfig>
  [App.Kodo]?: WithProductUrl<IKodoFogConfig>
  [App.Fog]?: WithProductUrl<IKodoFogConfig>
}

export interface IBaseConfigResponse {
  [App.Platform]?: WithProductUrl<IPlatformBaseConfig>
  [App.Kodo]?: WithProductUrl<IKodoFogBaseConfig>
  [App.Fog]?: WithProductUrl<IKodoFogBaseConfig>
}

@autobind
@injectable()
export class ConfigApis {
  constructor(
    private kodoCommonClient: KodoCommonClient
  ) { }

  getBaseConfig(): Promise<IBaseConfigResponse> {
    return this.kodoCommonClient.get(kodov2.getBaseConfig, {})
  }

  getConfig(): Promise<IConfigResponse> {
    return this.kodoCommonClient.get(kodov2.getConfig, {})
  }
}
