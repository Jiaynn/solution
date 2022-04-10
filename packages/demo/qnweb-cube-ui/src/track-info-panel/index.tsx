import React from 'react';
import classNames from 'classnames';
import { QNLocalAudioTrackStats, QNLocalVideoTrackStats } from 'qnweb-rtc';

import { prefixCls } from '../_utils';

import './index.scss';

export interface TrackInfoPanelProps {
  audioStatus: QNLocalAudioTrackStats | null;
  videoStatus: QNLocalVideoTrackStats | null;
  screenStatus: QNLocalVideoTrackStats | null;
  isMobile: boolean;
}

const rootCls = prefixCls('track-info-panel');

export const TrackInfoPanel: React.FC<TrackInfoPanelProps> = (props) => {
  const { videoStatus, screenStatus, audioStatus, isMobile } = props;
  return <div className={classNames(rootCls, { [`${rootCls}-mobile`]: isMobile })}>
    <div className="content">
      <div className="ctx">
        <div className="label">视频丢包率</div>
        <span className="value">
          {
            videoStatus ?
              Number(videoStatus.uplinkLostRate * 100).toFixed(2) :
              '0.00'
          } %
        </span>
      </div>
      <div className="ctx">
        <div className="label">音频丢包率</div>
        <span
          className="value"
        >
          {
            audioStatus ?
              Number(audioStatus.uplinkLostRate * 100).toFixed(2) :
              '0.00'
          } %
        </span>
      </div>
      <div className="ctx">
        <div className="label">屏幕分享丢包率</div>
        <span
          className="value"
        >
          {
            screenStatus ?
              Number(screenStatus.uplinkLostRate * 100).toFixed(2) :
              '0.00'
          } %
        </span>
      </div>
      <div className="ctx">
        <div className="label">视频实时码率</div>
        <span
          className="value"
        >
          {
            videoStatus ?
              Number(videoStatus.uplinkBitrate / 1000).toFixed(2) :
              '0.00'
          } kbps
        </span>
      </div>
      <div className="ctx">
        <div className="label">音频实时码率</div>
        <span
          className="value"
        >
          {
            audioStatus ?
              Number(audioStatus.uplinkBitrate / 1000).toFixed(2) :
              '0.00'
          } kbps
        </span>
      </div>
      <div className="ctx">
        <div className="label">屏幕分享实时码率</div>
        <span
          className="value"
        >
          {
            screenStatus ?
              Number(screenStatus.uplinkBitrate / 1000).toFixed(2) :
              '0.00'
          } kbps
        </span>
      </div>
    </div>
  </div>;
};
