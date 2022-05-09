import { useEffect, useState } from 'react';
import { log } from '../utils';

export interface ActiveWidget {
  isDelete: boolean;
  md5: string;
  name: string;
  objectName: string;
  pageCount: number;
  pageNo: number;
  path: string;
  resourceId: string;
  type: number; // 0-文档；1-文件；2-图片；3-图形；4-未知；5-选择；6-svg；7-文字
  userId: string;
  widgetId: string;
}

const useWidgetActivity = (whiteboardClient: any) => {

  const [activeWidget, setActiveWidget] = useState<ActiveWidget>();

  useEffect(() => {
    function handleWidgetActivity(event: number, params: ActiveWidget) {
      log('handleWidgetActivity params', params);
      if ([1, 2].includes(params.type)) {
        setActiveWidget(params);
      }
    }

    if (whiteboardClient) {
      whiteboardClient.registerEvent(whiteboardClient.controller.Event.WidgetActivity, handleWidgetActivity);
    }
    return () => {
      if (whiteboardClient) {
        whiteboardClient.unregisterEvent(whiteboardClient.controller.Event.WidgetActivity, handleWidgetActivity);
      }
    };
  }, [whiteboardClient]);

  return {
    activeWidget,
    setActiveWidget
  };
};

export default useWidgetActivity;
