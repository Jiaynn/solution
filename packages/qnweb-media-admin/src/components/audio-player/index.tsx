import React, { CSSProperties, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Icon, {
  PauseOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import { Slider } from 'antd';

import { formatDuration } from '@/components';
import { IconVolume, IconPlaying } from './icon';

import './index.scss';

export interface AudioPlayerProps {
  /**
   * className
   */
  className?: string;
  /**
   * style
   */
  style?: CSSProperties;
  /**
   * 当前时间，单位毫秒(ms)
   */
  currentTime?: number;
  /**
   * 总时长，单位毫秒(ms)
   */
  duration?: number;
  /**
   * 音频文件url
   */
  url: string;
  /**
   * 音量
   */
  volume?: number;
  /**
   * 是否是播放中
   */
  isPlaying?: boolean;
  /**
   * 播放/暂停切换
   * @param isPlaying
   */
  onPlay?: (isPlaying: boolean) => void;
  /**
   * 音量改变
   * @param volume
   */
  onVolumeChange?: (volume: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = (props) => {
  const {
    className, style,
    currentTime = 0, duration = 0, url, volume, isPlaying,
    onPlay, onVolumeChange
  } = props;
  const wavesurferRef = useRef<WaveSurfer>();

  /**
   * 实例化wavesurfer
   */
  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#666666',
      progressColor: '#00AAE7',
      cursorColor: '#00AAE7',
      cursorWidth: 4,
      height: 180,
      backgroundColor: '#F1F2F3'
    });
    wavesurfer.load(url);
    wavesurferRef.current = wavesurfer;
    return () => {
      wavesurfer.destroy();
    };
  }, [url]);

  /**
   * 根据isPlaying控制动画
   */
  useEffect(() => {
    const iconPlayingSvg = document.querySelector('.icon-playing')?.querySelector('svg');
    if (!iconPlayingSvg) return;
    if (isPlaying) {
      iconPlayingSvg.unpauseAnimations();
    } else {
      iconPlayingSvg.pauseAnimations();
    }
  }, [isPlaying]);

  return <div className={classNames('audio-player', className)} style={style}>
    <div className="player">
      <Icon
        className="icon icon-playing"
        component={IconPlaying}
      />

      <div className="player-tool">
        {
          isPlaying ? <PauseOutlined className="icon" onClick={() => onPlay?.(false)}/> :
            <PlayCircleOutlined className="icon" onClick={() => onPlay?.(true)}/>
        }
        <div className="volume">
          <div
            className="volume-pillars"
          >
            <Slider
              className="volume-slider"
              vertical={true}
              value={volume}
              onChange={onVolumeChange}
            />
          </div>
          <Icon
            className="icon icon-volume"
            component={IconVolume}
          />
        </div>
      </div>
    </div>
    <div className="wave" id="waveform">
      <div className="time">{formatDuration(currentTime)}/{formatDuration(duration)}</div>
    </div>
  </div>;
};
