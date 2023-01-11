/**
 * @file 事件通知
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { EventType } from 'kodo/apis/bucket/setting/event-notification-rules'

export const eventTypeTextMap: { readonly [key in EventType]: string } = {
  [EventType.Put]: 'put',
  [EventType.CreateDeleteMarker]: 'deleteMarkerCreate',
  [EventType.Mkfile]: 'mkfile',
  [EventType.Delete]: 'delete',
  [EventType.Copy]: 'copy',
  [EventType.Move]: 'move',
  // append已从服务端下线，保留仅用作前端代码兼容
  [EventType.Append]: 'append',
  [EventType.Disable]: 'disable',
  [EventType.Enable]: 'enable',
  [EventType.RestoreComplete]: 'restore:completed'
}

export const eventTypeDescMap: { readonly [key in EventType]: string } = {
  [EventType.Put]: '创建/覆盖文件：简单上传',
  [EventType.CreateDeleteMarker]: '标删历史版本文件',
  [EventType.Mkfile]: '创建/覆盖文件：分片上传完成',
  [EventType.Delete]: '删除文件',
  [EventType.Copy]: '创建/覆盖文件：拷贝文件',
  [EventType.Move]: '移动文件',
  [EventType.Append]: '创建/覆盖文件：追加上传',
  [EventType.Disable]: '修改文件状态：禁用',
  [EventType.Enable]: '修改文件状态：启用',
  [EventType.RestoreComplete]: '文件解冻：完成'
}
