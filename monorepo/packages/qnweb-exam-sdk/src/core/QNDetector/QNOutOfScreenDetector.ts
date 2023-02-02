import { QNFaceDetector } from 'qnweb-rtc-ai';
import { QNLocalVideoTrack, QNRemoteVideoTrack } from 'qnweb-rtc';

import { QNMediaDetectorConfig, QNVideoDetector } from './QNDetector';

/**
 * 用户出框检测器
 */
export class QNOutOfScreenDetector extends QNVideoDetector {
  static create(config?: QNMediaDetectorConfig) {
    return new this(config);
  }

  constructor(config?: QNMediaDetectorConfig) {
    super();
    this.config = config;
  }

  private config?: QNMediaDetectorConfig;
  private timer?: NodeJS.Timer;
  private onCallback: ((result: boolean) => void) | null = null;

  /**
   * 注册回调
   * @param callback
   */
  on(callback: (result: boolean) => void): void {
    this.onCallback = callback;
  }

  /**
   * 开启检测
   * @param track
   */
  enable(track: QNLocalVideoTrack | QNRemoteVideoTrack): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      QNFaceDetector.run(track).then(result => {
        const num = result?.response?.result?.face_num || 0;
        this.onCallback?.(num <= 0);
      });
    }, this.config?.interval || 1000);
  }

  /**
   * 关闭检测
   */
  disable(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
