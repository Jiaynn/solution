import {  QNVideoDetector } from './QNDetector';
import { QNAuthoritativeFaceComparer } from 'qnweb-rtc-ai';
import { QNLocalVideoTrack, QNRemoteVideoTrack } from 'qnweb-rtc';

interface Config {
  interval?: number;
  realName: string;
  idCard: string;
}

/**
 * 用户替考检测器
 */
export class QNUserTakerDetector extends QNVideoDetector {
  static create(config: Config) {
    return new this(config);
  }

  constructor(config: Config) {
    super();
    this.config = config;
  }

  private config: Config;
  private timer?: NodeJS.Timer;
  private onCallback: Function = () => {
  };

  on(callback: Function) {
    this.onCallback = callback;
  }

  enable(track: QNLocalVideoTrack | QNRemoteVideoTrack) {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      QNAuthoritativeFaceComparer.run(track, {
        realname: this.config.realName,
        idcard: this.config.idCard
      }).then(result => {
        this.onCallback(result.response.similarity);
      });
    }, this.config?.interval || 1000);
  }

  disable() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
