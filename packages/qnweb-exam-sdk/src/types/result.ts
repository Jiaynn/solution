export interface QNTestResult {
  isCameraEnabled: boolean, // 摄像头是否正常开启
  isMicrophoneEnabled: boolean, // 麦克风是否正常开启
  isScreenEnabled: boolean, // 屏幕共享是否正常开启
  isSDKSupport: boolean; // SDK 是否支持
}

export interface QNDetectorResult<T> {
  code: number, // 0: 成功, 其他: 失败
  timestamp: number, // 触发时间
  id: string, // 响应id
  data?: T, // 响应数据结果
  message: string, // 成功/错误消息提示
}

export type QNAIDetectorResult = QNDetectorResult<{score: number}>; // score: 检测结果得分

export type QNKeyboardDetectorResult = QNDetectorResult<{text: string}>; // text: 文本内容

export type QNBrowserTabDetectorResult = QNDetectorResult<{visible: boolean}>; // visible: tab是否可见
