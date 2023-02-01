/**
 * @file bucket constants
 * @description bucket 的常量定义
 * @author yinxulai <me@yinxulai.com>
 */

export const bucketNameLenRule = ' 3 ~ 63 个字符'
export const bucketNameRule = `${bucketNameLenRule}，可以包含小写字母、数字、短划线，且必须以小写字母或者数字开头和结尾`

// Bucket 类型
export enum BucketType {
  Common = 0, // 通用
  Media = 1, // 媒体
  Download = 2 // 下载分发
}

export enum BucketSysTag {
  BlockChainP = 'blockchain-p'
}

export enum BucketPage {
  Overview = 'overview',
  Resource = 'resource',
  ResourceV2 = 'resource-v2',

  Domain = 'domain',
  MediaStyle = 'media-style',
  ImageStyle = 'image-style',
  TranscodeStyle = 'transcode-style',
  Setting = 'setting'
}

export const bucketSysTagNameMap = {
  [BucketSysTag.BlockChainP]: '绘图'
} as const

export const bucketPageNameMap = {
  [BucketPage.Domain]: '域名管理',
  [BucketPage.Setting]: '空间设置',
  [BucketPage.Overview]: '空间概览',
  [BucketPage.Resource]: '文件管理',
  [BucketPage.ResourceV2]: '文件管理',
  [BucketPage.MediaStyle]: '多媒体样式',
  [BucketPage.ImageStyle]: '图片样式',
  [BucketPage.TranscodeStyle]: '转码样式'
}

// 空间设置的锚点，用于在页面跳转时定位到具体的模块
export enum BucketSettingAnchor {
  Source = 'bucket-setting-source',
  Tag = 'bucket-setting-tag',
  Routing = 'bucket-setting-routing'
}
