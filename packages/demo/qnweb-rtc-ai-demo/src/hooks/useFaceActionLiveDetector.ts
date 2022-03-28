import { useEffect, useRef, useState } from 'react';

const useFaceActionLiveDetector = () => {
  const defaultCountdown = 3;
  const mapFaceActionLiveDetectorText = {
    nod: '点头',
    shake: '摇头',
    blink: '眨眼',
    mouth: '张嘴'
  };
  const [countdown, setCountdown] = useState<number>(defaultCountdown);
  const [faceActionLiveDetectorType, setFaceActionLiveDetectorType] = useState<string>('');
  const faceActionLiveDetectorTimer = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (faceActionLiveDetectorType) {
      faceActionLiveDetectorTimer.current = setInterval(() => {
        setCountdown(countdown => countdown - 1);
      }, 1000);
    } else {
      if (faceActionLiveDetectorTimer.current) {
        clearTimeout(faceActionLiveDetectorTimer.current);
      }
    }
    return () => {
      if (faceActionLiveDetectorTimer.current) {
        clearTimeout(faceActionLiveDetectorTimer.current);
      }
    };
  }, [faceActionLiveDetectorType]);

  useEffect(() => {
    if (countdown <= 0) {
      clearInterval(faceActionLiveDetectorTimer.current);
      setFaceActionLiveDetectorType('');
      setCountdown(defaultCountdown);
    }
  }, [countdown]);

  return {
    countdown,
    defaultCountdown,
    setFaceActionLiveDetectorType,
    faceActionLiveDetectorType,
    faceActionLiveDetectorText: mapFaceActionLiveDetectorText[faceActionLiveDetectorType]
  };
};

export default useFaceActionLiveDetector;