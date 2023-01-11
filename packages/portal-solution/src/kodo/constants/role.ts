/**
 * @file constants for Role
 * @author Surmon <i@surmon.me>
 */

// Role 命名规范：https://github.com/qbox/portal-base/blob/master/common/components/Role/README.md#role-name
// MARK:
//  - 尽量保证在这个文件中保证值的唯一，可以考虑提供工具函数来生成 role 定义
//  - 原则是：名字是被人消费的，值是供程序消费的，尽量保证名字的简洁 & 值的唯一性
// TODO: portal-base 可以提供命名辅助工具，如：
// const bucketRole = createRoleNamespace('bucket')
// const bucketListRole = bucketRole.suffix('list')
// ---
// const a = '123'
// export const b = `${a}-123`
// export const c = `${b}-123`
// import * as Roles from 'kodo/constants/role'
// export Role<keyof typeof Roles>
// <Role name="create-bucket-entry">

import { StorageType } from 'kodo-base/lib/constants'

export enum BucketRole {
  CreateBucketEntry = 'create-bucket-entry',
  BucketListTypeFilterCtrl = 'bucket-list-type-filter-ctrl',

  // 文件相关
  UploadFileEntry = 'upload-file-entry', // 与 kodo-base 保持一致
  FirstFileMetaEntry = 'object-detail',  // 与 kodo-base 保持一致

  BatchFileOperation = 'batch-file-operation',
  RefreshFileListCtrl = 'refresh-file-list-ctrl',
  // TODO: 当 Role 支持 [i] 选择器时，Guide 便可以直接使用此选择器选择元素，就不再需要为某个特定的 x 元素标记
  FirstFileMoreActionEntry = 'first-file-more-action-entry',
}

// 上传文件
export enum BucketFileUploadRole {
  UploadFilePage = 'upload-file-page',
  // 文件存储类型
  StandardFileTypeCtrl = 'standard-file-type-ctrl',
  LowFrequencyFileTypeCtrl = 'low-frequency-file-type-ctrl',
  ArchiveFileTypeCtrl = 'archive-file-type-ctrl',
  DeepArchiveFileTypeCtrl = 'deep-archive-file-type-ctrl',
  // 路径前缀
  PrefixInput = 'prefix-input',
  // 转码样式
  TranscodeStyleInput = 'transcode-style-input',
  // 上传覆盖
  CoveredCtrl = 'covered-ctrl',
  // 选择文件
  SelectFileEntry = 'select-file-entry',
  // 返回
  BackEntry = 'back-entry'
}

export const storageTypeRoleMap: { readonly [key in StorageType]: BucketFileUploadRole } = {
  [StorageType.Standard]: BucketFileUploadRole.StandardFileTypeCtrl,
  [StorageType.LowFrequency]: BucketFileUploadRole.LowFrequencyFileTypeCtrl,
  [StorageType.Archive]: BucketFileUploadRole.ArchiveFileTypeCtrl,
  [StorageType.DeepArchive]: BucketFileUploadRole.DeepArchiveFileTypeCtrl
}

// 文件详情
export enum BucketFileDetailRole {
  FileDetailBlock = 'file-detail-block',
  MetaDataInputItem = 'meta-data-input-item',
  MetaDataAddEntry = 'meta-data-add-entry',
  MetaDataEditEntry = 'meta-data-edit-entry',
  MetaDataDeleteEntry = 'meta-data-delete-entry'
}

// 详情页
export enum BucketDetailPageRole {
  TabNav = 'tab-nav',
  Overview = 'overview-page',
  Resource = 'resource-page',
  SourceDomain = 'source-domain-page',
  CDNDomain = 'cdn-domain-page',
  ImageStyle = 'image-style-page',
  TranscodeStyle = 'transcode-style-page',
  Setting = 'setting-page'
}

// TranscodeStyle 转码样式
export enum BucketTranscodeStyleRole {
  CreateEntry = 'create-transcode-style-entry',
  RefreshListEntry = 'transcode-style-refresh-list-entry',

  TranscodeStyleList = 'transcode-style-list',
  ListItemCopyEntry = 'list-item-copy-entry',
  ListItemEditEntry = 'list-item-edit-entry',
  ListItemDeleteEntry = 'list-item-delete-entry',

  EditBlock = 'transcode-style-edit-block'
}

