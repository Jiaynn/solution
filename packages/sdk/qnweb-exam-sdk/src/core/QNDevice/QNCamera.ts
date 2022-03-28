import QNRTC, { QNCameraVideoTrack } from 'qnweb-rtc';

import { QNDevice } from '@/core';
import { QNCameraConfig } from '@/types';

export class QNCamera extends QNDevice {
  static create(config: QNCameraConfig) {
    return new this(config);
  }

  /**
   * 枚举可用的摄像头输入设备
   * @link https://developer.qiniu.com/rtc/9070/WebQNRTC#getCameras
   * @param skipPermissionCheck
   */
  static getCameras(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]> {
    return QNRTC.getCameras(skipPermissionCheck);
  }

  constructor(config: QNCameraConfig) {
    super();
    this.config = config;
  }

  public cameraVideoTrack?: QNCameraVideoTrack; // 当前Track对象
  public config: QNCameraConfig;

  /**
   * 采集摄像头视频流
   * @private
   */
  private async createCameraVideoTrack(): Promise<QNCameraVideoTrack> {
    return QNRTC.createCameraVideoTrack({
      tag: 'camera',
      cameraId: this.config.cameraId,
      encoderConfig: {
        bitrate: this.config.bitrate,
        frameRate: this.config.frameRate,
        width: this.config.width,
        height: this.config.height
      },
      optimizationMode: this.config.optimizationMode
    });
  }

  async start(): Promise<QNCameraVideoTrack> {
    this.cameraVideoTrack = await this.createCameraVideoTrack();
    return this.cameraVideoTrack;
  }

  async stop(): Promise<void> {
    if (this.cameraVideoTrack) {
      await this.cameraVideoTrack.destroy();
      this.cameraVideoTrack = undefined;
    }
  }
}

