import { QNCamera, QNMicrophone, QNScreen } from '../../core';

/**
 * 设备
 */
export abstract class QNDevice {
  abstract start(): Promise<unknown>;

  abstract stop(): Promise<unknown>;
}

/**
 * 内置设备
 */
export type QNInternalDevice = QNCamera | QNMicrophone | QNScreen;

/**
 * 是否是摄像头设备
 * @param device
 */
export function isQNCamera(device: QNInternalDevice): device is QNCamera {
  return device instanceof QNCamera;
}

/**
 * 是否是麦克风设备
 * @param device
 */
export function isQNMicrophone(device: QNInternalDevice): device is QNMicrophone {
  return device instanceof QNMicrophone;
}

/**
 * 是否是屏幕共享设备
 * @param device
 */
export function isQNScreen(device: QNInternalDevice): device is QNScreen {
  return device instanceof QNScreen;
}