// Domain 域名管理
export enum BucketDomainRole {
  // CDN 域名
  BindCDNDomainEntry = 'bind-cdn-domain-entry',
  RefreshCDNDomainListEntry = 'refresh-cdn-domain-list-entry',
  CDNDomainList = 'cdn-domain-list',
  // 源站域名
  BindSourceDomainEntry = 'bind-source-domain-entry',
  RefreshSourceDomainListEntry = 'refresh-source-domain-list-entry',
  SourceDomainList = 'source-domain-list',
  // 绑定域名表单
  BindSourceDomainForm = 'bind-source-domain-form',
  BindSourceDomainInput = 'bind-source-domain-input'
}

// ImageStyle 图片样式
export enum BucketImageStyleRole {
  // 样式分隔符设置
  SeparatorInput = 'image-style-separator-input',
  SeparatorAddCtrl = 'image-style-separator-add-ctrl',
  SeparatorResetCtrl = 'image-style-separator-reset-ctrl',
  SeparatorSaveCtrl = 'image-style-separator-save-ctrl',
  AddNewImageStyleEntry = 'add-new-image-style-entry',
  StyleBatchOperateEntry = 'style-batch-operate-entry'
}

// 设置
export enum BucketSettingRole {
  BlockConfirmCtrl = 'block-confirm-ctrl',

  // Setting Cards
  Access = 'access-block',
  DefaultIndex = 'default-index-block',
  StaticPage = 'static-page-block',
  MaxAge = 'max-age-block',
  Log = 'log-block',
  Censor = 'censor-block',
  Tag = 'tag-block',
  Authorization = 'authorization-block',
  Referrer = 'referrer-block',
  CrossOrigin = 'cross-origin-block',
  Lifecycle = 'lifecycle-block',
  Event = 'event-block',
  Source = 'source-block',
  Encryption = 'encryption-block',
  Version = 'version-block',
  ObjectLock = 'object-lock-block',
  OriginalProtected = 'original-protected-block',
  DeleteBucket = 'delete-bucket-block',
  StreamMediaStorageGateway = 'stream-media-storage-gateway-block',
  Remark = 'remark-block',
  Routing = 'routing-block'
}

// Tags 标签管理
export enum BucketSettingTagRole {
  TagList = 'tag-list'
}

// Lifecycle 生命周期设置
export enum BucketSettingLifecycleRole {
  CreateRuleEntry = 'create-lifecycle-rule-entry',
  EditRuleEntry = 'edit-lifecycle-rule-entry',
  DeleteRuleEntry = 'delete-lifecycle-rule-entry',

  // （编辑/创建）生命周期规则
  EditRuleBlock = 'edit-lifecycle-rule-block',
  RuleNameInput = 'name-input',
  RulePrefixInput = 'prefix-input',
  RuleToLowFrequencyTypeCtrl = 'to-low-frequency-type-ctrl',
  RuleToArchiveTypeCtrl = 'to-archive-type-ctrl',
  RuleToDeepArchiveTypeCtrl = 'to-deep-archive-type-ctrl',
  RuleToDeleteCtrl = 'to-delete-type-ctrl'
}

// Authorization 授权设置
export enum BucketSettingAuthorizationRole {
  CreateEntry = 'create-authorization-entry',

  AuthorizationList = 'authorization-list',
  ListItemEditEntry = 'list-item-edit-entry',
  ListItemDeleteEntry = 'list-item-delete-entry',

  EditAuthorizationBlock = 'edit-authorization-block',
  AuthorizationUserInput = 'user-input',
  AuthorizationShareTypeInput = 'share-type-input',
  AuthorizationTblInput = 'tbl-input'
}

// Event 事件通知
export enum BucketSettingEventRole {
  CreateRuleEntry = 'create-event-rule-entry',

  EventList = 'event-list',
  ListItemEditEntry = 'list-item-edit-entry',
  ListItemDeleteEntry = 'list-item-delete-entry',

  // （编辑/创建）事件通知规则
  EditRuleBlock = 'edit-event-rule-block',
  RuleNameInput = 'name-input',
  RulePrefixInput = 'prefix-input',
  RuleEventsInput = 'events-input',
  RuleCallbackUrlBlock = 'callback-url-block',
  RuleCallbackUrlAddCtrl = 'callback-url-add-ctrl',
  RuleCallbackUrlRemoveCtrl = 'callback-url-remove-ctrl'
}

export enum TransferRole {
  CreateTaskEntry = 'create-task-entry',
  CreateTaskForm = 'create-task-form',
  TaskList = 'task-list',
  TaskDetailEntry = 'task-detail-entry',
  TaskStatusToggleCtrl = 'task-status-toggle-ctrl',
  TaskDeleteCtrl = 'task-delete-ctrl'
}
