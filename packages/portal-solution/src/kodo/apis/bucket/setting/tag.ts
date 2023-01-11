/**
 * @file apis of tag of bucket setting 标签管理
 * @author yinxulai <yinxulai@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'

export interface ITag {
  Key: string
  Value: string
}

@autobind
@injectable()
export class TagApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  getTags(bucket: string): Promise<ITag[]> {
    return this.kodoProxyClient.get(`${proxy.bucketTagging}?bucket=${bucket}`, {})
      .then((data: any) => data.Tags || [])
  }

  setTags(bucket: string, tags: ITag[]) {
    return this.kodoProxyClient.put(`${proxy.bucketTagging}?bucket=${bucket}`, { Tags: tags })
  }

  clearTags(bucket: string) {
    return this.kodoProxyClient.delete(`${proxy.bucketTagging}?bucket=${bucket}`, {})
  }
}
