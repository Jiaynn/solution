import { QNFaceDetector } from 'qnweb-rtc-ai';
import { QNLocalVideoTrack, QNRemoteVideoTrack } from 'qnweb-rtc';

import { QNVideoDetector } from './QNDetector';

interface Config {
  interval: number;
}

/**
 * 用户出框检测器
 */
export class QNOutOfScreenDetector extends QNVideoDetector {
  static create(config?: Config) {
    return new this(config);
  }

  constructor(config?: Config) {
    super();
    this.config = config;
  }

  private config?: Config;
  private timer?: NodeJS.Timer;
  private onCallback: Function = () => {
  };

  on(callback: Function) {
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
        this.onCallback(result.response.num_face <= 0);
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
