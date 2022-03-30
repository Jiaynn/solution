import { QNFaceDetector } from 'qnweb-rtc-ai';
import { QNLocalVideoTrack, QNRemoteVideoTrack } from 'qnweb-rtc';

import { QNVideoDetector } from './QNDetector';

interface Config {
  interval?: number;
}

/**
 * 多人同框检测器
 */
export class QNMultiplePeopleDetector extends QNVideoDetector {
  static create(config?: Config) {
    return new this(config);
  }

  constructor(config?: Config) {
    super();
    this.config = config;
  }

  private config?: Config;
  private timer?: NodeJS.Timer;
  private onCallback: (result: number) => void = () => {
  };

  on(callback: (result: number) => void) {
    this.onCallback = callback;
  }

  /**
   * 开启检测
   * @param track
   */
  enable(track: QNLocalVideoTrack | QNRemoteVideoTrack) {
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
  disable() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
