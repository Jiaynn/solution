import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Icon, {
  PauseOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import { Modal, Slider, Spin } from 'antd';

import { formatDuration } from '@/components/_utils';
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
   * 音频文件url
   */
  url?: string;
}

const prefixCls = 'audio-player';

const ms = 1000;

export const AudioPlayer: React.FC<AudioPlayerProps> = (props) => {
  const {
    className, style,
    url,
  } = props;
  const iconPlayingAnimationRef = useRef<HTMLSpanElement>(null);
  const playingSvgRef = useRef<SVGElementTagNameMap['svg'] | null>();
  const wavesurferRef = useRef<WaveSurfer | null>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0); // 0-100
  const [currentTime, setCurrentTime] = useState(0); // 秒(ms)
  const [duration, setDuration] = useState(1); // 秒(ms)
  const [loading, setLoading] = useState(false);

  /**
   * 获取动画的svg元素
   */
  useEffect(() => {
    playingSvgRef.current = iconPlayingAnimationRef.current?.querySelector<'svg'>('svg');
    playingSvgRef.current?.pauseAnimations();
  }, []);

  /**
   * 实例化wavesurfer
   */
  useEffect(() => {
    if (!url) return;
    // http://wavesurfer-js.org/docs/events.html
    const handleReady = () => {
      setVolume(wavesurfer.getVolume() * 100);
      setDuration(wavesurfer.getDuration());
      setCurrentTime(wavesurfer.getCurrentTime());
    };
    const handleAudioprocess = (value: number) => {
      setCurrentTime(value);
    };
    const handlePause = () => {
      if (!playingSvgRef.current) return;
      playingSvgRef.current.pauseAnimations();
      setIsPlaying(false);
    };
    const handlePlay = () => {
      if (!playingSvgRef.current) return;
      playingSvgRef.current.unpauseAnimations();
      setIsPlaying(true);
    };
    const handleError = (error: string | Error) => {
      Modal.error({
        title: '音频播放失败',
        content: error instanceof Error ? error.message : error,
      });
    };
    /**
     * 进度
     * @param value 0-100
     */
    const handleLoading = (value: number) => {
      setLoading(value < 100);
    };
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
    wavesurfer.on('ready', handleReady);
    wavesurfer.on('audioprocess', handleAudioprocess);
    wavesurfer.on('pause', handlePause);
    wavesurfer.on('play', handlePlay);
    wavesurfer.on('error', handleError);
    wavesurfer.on('loading', handleLoading);
    wavesurferRef.current = wavesurfer;
    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, [url]);

  /**
   * 播放
   */
  const onPlay = () => {
    wavesurferRef.current?.play();
  };

  /**
   * 暂停
   */
  const onPause = () => {
    wavesurferRef.current?.pause();
  };

  /**
   * 音量调节
   * @param value
   */
  const onVolumeChange = (value: number) => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.setVolume(value / 100);
    setVolume(value);
  };

  return <Spin spinning={loading}>
    <div className={classNames(prefixCls, className)} style={style}>
      <div className={`${prefixCls}-player`}>
        <Icon
          className={`${prefixCls}-icon ${prefixCls}-icon-play-animation`}
          component={IconPlaying}
          ref={iconPlayingAnimationRef}
        />

        <div className={`${prefixCls}-player-tool`}>
          {
            isPlaying ? <PauseOutlined className={`${prefixCls}-icon`} onClick={onPause}/> :
              <PlayCircleOutlined className={`${prefixCls}-icon`} onClick={onPlay}/>
          }
          <div className={`${prefixCls}-player-tool-volume`}>
            <div className={`${prefixCls}-player-tool-volume-pillars`}>
              <Slider
                className={`${prefixCls}-player-tool-volume-slider`}
                vertical={true}
                value={volume}
                onChange={onVolumeChange}
              />
            </div>
            <Icon
              className={`${prefixCls}-icon ${prefixCls}-icon-volume`}
              component={IconVolume}
            />
          </div>
        </div>
      </div>
      <div className={`${prefixCls}-wave`} id="waveform">
        <div className={`${prefixCls}-wave-time`}>
          {formatDuration(currentTime * ms)}/{formatDuration(duration * ms)}
        </div>
      </div>
    </div>
  </Spin>;
};
