import { injectable } from 'qn-fe-core/di'

import { prefix } from 'cdn/constants/api'

import CommonClient from './clients/common'

export interface IBucketSimplified {
  name: string,
  zone: string,
  private: number,
  protected: number,
  last_operation: string,
  last_operation_extra: string,
  last_operation_at: string,
  fop_access_white_list: string[],
  files: number,
  storage: number,
  line_files: number,
  line_storage: number,
  right: string,
  share: boolean
}

// 由于 bucket 未接入 iam，因此暂时提供 /api/fusion 开头的接口用于获取 bucket 相关信息

@injectable()
export default class BucketApis {
  constructor(private client: CommonClient) {}

  getBucketsSimplified() {
    return this.client.get<IBucketSimplified[]>(`${prefix}/buckets-simplified`)
  }
}
