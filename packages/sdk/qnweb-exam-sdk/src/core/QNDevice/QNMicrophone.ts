import QNRTC, { QNMicrophoneAudioTrack } from 'qnweb-rtc';

import { QNDevice } from '@/core';
import { QNMicrophoneConfig } from '@/types';

export class QNMicrophone extends QNDevice {
  static create(config?: QNMicrophoneConfig) {
    return new this(config);
  }

  /**
   * 枚举可用的麦克风输入设备
   * @link https://developer.qiniu.com/rtc/9070/WebQNRTC#getMicrophones
   * @param skipPermissionCheck
   */
  static getMicrophones(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]> {
    return QNRTC.getMicrophones(skipPermissionCheck);
  }

  constructor(config?: QNMicrophoneConfig) {
    super();
    this.config = config;
  }

  public microphoneAudioTrack?: QNMicrophoneAudioTrack; // 麦克风音频轨道
  public config?: QNMicrophoneConfig; // 麦克风采集配置

  /**
   * 采集麦克风音频流
   * @private
   */
  private async createMicrophoneVideoTrack(): Promise<QNMicrophoneAudioTrack> {
    return QNRTC.createMicrophoneAudioTrack({
      tag: 'microphone',
      microphoneId: this.config?.microphoneId,
      encoderConfig: {
        bitrate: this.config?.bitrate,
        sampleRate: this.config?.sampleRate,
        sampleSize: this.config?.sampleSize,
        stereo: this.config?.stereo,
      },
      AEC: this.config?.AEC,
      AGC: this.config?.AGC,
      ANS: this.config?.ANS
    });
  }

  /**
   * 采集/播放麦克风音频流
   */
  async start() {
    this.microphoneAudioTrack = await this.createMicrophoneVideoTrack();
    const elementId = this.config?.elementId;
    if (!elementId) {
      return;
    }
    const element = document.getElementById(elementId);
    if (!element) {
      throw new TypeError(`elementId ${elementId} is not found`);
    }
    return this.microphoneAudioTrack.play(element);
  }

  /**
   * 停止采集/播放麦克风音频流
   */
  async stop(): Promise<void> {
    if (this.microphoneAudioTrack) {
      await this.microphoneAudioTrack.destroy();
      this.microphoneAudioTrack = undefined;
    }
  }
}

