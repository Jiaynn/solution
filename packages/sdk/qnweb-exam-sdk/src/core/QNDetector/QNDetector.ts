import { QNLocalAudioTrack, QNLocalVideoTrack, QNRemoteAudioTrack, QNRemoteVideoTrack } from 'qnweb-rtc';

export abstract class QNVideoDetector {
  abstract on(callback: Function): void;

  abstract enable(track: QNLocalVideoTrack | QNRemoteVideoTrack): void;

  abstract disable(): void;
}

export abstract class QNAudioDetector {
  abstract on(callback: Function): void;

  abstract enable(track: QNLocalAudioTrack | QNRemoteAudioTrack): void;

  abstract disable(): void;
}

export abstract class QNBrowserDetector {
  abstract on(callback: Function): void;

  abstract enable(): void;

  abstract disable(): void;
}

export type QNDetector = QNAudioDetector | QNVideoDetector | QNBrowserDetector;

export function isQNVideoDetector(detector: QNDetector): detector is QNVideoDetector {
  return detector instanceof QNVideoDetector;
}

export function isQNAudioDetector(detector: QNDetector): detector is QNAudioDetector {
  return detector instanceof QNAudioDetector;
}

export function isQNBrowserDetector(detector: QNDetector): detector is QNBrowserDetector {
  return detector instanceof QNBrowserDetector;
}
