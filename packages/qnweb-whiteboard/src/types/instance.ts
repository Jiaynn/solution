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
}

