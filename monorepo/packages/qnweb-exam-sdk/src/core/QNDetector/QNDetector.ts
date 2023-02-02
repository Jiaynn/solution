import { QNLocalAudioTrack, QNLocalVideoTrack, QNRemoteAudioTrack, QNRemoteVideoTrack } from 'qnweb-rtc';

import { InternalFunction } from '@/types';

/**
 * 视频检测器
 */
export abstract class QNVideoDetector {
  /**
   * 事件回调监听
   * @param callback
   */
  abstract on(callback: InternalFunction): void;

  /**
   * 开启检测
   * @param track
   */
  abstract enable(track: QNLocalVideoTrack | QNRemoteVideoTrack): void;

  /**
   * 关闭检测
   */
  abstract disable(): void;
}

/**
 * 音频检测器
 */
export abstract class QNAudioDetector {
  /**
   * 事件回调监听
   * @param callback
   */
  abstract on(callback: InternalFunction): void;

  /**
   * 开启检测
   * @param track
   */
  abstract enable(track: QNLocalAudioTrack | QNRemoteAudioTrack): void;

  /**
   * 关闭检测
   */
  abstract disable(): void;
}

/**
 * 浏览器检测器
 */
export abstract class QNBrowserDetector {
  /**
   * 事件回调监听
   * @param callback
   */
  abstract on(callback: InternalFunction): void;

  /**
   * 开启检测
   */
  abstract enable(): void;

  /**
   * 关闭检测
   */
  abstract disable(): void;
}

/**
 * 检测器
 */
export type QNDetector = QNAudioDetector | QNVideoDetector | QNBrowserDetector;

/**
 * 是否是视频检测器
 * @param detector
 */
export function isQNVideoDetector(detector: QNDetector): detector is QNVideoDetector {
  return detector instanceof QNVideoDetector;
}

/**
 * 是否是音频检测器
 * @param detector
 */
export function isQNAudioDetector(detector: QNDetector): detector is QNAudioDetector {
  return detector instanceof QNAudioDetector;
}

/**
 * 是否是浏览器检测器
 * @param detector
 */
export function isQNBrowserDetector(detector: QNDetector): detector is QNBrowserDetector {
  return detector instanceof QNBrowserDetector;
}

export interface QNMediaDetectorConfig {
  interval?: number;
}
