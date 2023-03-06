/**
 * @file 镜像回源 (image / mirror / source)
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// TODO: 鉴权 审计 uid +ucWithQiniuAdminAuth
// TODO: 异常处理
// tslint:disable-next-line:max-line-length
// TODO: https://github.com/qbox/product/blob/master/kodo/bucket/uc.md#mirrorconfigset-%e8%ae%be%e7%bd%ae%e9%85%8d%e7%bd%ae%e5%8c%85%e5%90%ab%e5%9b%9e%e6%ba%90%e7%9b%b8%e5%85%b3%e7%9a%84%e6%89%80%e6%9c%89%e8%ae%be%e7%bd%ae

import * as qs from 'query-string'
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { UnknownException } from 'qn-fe-core/exception'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'
import { KodoCommonApiException, KodoCommonClient } from 'portal-base/kodo/apis/common'

import { kodov2, proxy } from 'kodo/constants/apis'
import { SourceMode } from 'kodo/constants/bucket/setting/source'

export interface ISourceLine {
  addr: string
  weight: number
  backup: boolean
}

export interface ISourceFragmentOptions {
  fragment_size: number
  ignore_etag_check: boolean
}

export interface ISourceBaseConfig {
  host?: string
  source_retry_codes?: number[]
  source_qiniu_ak?: string
  source_qiniu_sk?: string
  expires?: number
}

export interface ISourceConfig extends ISourceBaseConfig {
  bucket: string
  source?: string // 废弃接口 setImageSource 创建的数据，优先用 sources
  sources?: ISourceLine[]
  source_headers?: never // 用到时需要 check 一下
  mirror_raw_query_option?: boolean
  source_mode?: number
  fragment_opt?: ISourceFragmentOptions
  pass_headers?: string[]
}

export interface ISetSourceOptions extends ISourceBaseConfig {
  sources: ISourceLine[]
  originalLines?: ISourceLine[]
}

@autobind
@injectable()
export class SourceApis {
  constructor(
    private kodoProxyClient: KodoProxyClient,
    private kodoCommonClient: KodoCommonClient
  ) { }

  // 获取镜像源配置，涵盖了 /source/get 的数据，包括线路
  getMirrorConfig(bucketName: string): Promise<ISourceConfig> {
    return this.kodoProxyClient.post(proxy.getMirrorConfig, {
      bucket: bucketName
    })
  }

  // 设置镜像源配置，包括线路
  // TODO: 用 /mirrorConfig/set 之后也许可以简化 originalLines 相关概念
  async setSource(
    bucketName: string,
    options: ISetSourceOptions,
    shouldCreateDefaultRobot: boolean
  ): Promise<void> {
    const kodoCommonClient = this.kodoCommonClient
    const { originalLines, ...config } = options

    async function setBucketSource(sources = config.sources) {
      return kodoCommonClient.post<void>(kodov2.setBucketSource, {
        data: {
          bucket: bucketName,
          ...config,
          sources
        },
        default_robot: shouldCreateDefaultRobot
      }).catch((e: unknown) => {
        // robot.txt 重复上传无需报错（实际上不会被覆盖）
        // 未开启版本管理不会报错，开启版本，因为同文件（哈希相同），无法创建新版本，会报文件已存在错误
        if (e instanceof KodoCommonApiException && e.code === 50097) {
          return
        }

        throw e
      })
    }

    if (options.sources && options.sources.length) {
      return setBucketSource()
    }

    // FIXME: 一个全量 replace 接口，唯独为空的情况下不能设置，只能调删除接口，还要完整告诉它要删啥……
    if (!originalLines || !originalLines.length) {
      throw new UnknownException('请正确传入原线路信息')
    }

    // 接口要求串行操作
    await setBucketSource(originalLines) // 先保存除线路外的其他配置（因此线路先不动）
    return this.deleteSource(bucketName, originalLines.map(line => line.addr)) // 然后（用原线路）清空所有线路
  }

  // 删除回源地址
  deleteSource(bucketName: string, addrs: string[]) {
    return this.kodoProxyClient.post<void>(proxy.deleteBucketSource, {
      bucket: bucketName,
      addrs
    })
  }

  // 带 url query 回源
  enableSourceRawQuery(bucketName: string, enabled: boolean) {
    const query = qs.stringify({
      bucket: bucketName,
      opt: +enabled
    })
    return this.kodoProxyClient.post(`${proxy.enableSourceRawQuery}?${query}`, {})
  }

  // 设置回源模式
  setSourceMode(bucketName: string, options: ISetSourceModeOptions) {
    const fragmentOptions = options.mode === SourceMode.Fragment && {
      fragment_opt: {
        fragment_size: options.fragment.size, // shoule be `SourceFragmentSize`
        ignore_etag_check: options.fragment.ignoreEtagCheck
      }
    }

    return this.kodoProxyClient.post(proxy.setBucketSourceMode, {
      bucket: bucketName,
      mode: options.mode,
      ...fragmentOptions
    })
  }

  // 设置镜像回源时向源站透传请求 ConfigurationHeader
  passMirrorHeaders(bucketName: string, headers: string[]) {
    return this.kodoProxyClient.post(proxy.passMirrorHeaders, {
      bucket: bucketName,
      headers: headers || []
    })
  }
}

export type ISetSourceModeOptions = {
  mode: SourceMode.Normal | SourceMode.Range
} | {
  mode: SourceMode.Fragment
  // fragment 模式下 fragment_opt 必填，否则后端默认值/可用值薛定谔生效很容易傻逼
  fragment: {
    size: ISourceFragmentOptions['fragment_size']
    ignoreEtagCheck: ISourceFragmentOptions['ignore_etag_check']
  }
}
