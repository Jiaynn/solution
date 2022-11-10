import { useEffect, useState } from 'react';

/**
 * 采集摄像头和音频设备
 * @param client
 * @param cameraRecordConfig
 */
export const useRTCWakeDevice = (client: any, cameraRecordConfig: any) => {
  const [localTracks, setLocalTracks] = useState<any[]>([]);
  const [localCameraTrack, setLocalCameraTrack] = useState(null);
  const [localMicrophoneTrack, setLocalMicrophoneTrack] = useState(null);
  const [facingMode, setFacingMode] = useState<string>('environment');

  useEffect(() => {
    /**
     * 采集设备
     */
    async function wakeDevice(QNRTC: any, facingMode: string, cameraRecordConfig: any) {
      const localTracks = [];
      const cameraTrack = await QNRTC.createCameraVideoTrack({
        tag: 'camera',
        facingMode,
        ...cameraRecordConfig
      });
      const microphoneTrack = await QNRTC.createMicrophoneAudioTrack({ tag: 'microphone' });
      localTracks.push(cameraTrack, microphoneTrack);
      return localTracks;
    }

    if (cameraRecordConfig) {
      wakeDevice(QNRTC.default, facingMode, cameraRecordConfig).then(localTracks => setLocalTracks(localTracks));
    }
  }, [facingMode, cameraRecordConfig]);

  useEffect(() => {
    setLocalCameraTrack(localTracks.find(track => track.tag === 'camera'));
    setLocalMicrophoneTrack(localTracks.find(track => track.tag === 'microphone'));
  }, [localTracks]);

  return {
    localTracks,
    facingMode,
    setFacingMode,
    localCameraTrack,
    localMicrophoneTrack
  };
};
