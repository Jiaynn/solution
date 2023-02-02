export interface QNAuthUrlParams {
  baseURL?: string;
  appId?: string;
  roomName?: string;
  suffix: 'auth' | 'cbauth';
}

/**
 * 白板的大小
 * 默认 3
 */
export enum QNBoardSize {
  Row2Column2 = 1,
  Row3Column3,
  Row1Column3
}

/**
 * 表示白板的颜色
 */
export enum QNBgColor {
  White = 1,
  Black,
  Green
}

/**
 * 加入房间配置
 */
export interface QNJoinRoomParams {
  boardSizeId?: QNBoardSize;
  bgColor?: QNBgColor;
  // 0 代表不限制
  // 如果 > 0，代表白板内最多limitNumber个人
  // 只要白板内人数超过limitNumber数量时，就会进不去。
  limitNumber?: number;
  // aspectRatio 宽高比，0.5 ～ 2.5之间，非必填
  aspectRatio?: number;
  // zoomScale 扩展比 1～5之间 非必填
  zoomScale?: number;
  // 白板标题(长度 1 ~ 20 支持数字、字符、下划线_)，
  // 相同的RTC房间，如果title相同，则进相同的房间，
  // 一个RTC房间可以有多个白板房间，标题不同就会生成新的，
  // 该字段非必填，
  title?: string;
}

/**
 * widget 配置
 */
export interface QNWidgetConfig {
  widgetId?: number;
  scale?: QNWidgetConfigScale;
}

export enum QNWidgetConfigScale {
  Zoom = 1,
  ZoomOut = -1
}

/**
 * 画笔类型
 */
export enum QNPenType {
  WritingPen,
  HighlighterPen,
  Pointer1,
  Pointer2,
  Pointer3,
  Pointer4,
}

/**
 * 画笔样式
 * color: #FF+颜色 彩笔: #7F+颜色
 */
export interface QNPenStyle {
  type?: QNPenType,
  color?: string,
  size?: number
}

/**
 * 白板输入模式
 */
export enum QNInputMode {
  Select = 'select', // 选择模式
  Pencil = 'pencil', // 普通画笔模式
  Laser = 'laser', // 激光模式
  Rubber = 'rubber', // 橡皮模式
  Geometry = 'geometry', // 图形模式
  Mark = 'mark' // mark 笔模式
}

/**
 * 图形模式
 */
export enum QNGeometryMode {
  Rectangle = 0,
  Circle = 1,
  Line = 3,
  Arrow = 6
}

/**
 * Object.assign(controller.room,controller.me)
 */
export interface QNSuperior {
  appId: string;
  meetingId: string;
  userId: string;
  token: string;
  chatRoomId: number;
  fileGroupId: string;
  sessionId: string;
  nickName: string;
  avatar: string;
  roleId: QNRoleID[];
}

/**
 * 角色
 */
export interface QNRoleID {
  roleName: string;
  roleId: number;
  level: number;
}


/**
 * 上传文件配置
 */
export interface QNUploadFileConfig {
  file?: File;
  superior?: QNSuperior,
  left?: number;
  top?: number;
  width?: number;
  height?: number,
  callback?: (error?: Error) => void;
}

/**
 * 事件
 */
export enum QNWhiteboardEvent {
  // 所有事件
  AllEvent,
  // 页面列表变更，例如有人新建或者删除页面
  PageListChanged,
  // 当前显示页面发生变更，例如翻页会触发此动作
  PageChanged,
  // Webassembly 加载完成
  WebassemblyReady,
  // 白板的尺寸发生变更
  WhiteboardSizeChanged,
  // 加入房间失败
  JoinRoomError,
  // 文档发生变更
  DocumentChange,
  // 背景色发生变更
  BackgroundChange,
  // 当前的活动 widget 发生变更
  WidgetActivity,
  // 当前 widget 被翻页
  FileFlip,
  // 橡皮的可还原状态发生变更
  RecoveryState,
  // 有文件发生变化，例如插入、删除等
  WidgetAction
}

/**
 * 加入房间状态
 */
export enum QNJoinRoomStatus {
  Open = 'open',
  Error = 'error',
  Close = 'close'
}

export interface QNJoinRoomCallbackResult {
  status: QNJoinRoomStatus;
  event: Event;
}

/**
 * 加入房间 WebSocket 状态
 */
export type QNJoinRoomCallback = (result: QNJoinRoomCallbackResult) => void;

/**
 * 设置 canvas
 */
export interface QNSetCanvasStyle {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
}

/**
 * 清屏
 */
export interface QNClearPageConfig {
  widgetId: string;
}
