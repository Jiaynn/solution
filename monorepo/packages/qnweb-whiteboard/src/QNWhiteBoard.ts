import { version } from './config';
import { QNCreateInstanceResult, QNRoomEvent } from './types';
import * as WhiteBoardSDK from './whiteboard_sdk';

class QNWhiteBoard {
  static version = version;

  controller = WhiteBoardSDK.controller;
  joinRoomUrl = 'https://sdk.efaceboard.cn:8888/Chatboard/meeting/join';

  /**
   * 创建实例
   */
  static create() {
    return new this();
  }

  constructor() {
    // 重写 controller.join_room 方法
    const joinRoom = this.controller.join_room.bind(this.controller);
    this.controller.join_room = (appId: string, meetingId: string, userId: string, meetingToken: string) => {
      return joinRoom(this.joinRoomUrl, appId, meetingId, userId, meetingToken);
    };
  }

  /**
   * 设置加入房间的 url
   * @param url
   */
  setJoinRoomUrl(url: string) {
    this.joinRoomUrl = url;
  }

  /**
   * 当没有白板实例时调用则创建一个实例并返回该实例
   * 之后调用均会返回该实例 bucketId 从服务端获取
   * 主要包含 ppt/pdf 事件的一个实例，主要是对 ppt/pdf 状态的管理
   * @param bucketId {string} 桶 ID
   * @param el {string | HTMLElement} 承载白板的容器 id，或者传入 DOM 元素
   */
  createInstance(bucketId?: string, el?: string | HTMLElement): QNCreateInstanceResult {
    return this.controller.createInstance(bucketId, el);
  }

  /**
   * 初始化打开白板所需的参数
   * params 包含以下属性
   * | 参数        | 类型                    | 描述                                                         |
   * | ----------- | ----------------------- | ------------------------------------------------------------ |
   * | path        | String                  | 白板 iframe 的 src                                           |
   * | el          | String <br> HTMLElement | 承载白板 iframe 的容器，传 DOM 元素 id 或元素本身，默认传递'iframeBox' |
   * | playbackUrl | String                  | 回放模块请求地址                                             |
   * @param params
   */
  initConfig(params: {
    path?: string;
    el?: string | HTMLElement;
    playbackUrl?: string;
  }) {
    return this.controller.initConfig({
      playbackUrl: 'https://sdk.efaceboard.cn:8888/Chatboard/meeting/getRecord',
      ...params
    });
  }

  /**
   * 获取回放数据并初始化回放模块
   * 必须在房间关闭的状态下调用
   */
  getRecord(recordId: string) {
    return this.controller.getRecord(recordId);
  }

  /**
   * 用于配置房间中发生断网后的离线支持，必须在加入房间前调用，否则只会在下次加入房间生效
   * @param params
   */
  offlineConfig(params: {
    offline?: boolean;
    offlineFile?: boolean;
  }) {
    return this.controller.offlineConfig(params);
  }

  /**
   * 进入离线模式。离线模式与房间模式和回放模式互斥，如过已经打开了房间或开始了回放，必须首先退出房间或关闭回放后才能进入离线模式
   */
  enterOffline() {
    return this.controller.enterOffline();
  }

  /**
   * 退出离线模式
   */
  exitOffline() {
    return this.controller.exitOffline();
  }

  /**
   * 加入房间
   * @param appId {string} 应用id
   * @param meetingId {string} 房间id
   * @param userId {string} 用户id
   * @param meetingToken {string} 认证信息
   */
  joinRoom(appId: string, meetingId: string, userId: string, meetingToken: string) {
    return this.controller.join_room(appId, meetingId, userId, meetingToken);
  }

  /**
   * 离开房间
   */
  leaveRoom() {
    return this.controller.leave_room();
  }

