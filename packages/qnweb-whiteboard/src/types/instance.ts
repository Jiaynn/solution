export interface QNPPTEventOnFileStateChangedData {
  /**
   * 当前 ppt 页号
   */
  no: number;
  /**
   * 当前 ppt 动画位置索引
   */
  step: number;
  /**
   * ppt 总页数
   */
  pageCount: number;
  /**
   * ppt 总动画数
   */
  stepCount: number;
}

export interface QNPDFEventOnFileStateChanged {
  /**
   * 当前 pdf 页号
   */
  currentPage: number;
  /**
   * pdf 总页数
   */
  pageCount: number;
}

export interface QNWhiteBoardEvent {
  /**
   * 打开白板成功
   * @param size width {string} 白板的虚拟宽度, height {string} 白板的虚拟高度
   */
  onWhiteBoardOpened?: (size: { width: number; height: number }) => void;
  /**
   * 打开白板失败
   */
  onWhiteBoardOpenFailed?: () => void;
  /**
   * 关闭白板成功
   */
  onWhiteBoardClosed?: () => void;
}

export interface QNPPTEvent {
  /**
   * ppt 加载成功
   */
  onFileLoadedSuccessful?: () => void;
  /**
   * ppt 加载失败
   * @param code 错误码 501: 幻灯片下载失败 502: 脚本下载失败
   */
  onFileLoadingFailed?: (code: number) => void;
  /**
   * ppt 文件状态改变
   * @param data
   */
  onFileStateChanged?: (data: QNPPTEventOnFileStateChangedData) => void;
}

export interface QNPDFEvent {
  /**
   * pdf 加载成功
   */
  onFileLoadedSuccessful?: () => void;
  /**
   * pdf 加载失败
   * @param code 错误码 501: 加载失败 502: 文件无效 503: 文件丢失 504: 意外的错误
   */
  onFileLoadingFailed?: (code: number) => void;
  /**
   * pdf 文件状态改变
   * @param data
   */
  onFileStateChanged?: (data: QNPDFEventOnFileStateChanged) => void;
}

export interface QNPlaybackEvent {
  /**
   * 回放模式初始化完成回调
   * @param totalTime 回放总时长，毫秒
   */
  onInitFinished?: (totalTime: number) => void,
  /**
   * 回放模式错误回调
   * code对应以下描述
   * | 错误码 | 描述                       |
   * | ------ | -------------------------- |
   * | 100    | 网络不可用                 |
   * | 101    | 服务器错误或繁忙           |
   * | 500    | 未关闭房间，不可初始化回放 |
   * | 501    | 下载回放记录文件失败       |
   * | 502    | 回放记录不存在             |
   * | 503    | 录制未结束                 |
   * @param code
   */
  onError?: (code: number) => void,
  /**
   * 回放进度通知回调，播放中200毫秒触发一次
   * data包含参数如下
   * | 参数   | 类型   | 描述                                                         |
   * | ------ | ------ | ------------------------------------------------------------ |
   * | status | String | `IDLE`空闲状态 <br> `LOADING`正在初始化数据 <br> `PREPARED` 已就绪<br> `PLAYING`播放中 <br> `PAUSED`已暂停 <br> `STOPPED`已停止 <br>`ERROR` 错误 <br> `DESTROYED`对象已销毁 |
   * @param status
   */
  onStatusChanged?: (status: string) => void,
  /**
   * 回放进度通知回调，播放中200毫秒触发一次
   * size包含参数如下
   * | 参数   | 类型   | 描述       |
   * | ------ | ------ | ---------- |
   * | width  | Number | 白板虚拟宽 |
   * | height | Number | 白板虚拟高 |
   * @param data
   */
  onProgress?: (data: { position: number; duration: number }) => void,
  /**
   * 白板尺寸改变回调
   * size包含参数如下
   * | 参数   | 类型   | 描述       |
   * | ------ | ------ | ---------- |
   * | width  | Number | 白板虚拟宽 |
   * | height | Number | 白板虚拟高 |
   * @param size
   */
  onBoardSizeChanged?: (size: { width: number, height: number }) => void,
  /**
   * 回放中的文件加载失败回调
   * error包含参数如下
   * | 参数      | 类型   | 描述                                  |
   * | --------- | ------ | ------------------------------------- |
   * | bucketId  | String | 白板id                                |
   * | mode      | String | 白板类型`ppt_play pdf_scroll`两者之一 |
   * | extra     | String | 文件对应的描述信息                    |
   * | errorCode | Number | 文件加载失败的错误码                  |
   * @param error
   */
  onFileLoadingFailed?: (error: { bucketId: string, mode: string, extra: string, errorCode: number }) => void,
}

