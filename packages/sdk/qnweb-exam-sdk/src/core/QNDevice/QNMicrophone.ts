import { QNDevice } from './index';
import { QNMicrophoneConfig } from '../../types';
import QNRTC, { QNMicrophoneAudioTrack } from 'qnweb-rtc';

export class QNMicrophone extends QNDevice {
  static create(config: QNMicrophoneConfig) {
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

  constructor(config: QNMicrophoneConfig) {
    super();
    this.config = config;
  }

  public microphoneAudioTrack?: QNMicrophoneAudioTrack; // 当前Track对象
  public config: QNMicrophoneConfig;

  /**
   * 采集摄像头音频流
   * @private
   */
  private async createMicrophoneVideoTrack(): Promise<QNMicrophoneAudioTrack> {
    return QNRTC.createMicrophoneAudioTrack({
      tag: 'microphone',
      microphoneId: this.config.microphoneId,
      encoderConfig: {
        bitrate: this.config.bitrate,
        sampleRate: this.config.sampleRate,
        sampleSize: this.config.sampleSize,
        stereo: this.config.stereo,
      },
      AEC: this.config.AEC,
      AGC: this.config.AGC,
      ANS: this.config.ANS
    });
  }

  async start(): Promise<QNMicrophoneAudioTrack> {
    this.microphoneAudioTrack = await this.createMicrophoneVideoTrack();
    return this.microphoneAudioTrack;
  }

  async stop(): Promise<void> {
    if (this.microphoneAudioTrack) {
      await this.microphoneAudioTrack.destroy();
      this.microphoneAudioTrack = undefined;
    }
  }
}

