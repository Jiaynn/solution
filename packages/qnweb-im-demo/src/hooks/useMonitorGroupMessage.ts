import { useContext, useEffect, useState } from 'react';
import { storeContext } from '../store';

const useMonitorGroupMessage = (group_id?: number) => {
  const [messages, setMessages] = useState<any[]>([]);
  const { state } = useContext(storeContext);

  /**
   * 监听群消息
   */
  useEffect(() => {
    const im = state.im;

    /**
     * 处理监听到的消息变化的事件
     * @param message
     */
    function handleGroupMessage(message: any) {
      console.log('message', JSON.stringify(message));
      setMessages(prevMessages => prevMessages.concat(message));
    }

    if (im && group_id) {
      im.on('onGroupMessage', handleGroupMessage);
    }
    return () => {
      if (im && group_id) {
        im.off('onGroupMessage', handleGroupMessage);
      }
    };
  }, [state, group_id]);

  return {
    messages
  };
};

export default useMonitorGroupMessage;