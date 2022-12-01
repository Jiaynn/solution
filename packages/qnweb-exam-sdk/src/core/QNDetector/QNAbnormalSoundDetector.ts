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
    console.log('TODO: on');
  }

  /**
   * 开启检测
   * @param track
   */
  enable(track: QNLocalAudioTrack | QNRemoteAudioTrack) {
    console.log('TODO: enable', track);
  }

  /**
   * 关闭检测
   */
  disable() {
    console.log('TODO: disable');
  }
}
