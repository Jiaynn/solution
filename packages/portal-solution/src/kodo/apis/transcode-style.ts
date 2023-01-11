/**
 * @file api functions for transcode-style
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { encodeUrlSafeBase64 } from 'kodo/transforms/base64'

import { proxy } from 'kodo/constants/apis'
import { ITranscodeStyleInfo } from './bucket'

export interface IPrivatePipeline {
  name: string
  id: string
  timestamp: number
  owner: string
}

@autobind
@injectable()
export class TranscodeStyleApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  setTranscodeStyle(bucketName: string, name: string, data: ITranscodeStyleInfo) {
    return this.kodoProxyClient.post(`${proxy.setTranscodeStyle}/${bucketName}/name/${encodeUrlSafeBase64(name)}`, data)
  }

  deleteTranscodeStyle(bucketName: string, name: string) {
    return this.kodoProxyClient.post(`${proxy.deleteTranscodeStyle}/${bucketName}/name/${encodeUrlSafeBase64(name)}`, {})
  }

  getPrivatePipeline(): Promise<IPrivatePipeline[]> {
    return this.kodoProxyClient.get(`${proxy.getPipelineList}`, {})
  }
}
