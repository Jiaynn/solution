import whiteboard from 'whiteboard';

import {
  AuthURLConfigSuffix, ClearPageConfig,
  GeometryMode,
  InputMode, JoinRoomCallback,
  JoinRoomConfig,
  PenStyle, SetCanvasStyle,
  UploadFileConfig,
  WhiteboardEvent,
  WidgetConfig
} from './types';
import { addScript, generateAuthURL, makeToStringString, buildUrl } from './utils';
import { version } from './config';
import resolveURL from 'resolve-url';

// preloadResource(config.wasmPath + 'whiteboard_webassembly.js', 'script', false);
// preloadResource(config.wasmPath + 'whiteboard_webassembly.data', 'fetch', true);
// preloadResource(config.wasmPath + 'whiteboard_webassembly.wasm', 'fetch', true);

interface Config {
  wasmPath: string;
}

const initModule = (config: Config) => {
  /**
   * 建立一个全局对象Module，用来初始化webassembly
   */
  window.Module = {
    locateFile(REMOTE_PACKAGE_BASE: string, REMOTE_PACKAGE_SIZE?: number) {
      console.log('locateFile REMOTE_PACKAGE_BASE', REMOTE_PACKAGE_BASE);
      console.log('locateFile REMOTE_PACKAGE_SIZE', REMOTE_PACKAGE_SIZE);
      console.log('wasmPath', config.wasmPath);
      return config.wasmPath + REMOTE_PACKAGE_BASE;
    }
  };
};

const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
const defaultWasmPath = isDev ?
  resolveURL('/node_modules/qnweb-whiteboard/wasm/') :
  `https://unpkg.com/qnweb-whiteboard@${version}/wasm/`;

class QNWhiteboard {
  static version: string = version;
  static config: Config = {
    wasmPath: defaultWasmPath
  };
  static setConfig(config: Config) {
    QNWhiteboard.config = config;
  }

  constructor() {
    window.controller = whiteboard.controller;
    this.controller = whiteboard.controller;
    this.baseURL = 'https://rtc.qiniuapi.com';
    this.initialURL = 'https://api.latitech.com:8888/Chatboard/meeting/join';
  }

  public baseURL: string;
  public controller: any;
  public initialized: boolean = false;
  public initialURL: string;
  public wasmJSReady: boolean = false;
  public joinRoomCallback: JoinRoomCallback = () => {
  };

  /**
   * 初始化白板
   */
  initialize() {
    initModule(QNWhiteboard.config);
    this.controller.initialize(this.initialURL);
    this.controller.mountCanvas('canvasBox');
    if (!this.wasmJSReady) {
      addScript(document.head, QNWhiteboard.config.wasmPath + 'whiteboard_webassembly.js').then(() => {
        this.wasmJSReady = true;
      });
    }
    this.initialized = true;
  }

  /**
   * 加入房间
   * @param roomToken
   * @param callback
   * @param config:
   * bgColor  [可选] 表示白板(meeting)的颜色。也有三个值可选: 1,2,3 1 代表白色，2 代表黑色，3 代表绿色。
   * limitNumber  0代表不限制：如果 >0，代表白板内最多limitNumber个人，只要白板内人数超过limitNumber数量时，就会进不去。
   * aspectRatio 宽高比，0.5 ～ 2.5之间，非必填
   * zoomScale 扩展比 1～5之间 非必填
   * title 白板标题(长度 1 ~ 20 支持数字、字符、下划线_)，相同的RTC房间，如果title相同，则进相同的房间，一个RTC房间可以有多个白板房间，标题不同就会生成新的，该字段非必填，
   * @returns {Promise<void>}
   */
  joinRoom(
    roomToken: string,
    callback: JoinRoomCallback,
    config?: JoinRoomConfig
  ) {
    if (!this.initialized) {
      this.initialize();
    }
    this.controller.mountCanvas('canvasBox');
    const joinRoomCallback = callback || this.joinRoomCallback;
    const splitRoomToken = roomToken.split(':');
    const lastString = splitRoomToken[splitRoomToken.length - 1] || '';
    const decodedString = atob(lastString);
    const parsedJSON = JSON.parse(decodedString) || {};
    const authUrl = buildUrl(generateAuthURL({
      baseURL: this.baseURL,
      appId: parsedJSON.appId,
      roomName: parsedJSON.roomName,
      suffix: AuthURLConfigSuffix.Auth
    }), {
      queryParams: {
        token: roomToken
      }
    });
    const cbAuthUrl = buildUrl(generateAuthURL({
      baseURL: this.baseURL,
      appId: parsedJSON.appId,
      roomName: parsedJSON.roomName,
      suffix: AuthURLConfigSuffix.CbAuth
    }), {
      queryParams: Object.assign({}, makeToStringString({
        token: roomToken,
        boardSizeId: 1,
        bgColor: 1,
        limitNumber: 0,
        aspectRatio: 0.5
      }), makeToStringString(config || {}))
    });
    return fetch(authUrl).then(() => {
      return fetch(cbAuthUrl).then(res => res.json());
    }).then(res => {
      return this.controller.join_room(
        res.appId, res.meetingId, parsedJSON.userId, res.meetingToken,
        joinRoomCallback
      );
    }).catch(err => joinRoomCallback(err));
  }

