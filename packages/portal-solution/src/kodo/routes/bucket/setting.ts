/**
 * @file routes of bucket setting page
 * @author Surmon <i@surmon.me>
 */

import { InjectFunc } from 'qn-fe-core/di'

import { BucketPage } from 'kodo/constants/bucket'
import { getDetailsPath } from '.'

// TODO: 空间设置路由跟这里的 path 都应该是同一个 enum，而不是各自裸露的字符串

// 事件详情页
export function getSettingEventPath(inject: InjectFunc, bucketName: string): string {
  return getDetailsPath(inject, {
    bucketName,
    path: '/event',
    page: BucketPage.Setting
  })
}

export function getSettingLifecyclePath(inject: InjectFunc, bucketName: string): string {
  return getDetailsPath(inject, {
    bucketName,
    path: '/lifecycle',
    page: BucketPage.Setting
  })
}

export function getSettingSourcePath(inject: InjectFunc, bucketName: string): string {
  return getDetailsPath(inject, {
    bucketName,
    path: '/source',
    page: BucketPage.Setting
  })
}

export function getSettingAuthorizationPath(inject: InjectFunc, bucketName: string): string {
  return getDetailsPath(inject, {
    bucketName,
    path: '/authorization',
    page: BucketPage.Setting
  })
}

export function getSettingRoutingPath(inject: InjectFunc, bucketName: string): string {
  return getDetailsPath(inject, {
    bucketName,
    path: '/routing',
    page: BucketPage.Setting
  })
}
