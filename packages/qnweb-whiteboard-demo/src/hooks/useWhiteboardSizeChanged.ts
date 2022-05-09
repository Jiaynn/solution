import { message } from 'antd';
import { useEffect, useState } from 'react';
import { log } from '../utils';

export type WhiteboardSize = {
  maxHeight?: number;
  maxWidth?: number;
  currentHeight?: number;
  currentWidth?: number;
}

const useWhiteboardSizeChanged = (whiteboardClient: any, showToast?: boolean) => {
  const [whiteboardSize, setWhiteboardSize] = useState<WhiteboardSize>();

  /**
   * 监听白板尺寸
   */
  useEffect(() => {
    function handleWhiteboardSize(event: number, params: WhiteboardSize) {
      if (!whiteboardSize) {
        log('handleWhiteboardSize params', params);
        setWhiteboardSize(params);
      }
    }

    if (whiteboardClient) {
      whiteboardClient.registerEvent(whiteboardClient.controller.Event.WhiteboardSizeChanged, handleWhiteboardSize);
    }
    return () => {
      if (whiteboardClient) {
        whiteboardClient.unregisterEvent(whiteboardClient.controller.Event.WhiteboardSizeChanged, handleWhiteboardSize);
      }
    };
  }, [whiteboardClient, whiteboardSize]);

  /**
   * 提示
   */
  useEffect(() => {
    if (whiteboardSize && showToast) {
      message.info(`当前白板宽：${whiteboardSize.currentWidth}，高：${whiteboardSize.currentHeight}`);
    }
  }, [whiteboardSize, showToast]);

  return {
    whiteboardSize
  };
};

export default useWhiteboardSizeChanged;