export interface QNCreateInstanceResult {
  /**
   * 打开白板
   */
  openWhiteBoard: () => void;
  /**
   * 关闭白板
   */
  closeWhiteBoard: () => void;
  /**
   * 切换白板
   * @param bucketId 新白板的bucketId
   */
  changeWhiteBoard: (bucketId: string) => void;
  /**
   * 注册白板事件回调
   */
  registerWhiteBoardEvent: (event: QNWhiteBoardEvent) => void;
  /**
   * 注册 ppt 事件回调
   * 以下回调只有在 ppt-play 模式才会触发
   */
  registerPPTEvent: (event: QNPPTEvent) => void;
  /**
   * 注册 pdf 事件回调
   * 以下回调只有在 pdf-play 模式才会触发
   */
  registerPDFEvent: (event: QNPDFEvent) => void;
  /**
   * ppt 下一步
   */
  nextStep: () => void;
  /**
   * ppt 上一步
   */
  preStep: () => void;
  /**
   * ppt 跳到指定步
   * @param step ppt 目标步
   */
  jumpStep: (step: number) => void;
  /**
   * 下一页
   */
  nextPage: () => void;
  /**
   * 上一页
   */
  prePage: () => void;
  /**
   * 跳到指定页
   * @param page ppt 目标页
   */
  jumpPage: (page: number) => void;
  /**
   * 获取当前文件状态
   * 返回值参考下方 ppt/pdf 事件回调 onFileStateChanged 参数
   */
  getFileState: () => QNPPTEventOnFileStateChangedData | QNPDFEventOnFileStateChanged;
  /**
   * 获取白板 bucketId
   */
  getBucketId: () => string;
  /**
   * 获取白板模式
   */
  getBoardMode: () => string;
  /**
   * 设置pdf操作模式
   * true 开启pdf操作模式, false关闭。
   * pdf操作模式下： pc：↑↓箭头和滚轮 控制上下滚动，ctrl+滚轮控制缩放; h5：双指缩放，单指滑动滚动
   * @param mode
   */
  setPDFOperationMode: (mode: boolean) => void;
  /**
   * 注册回放事件回调
   * @param event
   */
  registerPlaybackEvent: (event: QNPlaybackEvent) => void;
  /**
   * 播放回放
   */
  play: () => void;
  /**
   * 停止回放
   */
  stop: () => void;
  /**
   * 暂停回放
   */
  pause: () => void;
  /**
   * 跳转回放
   * @param position 跳转回放的目标位置时间，[0,总时长] 区间，毫秒
   */
  seek: (position: number) => void;
  /**
   * 校准回放
   * @param offset 校准的时间长度，[-5000,5000] 区间，毫秒
   */
  calibrate: (offset: number) => void;
  /**
   * 关闭回放
   */
  release: () => void;
  /**
   * 获取当前回放进度，毫秒
   */
  getPosition: () => number;
  /**
   * 获取回放总时长，毫秒
   */
  getDuration: () => number;
  /**
   * 获取当前回放状态，值参考 registerPlaybackEvent 中 onStatusChanged 回调参数
   */
  getStatus: () => string;
  /**
   * 获取当前回放id
   */
  getRecordId: () => string;
  /**
   * 获取当前回放白板虚拟尺寸，值参考 registerPlaybackEvent 中 onBoardSizeChanged 回调参数
   */
  getWhiteBoardSize: () => { width: number; height: number };
}

