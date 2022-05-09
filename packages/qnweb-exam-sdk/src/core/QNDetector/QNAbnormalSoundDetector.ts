import { QNLocalAudioTrack, QNRemoteAudioTrack } from 'qnweb-rtc';

import { QNAudioDetector } from './QNDetector';

/**
 * TODO
 * 声音异常检测器
 */
export class QNAbnormalSoundDetector extends QNAudioDetector {
  static create() {
    return new this();
  }

  on() {
  }

  /**
   * 开启检测
   * @param track
   */
  enable(track: QNLocalAudioTrack | QNRemoteAudioTrack) {

  }

  /**
   * 关闭检测
   */
  disable() {

  }
}
