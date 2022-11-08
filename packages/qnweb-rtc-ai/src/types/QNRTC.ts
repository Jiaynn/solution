import { Track } from 'pili-rtc-web';

export interface QNRTCTrack {
  kind: string;
  tag?: string;
  trackID?: string;
  userID?: string;
  _track: Track;
}
