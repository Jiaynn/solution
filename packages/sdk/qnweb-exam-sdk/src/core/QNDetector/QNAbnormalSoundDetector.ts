import { QNLocalAudioTrack, QNRemoteAudioTrack } from 'qnweb-rtc';

import { QNAudioDetector } from './QNDetector';

/**
 * 声音异常检测器
 */
export class QNAbnormalSoundDetector extends QNAudioDetector {
  static create() {
    return new this();
  }

  on() {
  }

  enable(track: QNLocalAudioTrack | QNRemoteAudioTrack) {

  }

  disable() {

  }
}
