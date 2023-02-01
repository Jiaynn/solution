/**
 * @file constants of file resource
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import { FileStatus, ArchiveStatus } from 'kodo-base/lib/constants'

export { FileStatus, ArchiveStatus }

export const versionSeparator = '\u0000'

export const filesStateTextMap = {
  [FileStatus.Enabled]: '启用',
  [FileStatus.Disabled]: '禁用'
} as const

export enum UploadStatus {
  Invalid = 'invalid',
  Overload = 'overload',
  Exist = 'exist',
  InQueue = 'inQueue',
  Error = 'error',
  AccessDeniedByWorm = 'AccessDeniedByWorm',
  Pending = 'pending',
  Success = 'success',
  Uploading = 'uploading',
  MaxSize = 'maxSize',
  Sensitive = 'sensitive',
  InvalidTransCodeStyleParams = 'invalidTransCodeStyleParams',
  InvalidArgument = 'InvalidArgument'
}

export const uploadStatusTextMap = {
  [UploadStatus.Invalid]: '含有无效字符', // 目前是仅对 \u0000 做判断
  [UploadStatus.Sensitive]: '存在敏感词',
  [UploadStatus.Overload]: '超过空间设置所限量',
  [UploadStatus.Exist]: '已存在同名文件',
  [UploadStatus.InQueue]: '已在上传队列中',
  [UploadStatus.Error]: '网络故障或取消',
  [UploadStatus.AccessDeniedByWorm]: '文件处于对象锁定保护期，禁止操作',
  [UploadStatus.Pending]: '准备中...',
  [UploadStatus.Success]: '上传成功',
  [UploadStatus.Uploading]: '上传中',
  [UploadStatus.MaxSize]: '文件大小超过 1GB',
  [UploadStatus.InvalidTransCodeStyleParams]: '转码样式参数不合法',
  [UploadStatus.InvalidArgument]: '无效的参数'
} as const

export const progressColorMap = {
  [UploadStatus.Success]: '#e5ffef',
  [UploadStatus.Uploading]: '#e5f2ff',
  [UploadStatus.Exist]: 'transparent',
  [UploadStatus.Error]: 'transparent',
  [UploadStatus.AccessDeniedByWorm]: 'transparent',
  [UploadStatus.Pending]: 'transparent',
  [UploadStatus.InQueue]: 'transparent',
  [UploadStatus.Overload]: 'transparent',
  [UploadStatus.InvalidTransCodeStyleParams]: 'transparent',
  [UploadStatus.InvalidArgument]: 'transparent'
} as const

export const uploadBarBgColorMap = {
  [UploadStatus.Success]: '#f5f7fa',
  [UploadStatus.Uploading]: '#f5f7fa',
  [UploadStatus.Exist]: '#fff6e5',
  [UploadStatus.Error]: '#f5f7fa',
  [UploadStatus.AccessDeniedByWorm]: '#f5f7fa',
  [UploadStatus.Pending]: '#f5f7fa',
  [UploadStatus.InQueue]: '#fff6e5',
  [UploadStatus.Overload]: '#fff6e5',
  [UploadStatus.InvalidTransCodeStyleParams]: '#fff6e5',
  [UploadStatus.InvalidArgument]: '#fff6e5'
} as const

export enum MetaStatus {
  Recorded = 'recorded', // 已经存在的
  Editing = 'editing', // 正在编辑的
  New = 'new' // 新增加的
}
