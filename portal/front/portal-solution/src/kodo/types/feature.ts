/**
 * @file feature types
 * @description feature 的类型定义
 * @author yinxulai <me@yinxulai.com>
 */

export type FeatureKey =
  | 'KODO'                                // root
  | 'KODO.KODO_ALL'                       // 空间概览
  | 'KODO.KODO_CREATE'                    // 创建空间
  | 'KODO.KODO_VERSION'                   // 版本
  | 'KODO.KODO_DOMAIN_SETTING'            // 原来的域名设置 现在控制 CDN
  | 'KODO.KODO_BUCKET_SETTING'            // 空间设置
  | 'KODO.KODO_TRANSFER_USER'             // 跨区域同步
  | 'KODO.KODO_BUCKET_SHARE'              // 分享空间
  | 'KODO.KODO_SOURCE_DOMAIN'             // 源站域名
  | 'KODO.KODO_IMAGE_PROCESS'             // 图片样式
  | 'KODO.KODO_ENCRYPTION'                // 空间加密
  | 'KODO.KODO_S3API'                     // s3 协议接口
  | 'KODO.KODO_BUCKET_WORM'               // 空间对象锁定
  | 'KODO.KODO_STREAM_PUSH'               // 拉流转推
  | 'KODO.KODO_BUCKET_CHANGE_FILE_STATUS' // 修改空间资源状态
  | 'KODO.KODO_STATISTICS_FLOW_OUT_SINGLE'// 统计分析下空间流量单线路流出
  | 'KODO.KODO_MEDIA_STYLE_VIDEO'              // 多媒体样式视频
  | 'KODO.KODO_MEDIA_STYLE'                    // 多媒体样式
  | 'KODO.KODO_RESOURCE_MANAGE_SWITCH'    // 新旧文件管理切换
