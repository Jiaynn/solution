/**
 * @file transformers of bucket notFoundPage
 * @author Surmon <i@surmon.me>
 */

import { NotFoundPageType, notFoundPageTypeNameMap } from 'kodo/constants/bucket/setting/not-found-page'

export function humanizeNotFoundPageType(type: NotFoundPageType): string {
  return notFoundPageTypeNameMap[type] || '未知'
}

export function isImageType(type: string | undefined): boolean {
  if (!type) return false
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/ico', 'image/bmp']
  return imageTypes.includes(type)
}
