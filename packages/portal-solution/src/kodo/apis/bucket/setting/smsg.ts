/**
 * @file 流媒体网关（Stream Media Storage Gateway，SMSG）相关 API
 * @author hovenjay <hovenjay@outlook.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'

import { proxy } from 'kodo/constants/apis'

import { ProeProxyClient } from 'kodo/clients/proxy-proe'

interface BucketSMSG {
  auth?: boolean
  enable: boolean // 空间是否开启流媒体网关功能
}

export interface BucketSMSGStreamPushAddr {
  domain: string    // 推流域名
  url: string       // 推流地址
}

@autobind
@injectable()
export class SMSGApis {
  constructor(private proeProxyClient: ProeProxyClient) { }

  /**
   * 设置空间流媒体网关功能启用状态
   * @param bucket - 空间 ID
   * @param enable - 功能启用状态
   */
  setBucketSMSG(bucket: string, enable: boolean): Promise<boolean> {
    return this.proeProxyClient.post(proxy.bucketSMSG + '/' + bucket, { operations: [{ key: 'enable', value: enable }] })
      .then((data: BucketSMSG) => (data.enable))
  }

  /**
   * 查询空间流媒体网关配置信息
   * @param bucket - 空间 ID
   */
  getBucketSMSG(bucket: string): Promise<boolean> {
    // TODO: 优化未开启时的错误提示（问题不大，理论上不开启该模块不可见，不会发送请求，现在主要是测试环境体验不好）
    return this.proeProxyClient.get(proxy.bucketSMSG + '/' + bucket, {}).then((data: BucketSMSG) => (data.enable))
  }

  /**
   * 查询空间流媒体网关推流地址
   * @param bucket - 空间 ID
   * @param stream - 流名
   */
  getBucketSMSGStreamPushAddr(bucket: string, stream: string): Promise<BucketSMSGStreamPushAddr> {
    return this.proeProxyClient.get(proxy.bucketSMSG + '/' + bucket + '/streams/' + stream + '/addrs', {})
  }
}
