import { message } from 'antd';
import { useEffect, useState } from 'react';
import { log } from '../utils';

interface WidgetScrollParams {
  scrollToBottom: 0 | 1;
  scrollToTop: 0 | 1;
  widgetId: string
}

const useWidgetScroll = (whiteboardClient: any) => {
  const [widgetScrollParams, setWidgetScrollParams] = useState<WidgetScrollParams>();
  useEffect(() => {
    function handleWidgetScroll(event: number, params: WidgetScrollParams) {
      log('handleWidgetScroll', event, params);
      setWidgetScrollParams(params);
    }

    if (whiteboardClient) {
      whiteboardClient.registerEvent(whiteboardClient.controller.Event.WidgetScroll, handleWidgetScroll);
    }
    return () => {
      if (whiteboardClient) {
        whiteboardClient.unregisterEvent(whiteboardClient.controller.Event.WidgetScroll, handleWidgetScroll);
      }
    };
  }, [whiteboardClient]);

  useEffect(() => {
    if (widgetScrollParams?.scrollToTop === 1) {
      message.info('到顶了~');
    }
    if (widgetScrollParams?.scrollToBottom === 1) {
      message.info('到底了~');
    }
  }, [widgetScrollParams]);

  return widgetScrollParams;
};

export default useWidgetScroll;
