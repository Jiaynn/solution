/**
 * @file 访问控制
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// 私有类型
export enum PrivateType {
  Public = 0,
  Private = 1
}

export const privateNameMap = {
  [PrivateType.Public]: '公开',
  [PrivateType.Private]: '私有'
}
