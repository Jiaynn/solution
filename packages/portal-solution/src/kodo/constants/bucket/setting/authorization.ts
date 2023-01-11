/**
 * @file 空间授权
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// Perm
export enum ShareType {
  None = -1,
  Own = 0,
  ReadOnly = 1,
  ReadWrite = 2
}

export const shareNameMap = {
  [ShareType.None]: '未授权',
  [ShareType.Own]: '自有',
  [ShareType.ReadOnly]: '只读',
  [ShareType.ReadWrite]: '读写'
}

export const shareNameMapForConsumer = {
  [ShareType.Own]: '自有空间',
  [ShareType.ReadOnly]: '授权只读',
  [ShareType.ReadWrite]: '授权读写'
}

export interface IShareUser {
  uid: number
  perm: ShareType
  tbl: string
  email: string
}

// /portal-v4/kodo: /api/kodo/buckets
export enum RightType {
  Read = 'R',
  ReadWrite = 'RW'
}

// /kodo/bucket/tblmgr: /v2/buckets
export type SharedType = 'rw' | 'rd' | boolean
