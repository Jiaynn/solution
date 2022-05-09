import { useEffect, useState } from 'react';
import { log } from '../utils';

export interface WhiteboardPage {
  meetingId: string;
  bucketId: string;
  documents: WhiteboardDocument[];
}

export interface WhiteboardDocument {
  documentId: string;
  documentNo: number;
  bgColor: string;
  lastTime: number;
  url: string;
}

const usePageListChanged = (whiteboardClient: any) => {

  const [documents, setDocuments] = useState<WhiteboardDocument[]>([]);

  useEffect(() => {
    /**
     * 页面列表变更，例如有人新建或者删除页面
     * @param event
     * @param params
     */
    function handlePageListChanged(event: number, params: WhiteboardPage[]) {
      const documents = params[0]?.documents || [];
      log('usePageListChanged documents', documents);
      setDocuments(documents);
    }

    if (whiteboardClient) {
      whiteboardClient.registerEvent(whiteboardClient.controller.Event.PageListChanged, handlePageListChanged);
    }
    log('usePageListChanged whiteboardClient', whiteboardClient);
    return () => {
      if (whiteboardClient) {
        whiteboardClient.unregisterEvent(whiteboardClient.controller.Event.PageListChanged, handlePageListChanged);
      }
    };
  }, [whiteboardClient]);

  return {
    documents
  };
};

export default usePageListChanged;
