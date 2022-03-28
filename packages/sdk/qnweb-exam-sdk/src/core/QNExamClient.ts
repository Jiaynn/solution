import QNRTC, {
  QNCameraVideoTrack,
  QNConnectionDisconnectedInfo,
  QNConnectionState,
  QNMicrophoneAudioTrack,
  QNRemoteAudioTrack,
  QNRemoteVideoTrack,
  QNRTCClient,
  QNScreenVideoTrack,
} from 'qnweb-rtc';

import { isQNCamera, isQNMicrophone, isQNScreen, QNCamera, QNInternalDevice, QNMicrophone, QNScreen } from './QNDevice';
import {
  isQNAudioDetector, isQNBrowserDetector, isQNVideoDetector,
  QNAudioDetector,
  QNBrowserDetector,
  QNDetector, QNVideoDetector
} from './QNDetector';
import { log, parseStringToObject } from '../utils';
import { QNTestResult } from '../types';
import { QNRtcAiManager } from 'qnweb-rtc-ai';

type DeviceId = 'camera' | 'microphone' | 'screen';

interface TokenParams {
  rtcToken: string;
  aiToken?: string;
}

export class QNExamClient {
  static create() {
    return new this();
  }

  constructor() {
    this.rtcClient = QNRTC.createClient();
  }

  public rtcClient: QNRTCClient;
  public subscribedTracks: (QNRemoteVideoTrack | QNRemoteAudioTrack)[] = [];
  public registeredDevice: Map<DeviceId, QNInternalDevice> = new Map();
  public enabledVideoDetector: Map<QNVideoDetector, QNInternalDevice> = new Map();
  public enabledAudioDetector: Map<QNAudioDetector, QNInternalDevice> = new Map();
  public enabledBrowserDetector: QNBrowserDetector[] = [];

  private addRTCEventListener() {
    this.rtcClient.on('user-joined', this.userJoined);
    this.rtcClient.on('user-left', this.userLeft);
    this.rtcClient.on('user-published', this.userPublished);
    this.rtcClient.on('user-unpublished', this.userUnpublished);
  }

  private removeRTCEventListener() {
    this.rtcClient.off('user-joined', this.userJoined);
    this.rtcClient.off('user-left', this.userLeft);
    this.rtcClient.off('user-published', this.userPublished);
    this.rtcClient.off('user-unpublished', this.userUnpublished);
  }

  /**
   * 注册设备
   * @param deviceId
   * @param device
   */
  registerDevice(deviceId: DeviceId, device: QNInternalDevice): void {
    this.registeredDevice.set(deviceId, device);
  }

  /**
   * 取消注册设备
   * @param deviceId
   */
  unregisterDevice(deviceId: DeviceId): void {
    this.registeredDevice.delete(deviceId);
  }

  /**
   * 开启检测
   * @param detector
   * @param deviceId
   */
  enable(detector: QNDetector, deviceId?: DeviceId): void {
    if (deviceId) {
      const device = this.registeredDevice.get(deviceId);
      if (isQNVideoDetector(detector) && device) {
        this.enabledVideoDetector.set(detector, device);
        return;
      }
      if (isQNAudioDetector(detector) && device) {
        this.enabledAudioDetector.set(detector, device);
        return;
      }
    }
    if (isQNBrowserDetector(detector)) {
      this.enabledBrowserDetector.push(detector);
      return;
    }
    throw new TypeError('Unsupported detector type');
  }

  /**
   * 关闭检测
   * @param detector
   */
  disable(detector: QNDetector): void {
    if (isQNVideoDetector(detector)) {
      this.enabledVideoDetector.delete(detector);
      return;
    }
    if (isQNAudioDetector(detector)) {
      this.enabledAudioDetector.delete(detector);
      return;
    }
    if (isQNBrowserDetector(detector)) {
      this.enabledBrowserDetector = this.enabledBrowserDetector.filter(
        enabledDetector => enabledDetector !== detector
      );
      return;
    }
    throw new TypeError('Unsupported detector type');
  }

  /**
   * 身份识别
   * @param headImgPath
   */
  identify(headImgPath: string) {

  }

  /**
   * 设备调试
   */
  async test(): Promise<QNTestResult> {
    const isSDKSupport = QNRTC.isBrowserSupported();
    const result = {
      isSDKSupport,
      isCameraEnabled: false,
      isMicrophoneEnabled: false,
      isScreenEnabled: false,
    };
    if (!isSDKSupport) {
      return result;
    }

    const cameraDevice = this.registeredDevice.get('camera');
    const microphoneDevice = this.registeredDevice.get('microphone');
    const screenDevice = this.registeredDevice.get('screen');
    if (cameraDevice) {
      await cameraDevice.start();
      result.isCameraEnabled = true;
    }
    if (microphoneDevice) {
      await microphoneDevice.start();
      result.isMicrophoneEnabled = true;
    }
    if (screenDevice) {
      await screenDevice.start();
      result.isScreenEnabled = true;
    }
    return result;
  }

  async stopTest() {
    return Promise.all([
      this.registeredDevice.get('camera')?.stop(),
      this.registeredDevice.get('microphone')?.stop(),
      this.registeredDevice.get('screen')?.stop(),
    ]);
  }