  /**
   * 离开房间
   */
  leaveRoom(): void {
    this.controller.leave_room();
  }

  /**
   * widget 缩放
   * @param config
   */
  scaleWidget(config: WidgetConfig): void {
    this.controller.scale_widget(config);
  }

  /**
   * 删除 widget
   * @param widgetId
   */
  deleteWidget(widgetId: number): void {
    this.controller.delete_widget(widgetId);
  }

  /**
   * 还原笔迹
   */
  rubberUndo(): void {
    this.controller.rubber_undo();
  }

  /**
   * 清空 undo 回收站
   */
  clearRecovery(): void {
    this.controller.clear_recovery();
  }

  /**
   * 设置白板输入模式属性
   * @param style
   */
  setPenStyle(style: PenStyle): void {
    this.controller.set_pen_style(style);
  }

  /**
   * 设置白板输入模式
   * 普通模式 mode = 0;
   * 橡皮模式 mode = 1;
   * 选择模式 mode = 2;
   * 图形模式 mode = 3;
   * 文字模式 mode = 4;
   * @param mode
   */
  setInputMode(mode: InputMode): void {
    this.controller.set_input_mode(mode);
  }

  /**
   * 设置橡皮参数
   * @param size
   */
  setEraseSize(size: number): void {
    this.controller.set_erase_size(size);
  }

  /**
   * 设置图形模式
   * mode 矩形 - 0 圆 - 1 线 - 3 箭头 - 6
   * @param mode
   */
  setGeometryMode(mode: GeometryMode): void {
    this.controller.set_geometry_mode(mode);
  }

  /**
   * 设置白板的背景色
   * @param color
   */
  setWhiteboardBack(color: string): void {
    this.controller.set_whiteboard_back(color);
  }

  /**
   * 新建文档
   */
  newDocument(): void {
    this.controller.new_document();
  }

  /**
   * 切换文档
   * @param widgetId
   */
  cutDocument(widgetId: string): void {
    this.controller.cut_document(widgetId);
  }

  /**
   * 插入文档
   * @param widgetId
   */
  insertDocument(widgetId: string): void {
    this.controller.insert_document(widgetId);
  }

  /**
   * 删除文档
   * @param widgetId
   */
  deleteDocument(widgetId: string): void {
    this.controller.delete_document(widgetId);
  }

  /**
   * 文件上传
   * @param config
   */
  uploadFile(config: UploadFileConfig): void {
    const superior = Object.assign(
      this.controller.room,
      this.controller.me
    );
    this.controller.upload_file({
      superior,
      ...config
    });
  }

  /**
   * 事件回调接口
   * @param event
   * @param callback
   */
  registerEvent(event: WhiteboardEvent, callback: Function): void {
    this.controller.registerEvent(event, callback);
  }

  /**
   * 取消事件回调接口
   * @param event
   * @param callback
   */
  unregisterEvent(event: WhiteboardEvent, callback: Function): void {
    this.controller.unregisterEvent(event, callback);
  }

  /**
   * 取消选择
   */
  cancelSelect(): void {
    this.controller.cancel_select();
  }

  /**
   * 清屏
   * @param config
   */
  clearPage(config: ClearPageConfig): void {
    this.controller.clear_page(config);
  }

  /**
   * 设置 canvas
   * @param style
   */
  setCanvasStyle(style: SetCanvasStyle = {}) {
    const canvas: HTMLCanvasElement | null = document.querySelector('#canvas');
    if (canvas) {
      const width = style.width || document.body.clientWidth;
      const height = style.height || document.body.clientHeight;
      const devicePixelRatio = window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.left = '0px';
      canvas.style.top = '0px';
      canvas.style.borderRadius = '0';
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      this.controller.update_canvas_size({
        originWidth: width,
        originHeight: height,
        height: height * devicePixelRatio,
        width: width * devicePixelRatio
      });
    }
  }

  /**
   * 销毁 webgl 上下文
   */
  destroyWebglContext() {
    this.controller.destroyWebglContext();
  }
}

export default QNWhiteboard;
