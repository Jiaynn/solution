/**
 * @file Censor route
 * @author yinxulai <me@yinxulai.com>
 */

import { CensorType } from 'kodo/constants/bucket/setting/censor'

// 查看审核规则
export function getCensorListPath(type: CensorType, bucket: string) {
  return {
    [CensorType.Stream]: `/censor/main/kodo/stream?type=STREAM&bucket=${bucket}`,
    [CensorType.Batch]: `/censor/main/kodo/batch?type=BATCH&bucket=${bucket}`
  }[type]
}

// 创建审核规则
export function getCensorCreatePath(type: CensorType, bucket: string) {
  return {
    [CensorType.Stream]: `/censor/main/kodo/stream/create?type=STREAM&bucket=${bucket}`,
    [CensorType.Batch]: `/censor/main/kodo/batch/create?type=BATCH&bucket=${bucket}`
  }[type]
}
