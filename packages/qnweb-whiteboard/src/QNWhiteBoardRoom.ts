import * as whiteboard from './whiteboard_sdk';
import { QNJoinRoomParams } from './types';
import { buildAuthURL, buildUrl, makeToStringString, parseRoomToken } from './utils';
import { baseURL } from './config';

class QNWhiteBoardRoom {
  protected controller = whiteboard.controller;
  protected roomTokenJson: ReturnType<typeof parseRoomToken> = {
    appId: '',
    expireAt: 0,
    permission: '',
    roomName: '',
    userId: ''
  };

  /**
   * 生成cbauth
   * @param roomToken
   * @private
   */
  private makeAuthUrl(roomToken: string) {
    return buildUrl(buildAuthURL({
      baseURL,
      appId: this.roomTokenJson.appId,
      roomName: this.roomTokenJson.roomName,
      suffix: 'auth'
    }), {
      queryParams: {
        token: roomToken
      }
    });
  }

  /**
   * 生成cbauth
   * @param roomToken
   * @param params
   * @private
   */
  private makeCbAuthUrl(roomToken: string, params?: QNJoinRoomParams) {
    return buildUrl(buildAuthURL({
      baseURL,
      appId: this.roomTokenJson.appId,
      roomName: this.roomTokenJson.roomName,
      suffix: 'cbauth'
    }), {
      queryParams: Object.assign({}, makeToStringString({
        token: roomToken,
        boardSizeId: 1,
        bgColor: 1,
        limitNumber: 0,
        aspectRatio: 0.5,
        ...params
      }))
    });
  }

  /**
   * 加入房间
   * @param roomToken string 房间token
   * @param params JoinRoomParams 加入房间的参数
   * bgColor  [可选] 表示白板(meeting)的颜色。也有三个值可选: 1,2,3 1 代表白色，2 代表黑色，3 代表绿色。
   * limitNumber  0代表不限制：如果 >0，代表白板内最多limitNumber个人，只要白板内人数超过limitNumber数量时，就会进不去。
   * aspectRatio 宽高比，0.5 ～ 2.5之间，非必填
   * zoomScale 扩展比 1～5之间 非必填
   * title 白板标题(长度 1 ~ 20 支持数字、字符、下划线_)，相同的RTC房间，如果title相同，则进相同的房间，一个RTC房间可以有多个白板房间，标题不同就会生成新的，该字段非必填
   */
  joinRoom(
    roomToken: string,
    params?: QNJoinRoomParams
  ) {
    const roomTokenJson = parseRoomToken(roomToken);
    this.roomTokenJson = roomTokenJson;
    const authUrl = this.makeAuthUrl(roomToken);
    const cbAuthUrl = this.makeCbAuthUrl(roomToken, params);
    return fetch(authUrl).then(() => {
      return fetch(cbAuthUrl).then(res => res.json());
    }).then(res => {
      return this.controller.join_room(
        res.appId, res.meetingId, roomTokenJson.userId, res.meetingToken,
      );
    });
  }

  /**
   * 离开房间
   */
  leaveRoom() {
    return this.controller.leave_room();
  }

  /**
   * 注册事件回调
   * @param events
   * onJoinSuccess 加入房间成功
   * onJoinFailed 加入房间失败
   * onRoomStatusChanged 房间连接状态改变
   */
  registerRoomEvent(events: {
    onJoinSuccess?: () => void;
    onJoinFailed?: () => void;
    onRoomStatusChanged?: (code: number) => void;
  }) {
    return this.controller.registerRoomEvent(events);
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
   * type 1-铅笔，2-马克笔
   * color 16进制颜色
   * size 尺寸
   */
  setPenStyle(params: {
    type: number;
    color: string;
    size: number;
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
   * 0-矩形，1-圆，3-实线，6-空心箭头，8-虚线，9-椭圆，10-实心箭头
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
   * 新建文档
   */
  newDocument() {
    return this.controller.new_document();
  }

  /**
   * 切换文档
   * @param widgetId 文档 ID
   */
  cutDocument(widgetId: string) {
    return this.controller.new_document(widgetId);
  }

  /**
   * 插入文档
   * @param widgetId 文档 ID
   */
  insertDocument(widgetId: string) {
    return this.controller.insert_document(widgetId);
  }

  /**
   * 删除文档
   * @param widgetId 文档 ID
   */
  deleteDocument(widgetId: string) {
    return this.controller.delete_document(widgetId);
  }

  /**
   * 清空文档
   * @param widgetId 文档 ID
   */
  cleanDocument(widgetId: string) {
    return this.controller.clean_document(widgetId);
  }
}

export default QNWhiteBoardRoom;
