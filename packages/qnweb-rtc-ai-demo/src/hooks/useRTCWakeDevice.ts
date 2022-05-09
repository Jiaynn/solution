import { useEffect, useState } from 'react';

/**
 * 采集摄像头和音频设备
 * @param client
 * @param cameraRecordConfig
 */
const useRTCWakeDevice = (client: any, cameraRecordConfig: any) => {
  const [localTracks, setLocalTracks] = useState<any[]>([]);
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

    if (client && cameraRecordConfig) {
      const QNRTC = window.QNRTC.default;
      wakeDevice(QNRTC, facingMode, cameraRecordConfig).then(localTracks => setLocalTracks(localTracks));
    }
  }, [client, facingMode, cameraRecordConfig]);

  return {
    localTracks,
    facingMode,
    setFacingMode
  };
};

export default useRTCWakeDevice;