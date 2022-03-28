import { QNCamera, QNMicrophone, QNScreen } from '@/core';

export abstract class QNDevice {
  abstract start(): Promise<unknown>;

  abstract stop(): Promise<unknown>;
}

export type QNInternalDevice = QNCamera | QNMicrophone | QNScreen;

export function isQNCamera(device: QNInternalDevice): device is QNCamera {
  return device instanceof QNCamera;
}

export function isQNMicrophone(device: QNInternalDevice): device is QNMicrophone {
  return device instanceof QNMicrophone;
}

export function isQNScreen(device: QNInternalDevice): device is QNScreen {
  return device instanceof QNScreen;
}
