/**
 * @file apis of version of bucket setting 版本控制
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'

import { kodov2 } from 'kodo/constants/apis'

@autobind
@injectable()
export class VersionApis {
  constructor(private kodoCommonClient: KodoCommonClient) { }

  enableVersion(bucketName: string): Promise<void> {
    const params = {
      tbl: bucketName
    }
    return this.kodoCommonClient.post(formatURL(kodov2.enableBucketVersion, params), {})
  }
}
