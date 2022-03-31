import QNRTC, { QNCameraVideoTrack } from 'qnweb-rtc';

import { QNDevice } from '@/core';
import { QNCameraConfig } from '@/types';

export class QNCamera extends QNDevice {
  static create(config?: QNCameraConfig) {
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

  constructor(config?: QNCameraConfig) {
    super();
    this.config = config;
  }

  public cameraVideoTrack?: QNCameraVideoTrack; // 摄像头视频轨道
  public config?: QNCameraConfig; // 摄像头采集配置

  /**
   * 采集摄像头视频流
   * @private
   */
  private async createCameraVideoTrack(): Promise<QNCameraVideoTrack> {
    return QNRTC.createCameraVideoTrack({
      tag: 'camera',
      cameraId: this.config?.cameraId,
      encoderConfig: {
        bitrate: this.config?.bitrate,
        frameRate: this.config?.frameRate,
        width: this.config?.width,
        height: this.config?.height
      },
      optimizationMode: this.config?.optimizationMode
    });
  }

  /**
   * 采集/播放摄像头视频流
   */
  async start() {
    this.cameraVideoTrack = await this.createCameraVideoTrack();
    const elementId = this.config?.elementId;
    if (!elementId) {
      return;
    }
    const element = document.getElementById(elementId);
    if (!element) {
      throw new TypeError(`elementId ${elementId} is not found`);
    }
    return this.cameraVideoTrack.play(element);
  }

  /**
   * 停止采集/播放摄像头视频流
   */
  async stop(): Promise<void> {
    if (this.cameraVideoTrack) {
      await this.cameraVideoTrack.destroy();
      this.cameraVideoTrack = undefined;
    }
  }
}

