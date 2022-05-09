import { useEffect, useState } from 'react';

/**
 * 加入 RTC 房间
 * @param roomToken
 */
const useRTCJoinRoom = (roomToken: string) => {
  const [isRTCRoomJoined, setIsRTCRoomJoined] = useState(false);
  const [RTCClient, setRTCClient] = useState<any>();
  const [RTCRoomUsers, setRTCRoomUsers] = useState<any[]>([]);
  useEffect(() => {
    const QNRTC = window.QNRTC.default;
    if (roomToken) { // 判断是否有 roomToken
      if (RTCClient) {
        RTCClient.join(roomToken).then((users: any[]) => {
          setRTCRoomUsers(users);
          setIsRTCRoomJoined(true);
        });
      } else {
        setRTCClient(QNRTC.createClient());
      }
    }
  }, [roomToken, RTCClient]);

  return {
    isRTCRoomJoined,
    RTCRoomUsers,
    RTCClient
  };
};

export default useRTCJoinRoom;