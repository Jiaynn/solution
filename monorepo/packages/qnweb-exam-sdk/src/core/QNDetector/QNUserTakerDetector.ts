import { QNAuthoritativeFaceComparer } from 'qnweb-rtc-ai';
import { QNLocalVideoTrack, QNRemoteVideoTrack } from 'qnweb-rtc';

import { QNMediaDetectorConfig, QNVideoDetector } from './QNDetector';

export interface QNUserTakerDetectorConfig extends QNMediaDetectorConfig {
  realName: string;
  idCard: string;
}

/**
 * 用户替考检测器
 */
export class QNUserTakerDetector extends QNVideoDetector {
  static create(config: QNUserTakerDetectorConfig) {
    return new this(config);
  }

  constructor(config: QNUserTakerDetectorConfig) {
    super();
    this.config = config;
  }

  private config: QNUserTakerDetectorConfig;
  private timer?: NodeJS.Timer;
  private onCallback: ((result: number) => void) | null = null;

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
      QNAuthoritativeFaceComparer.run(track, {
        realname: this.config.realName,
        idcard: this.config.idCard
      }).then(result => {
        this.onCallback?.(result.response.similarity);
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
