/**
 * @file 内容审核
 * @author yinxulai <yinxulai@qiniu.com>
 */

export enum CensorType {
  Stream = 'STREAM',
  Batch = 'BATCH'
}

export enum CensorStatus {
  On = 'ON',
  Off = 'OFF'
}

export const statusNameMap = {
  [CensorStatus.On]: '开启',
  [CensorStatus.Off]: '关闭'
}
