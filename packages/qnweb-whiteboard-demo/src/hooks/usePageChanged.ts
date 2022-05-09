import { useEffect } from 'react';
import { log } from '../utils';

const usePageChanged = (whiteboardClient: any) => {
  useEffect(() => {
    function handlerPageChanged(event: number, params: any) {
      log('handlerPageChanged', event, params);
    }

    if (whiteboardClient) {
      whiteboardClient.registerEvent(whiteboardClient.controller.Event.PageChanged, handlerPageChanged);
    }
    return () => {
      if (whiteboardClient) {
        whiteboardClient.unregisterEvent(whiteboardClient.controller.Event.PageChanged, handlerPageChanged);
      }
    }
  }, [whiteboardClient]);
};

export default usePageChanged;
