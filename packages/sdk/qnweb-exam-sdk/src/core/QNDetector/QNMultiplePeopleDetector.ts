import { QNFaceDetector } from 'qnweb-rtc-ai';
import { QNLocalVideoTrack, QNRemoteVideoTrack } from 'qnweb-rtc';

import { QNMediaDetectorConfig, QNVideoDetector } from './QNDetector';

/**
 * 多人同框检测器
 */
export class QNMultiplePeopleDetector extends QNVideoDetector {
  static create(config?: QNMediaDetectorConfig) {
    return new this(config);
  }

  constructor(config?: QNMediaDetectorConfig) {
    super();
    this.config = config;
  }

  private config?: QNMediaDetectorConfig;
  private timer?: NodeJS.Timer;
  private onCallback: (result: number) => void = () => {
  };

  /**
   * 注册回调
   * @param callback
   */
  on(callback: (result: number) => void): void {
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
        this.onCallback(result.response.num_face);
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
