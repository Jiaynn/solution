/**
 * @file bucket notFondPage constants
 * @description bucket 404页面的常量定义
 * @author Surmon <i@surmon.me>
 */

export const notFoundFileKey = 'errno-404' // 与公有云的 key 一致

export enum NotFoundPageType {
  Default = 'default',
  Custom = 'custom'
}

export const notFoundPageTypeNameMap = {
  [NotFoundPageType.Default]: '默认',
  [NotFoundPageType.Custom]: '自定义'
}
