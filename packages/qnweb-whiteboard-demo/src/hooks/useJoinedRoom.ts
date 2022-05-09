import { useContext, useEffect, useState } from 'react';
import QNWhiteboard, { JoinRoomCallbackResult, JoinRoomStatus } from 'qnweb-whiteboard';

import { log } from '../utils';
import { storeContext } from '../store';

/**
 * 加入房间
 */
const useJoinedRoom = () => {
  const { state } = useContext(storeContext);
  const [whiteboardClient, setWhiteboardClient] = useState<any>(state.whiteboardClient);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [roomError, setRoomError] = useState<JoinRoomCallbackResult['status']>();
  const [roomToken, setRoomToken] = useState<string | null>(null);

  useEffect(() => {
    function joinRoomCallback(res: JoinRoomCallbackResult) {
      log('joinRoomCallbackRes', res);
      if (res.status === JoinRoomStatus.Open) {
        setIsJoined(true);
      } else {
        setRoomError(res.status);
      }
    }

    if (whiteboardClient) {
      const roomToken = new URLSearchParams(window.location.search).get('roomToken');
      const roomTitle = new URLSearchParams(window.location.search).get('roomTitle');
      log('roomToken', roomToken);
      log('useJoinedRoom whiteboardClient', whiteboardClient);
      setRoomToken(roomToken);
      whiteboardClient.joinRoom(roomToken, joinRoomCallback, {
        title: roomTitle || ''
      });
    } else {
      const qnWhiteboard = new QNWhiteboard();
      setWhiteboardClient(qnWhiteboard);
    }
    return () => {
      if (whiteboardClient) {
        whiteboardClient.leaveRoom();
      }
    };
  }, [whiteboardClient]);

  return {
    whiteboardClient,
    isJoined,
    roomError,
    roomToken,
  };
};

export default useJoinedRoom;
