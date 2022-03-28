import { useEffect, useState } from 'react';

const useWebassemblyReady = (whiteboardClient: any) => {
  const [webassemblyReady, setWebassemblyReady] = useState(false);

  useEffect(() => {
    /**
     * Webassembly 资源加载完成
     * @param event
     * @param params
     */
    function handleWebassemblyReady(event: number, params: boolean) {
      console.log('processEvent handleWebassemblyReady event', event);
      console.log('processEvent handleWebassemblyReady params', JSON.stringify(params, null, 2));
      setWebassemblyReady(params);
    }

    if (whiteboardClient) {
      whiteboardClient.registerEvent(whiteboardClient.controller.Event.WebassemblyReady, handleWebassemblyReady);
    }
    return () => {
      if (whiteboardClient) {
        whiteboardClient.unregisterEvent(whiteboardClient.controller.Event.WebassemblyReady, handleWebassemblyReady);
      }
    };
  }, [whiteboardClient]);

  return {
    webassemblyReady
  };
};

export default useWebassemblyReady;