  /**
   * 开始监考
   * @param token
   */
  async start(token: TokenParams) {
    const { rtcToken, aiToken } = token;
    this.addRTCEventListener();
    if (aiToken) {
      QNRtcAiManager.init(aiToken);
    }
    await this.rtcClient.join(rtcToken);
    await Promise.all([
      this.enableCamera(),
      this.enableMicrophone(),
      this.enableScreen(),
    ]);

    this.enabledBrowserDetector.forEach(detector => {
      detector.enable();
    });
    this.enabledVideoDetector.forEach((device, detector) => {
      if (isQNCamera(device) && device.cameraVideoTrack) {
        detector.enable(device.cameraVideoTrack);
      }
      if (isQNScreen(device) && device.screenVideoTrack) {
        detector.enable(device.screenVideoTrack);
      }
    });
    this.enabledAudioDetector.forEach((device, detector) => {
      if (isQNMicrophone(device) && device.microphoneAudioTrack) {
        detector.enable(device.microphoneAudioTrack);
      }
    });
  }

  /**
   * 结束监考
   */
  async stop() {
    this.removeRTCEventListener();
    return Promise.all([
      this.disableCamera(),
      this.disableMicrophone(),
      this.disableScreen()
    ]).then(() => {
      this.registeredDevice.clear();
      this.enabledBrowserDetector.forEach(detector => {
        detector.disable();
      });
      this.enabledVideoDetector.forEach((device, detector) => {
        detector.disable();
      });
      this.enabledAudioDetector.forEach((device, detector) => {
        detector.disable();
      });
      this.enabledBrowserDetector = [];
      this.enabledVideoDetector.clear();
      this.enabledAudioDetector.clear();
      return this.rtcClient.leave();
    });
  }

  private async enableCamera() {
    const device = this.registeredDevice.get('camera');
    const isCameraDevice = device instanceof QNCamera;
    if (!isCameraDevice) return;
    await device.start();
    await this.rtcClient.publish(
      device.cameraVideoTrack as QNCameraVideoTrack
    );
  }

  private async disableCamera() {
    const device = this.registeredDevice.get('camera');
    const isCameraDevice = device instanceof QNCamera;
    if (!isCameraDevice) return;
    await device.stop();
    await this.rtcClient.unpublish(
      device.cameraVideoTrack as QNCameraVideoTrack
    );
  }

  private async enableMicrophone() {
    const device = this.registeredDevice.get('microphone');
    const isMicrophoneDevice = device instanceof QNMicrophone;
    if (!isMicrophoneDevice) return;
    await device.start();
    await this.rtcClient.publish(
      device.microphoneAudioTrack as QNMicrophoneAudioTrack
    );
  }

  private async disableMicrophone() {
    const device = this.registeredDevice.get('microphone');
    const isMicrophoneDevice = device instanceof QNMicrophone;
    if (!isMicrophoneDevice) return;
    await device.stop();
    await this.rtcClient.unpublish(
      device.microphoneAudioTrack as QNMicrophoneAudioTrack
    );
  }

  private async enableScreen() {
    const device = this.registeredDevice.get('screen');
    const isScreenDevice = device instanceof QNScreen;
    if (!isScreenDevice) return;
    await device.start();
    await this.rtcClient.publish(
      device.screenVideoTrack as QNScreenVideoTrack
    );
  }

  private async disableScreen() {
    const device = this.registeredDevice.get('screen');
    const isScreenDevice = device instanceof QNScreen;
    if (!isScreenDevice) return;
    await device.stop();
    await this.rtcClient.unpublish(
      device.screenVideoTrack as QNScreenVideoTrack
    );
  }

  /**
   * TODO
   * 用户加入房间
   * @param remoteUserID
   * @param userData
   */
  private userJoined(remoteUserID: string, userData?: string): void {
    const userExtension = parseStringToObject(userData || '');
    log.log('userJoined', remoteUserID, userExtension);
  }

  /**
   * TODO
   * 用户离开房间
   * @param remoteUserID
   * @private
   */
  private userLeft(remoteUserID: string): void {
    log.log('userLeft', remoteUserID);
  }

  /**
   * TODO
   * 用户添加媒体轨
   * @param userID
   * @param tracks
   * @private
   */
  private userPublished(userID: string, tracks: (QNRemoteAudioTrack | QNRemoteVideoTrack)[]) {
    log.log('userPublished', userID, tracks);
    this.rtcClient.subscribe(tracks).then(({
      videoTracks = [],
      audioTracks = []
    }) => {
      this.subscribedTracks = this.subscribedTracks.concat(videoTracks, audioTracks);
    });
  }

  /**
   * TODO
   * 用户移除媒体轨
   * @param userID
   * @param tracks
   * @private
   */
  private userUnpublished(userID: string, tracks: (QNRemoteAudioTrack | QNRemoteVideoTrack)[]) {
    log.log('userUnpublished', userID, tracks);
    this.rtcClient.unsubscribe(tracks).then(() => {
      const subscribedTrackIds = this.subscribedTracks.map(track => track.trackID);
      this.subscribedTracks = this.subscribedTracks.filter(
        track => !subscribedTrackIds.includes(track.trackID)
      );
    });
  }

  /**
   * TODO
   * 连接状态改变
   * @param connectionState
   * @param info
   * @private
   */
  private connectionStateChanged(connectionState: QNConnectionState, info?: QNConnectionDisconnectedInfo) {
    log.log('connectionStateChanged', connectionState, info);
  }
}
