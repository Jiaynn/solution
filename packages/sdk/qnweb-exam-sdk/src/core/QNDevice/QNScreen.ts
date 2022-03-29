import QNRTC, { QNLocalAudioTrack, QNScreenVideoTrack } from 'qnweb-rtc';

import { QNDevice } from '../index';
import { QNMicrophoneConfig, QNScreenConfig } from '../../types';

export class QNScreen extends QNDevice {
  static create(config: QNMicrophoneConfig) {
    return new this(config);
  }

  constructor(config: QNScreenConfig) {
    super();
    this.config = config;
  }

  public screenVideoTrack?: QNScreenVideoTrack;
  public config: QNScreenConfig;

  /**
   * 采集屏幕共享视频流
   * @private
   */
  private async createScreenVideoTrack() {
    const track = await QNRTC.createScreenVideoTrack({
      encoderConfig: {
        bitrate: this.config.bitrate,
        width: this.config.width,
        height: this.config.height
      },
      optimizationMode: this.config.optimizationMode
    });
    const tracks = (
      new Array<QNScreenVideoTrack | QNLocalAudioTrack>()
    ).concat(track);
    return tracks.find(
      (track): track is QNScreenVideoTrack => track instanceof QNScreenVideoTrack
    ) as QNScreenVideoTrack;
  }

  async start() {
    this.screenVideoTrack = await this.createScreenVideoTrack();
    const elementId = this.config.elementId;
    if (!elementId) {
      return;
    }
    const element = document.getElementById(elementId);
    if (!element) {
      throw new TypeError(`elementId ${elementId} is not found`);
    }
    return this.screenVideoTrack.play(element);
  }

  async stop(): Promise<void> {
    if (this.screenVideoTrack) {
      await this.screenVideoTrack.destroy();
      this.screenVideoTrack = undefined;
    }
  }
}