  /**
   * 注册事件回调
   * @param event {QNRoomEvent & { [key: string]: (...args: any[]) => void }}
   */
  registerRoomEvent(event: QNRoomEvent & {
    [key: string]: (...args: any[]) => void
  }) {
    return this.controller.registerRoomEvent(event);
  }

  /**
   * widget 缩放
   * @param params widgetId 文档 ID，scale 缩放比例
   */
  scaleWidget(params: {
    widgetId: string,
    scale: number
  }) {
    return this.controller.scale_widget(params);
  }

  /**
   * 删除 widget
   * @param widgetId
   */
  deleteWidget(widgetId: string) {
    return this.controller.delete_widget(widgetId);
  }

  /**
   * 预上传文件
   * @param file
   * @param meetingId
   */
  preUpload(file: File, meetingId: string) {
    return this.controller.pre_upload(file, meetingId);
  }

  /**
   * 加载预上传的文件
   * @param params
   */
  loadPreUploadFile(params: Record<string, any>) {
    return this.controller.load_pre_upload_file(params);
  }

  /**
   * 还原笔迹
   */
  rubberUndo() {
    return this.controller.rubber_undo();
  }

  /**
   * 清空笔迹回收站
   */
  clearRecovery() {
    return this.controller.clear_recovery();
  }

  /**
   * 设置白板输入模式样式
   * @param params
   * type 0:铅笔 1:马克笔 2:点 3:手 4:空心箭头 5:实心箭头
   * color 16 进制颜色(只在0和1类型下生效，都不能为空)
   * size 尺寸(只在0和1类型下生效，都不能为空)
   */
  setPenStyle(params: {
    type?: number;
    color?: string;
    size?: number;
  }) {
    return this.controller.set_pen_style(params);
  }

  /**
   * 设置白板输入模式
   * @param mode 0-普通模式，1-橡皮模式，2-选择模式，3-图形模式，4-文字模式
   */
  setInputMode(mode: number) {
    return this.controller.set_input_mode(mode);
  }

  /**
   * 设置橡皮参数
   * @param size 橡皮大小
   */
  setEraseSize(size: number) {
    return this.controller.set_erase_size(size);
  }

  /**
   * 设置图形模式
   * @param mode
   * 0-矩形，1-圆，3-线条，6-箭头
   */
  setGeometryMode(mode: number) {
    return this.controller.set_geometry_mode(mode);
  }

  /**
   * 设置白板的背景色
   * @param theme 16进制颜色
   */
  setWhiteBoardBack(theme: string) {
    return this.controller.set_whiteboard_back(theme);
  }

  /**
   * 获取当前白板页列表
   */
  getDocuments() {
    return this.controller.get_documents();
  }

  /**
   * 新建白板页
   */
  newDocument() {
    return this.controller.new_document();
  }

  /**
   * 切换白板页，ppt/pdf 模式下不可用
   * @param documentId 文档 ID
   */
  cutDocument(documentId: string) {
    return this.controller.new_document(documentId);
  }

  /**
   * 插入白板页
   * @param documentId 文档 ID
   */
  insertDocument(documentId: string) {
    return this.controller.insert_document(documentId);
  }

  /**
   * 删除白板页
   * @param documentId 文档 ID
   */
  deleteDocument(documentId: string) {
    return this.controller.delete_document(documentId);
  }

  /**
   * 清空白板页，pdf模式下不用传 documentId
   * @param documentId
   */
  cleanDocument(documentId?: string) {
    return this.controller.clean_document(documentId);
  }

  /**
   * 白板内上传文件
   * @param params
   * file {File} 文件,
   * left {number} 文件在白板内距离左侧的距离,
   * top {number} 文件在白板内距离顶部的距离,
   * width {number} 文件在白板内的宽度, height {number} 文件在白板内的高度
   */
  uploadFile(params: {
    file: File,
    left?: number,
    top?: number,
    width?: number,
    height?: number
  }) {
    return this.controller.upload_file(params);
  }
}

export default QNWhiteBoard;
