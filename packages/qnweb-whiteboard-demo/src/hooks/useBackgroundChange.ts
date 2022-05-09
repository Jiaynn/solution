import { useEffect } from 'react';
import { WhiteboardDocument } from './usePageListChanged';

const useBackgroundChange = (whiteboardClient: any, curDocument?: WhiteboardDocument) => {
  useEffect(() => {
    function handleBackgroundChange(event: number, params: any) {
      console.log('handleBackgroundChange', params)
    }
    if (curDocument) {
      whiteboardClient.registerEvent(whiteboardClient.controller.Event.BackgroundChange, handleBackgroundChange);
    }
    return () => {
      if (curDocument) {
        whiteboardClient.unregisterEvent(whiteboardClient.controller.Event.BackgroundChange, handleBackgroundChange);
      }
    };
  }, [whiteboardClient, curDocument]);
};

export default useBackgroundChange;