import { QNNumberRange, QNOptimizationMode } from '../types';

export interface QNCameraConfig {
  cameraId?: string, // 选择摄像头id
  elementId?: string, // 绑定元素的id
  bitrate?: number, // 传输的码率，单位 kbps
  frameRate?: number, // 帧率
  height?: number | QNNumberRange, // 视频高度
  width?: number | QNNumberRange, // 视频宽度
  optimizationMode?: QNOptimizationMode; // 传输优化模式
}

export interface QNMicrophoneConfig {
  microphoneId?: string, // 选择麦克风id
  elementId?: string, // 绑定元素的id
  bitrate?: number, // 传输的码率，单位 kbps
  // 以下建议不要更改，浏览器会根据设备自动适配
  sampleRate?: number, // 采样率
  sampleSize?: number, // 采样大小
  stereo?: boolean, // 是否采用双声道
  AEC?: boolean, // 是否启动 automatic echo cancellation
  AGC?: boolean, // 是否启动 audio gain control
  ANS?: boolean, // 是否启动 automatic noise suppression
}

export interface QNScreenConfig {
  elementId?: string, // 绑定元素的id
  bitrate?: number, // 传输的码率，单位 kbps
  width?: number | QNNumberRange, // 输出画面的宽度
  height?: number | QNNumberRange, // 输出画面的高度
  optimizationMode?: QNOptimizationMode; // 传输优化模式
}

export interface QNAIDetectorConfig {
  interval: number; // 检测时间间隔, 单位毫秒(ms), 默认5000毫秒(ms)
}
