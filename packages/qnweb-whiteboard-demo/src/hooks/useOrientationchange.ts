import { useEffect, useState } from 'react';
import { log } from '../utils';

/**
 * 监听屏幕转动
 */
const useOrientationchange = (whiteboardClient: any) => {
  const [orientationAngle, setOrientationAngle] = useState<number>();
  const [direction, setDirection] = useState();
  /**
   * 设置监听屏幕旋转事件
   */
  useEffect(() => {
    function handleOrientationchange() {
      log('handleOrientationchange');
      setOrientationAngle(window.screen.orientation.angle);
    }

    window.addEventListener('orientationchange', handleOrientationchange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationchange);
    };
  }, []);

  /**
   * 屏幕旋转后修改 direction
   */
  useEffect(() => {
    if (orientationAngle) {
      const mapDirection = {
        0: 'vertical',
        90: 'horizontal',
        '-90': 'horizontal'
      };
      // @ts-ignore
      setDirection(mapDirection[orientationAngle] || 'vertical');
    }
  }, [orientationAngle]);

  /**
   * 屏幕旋转适配
   */
  useEffect(() => {
    if (whiteboardClient && direction) {
      // whiteboardClient.setCanvasStyle();
    }
  }, [whiteboardClient, direction]);

  return {
    orientationAngle,
    direction
  };
};

export default useOrientationchange;
