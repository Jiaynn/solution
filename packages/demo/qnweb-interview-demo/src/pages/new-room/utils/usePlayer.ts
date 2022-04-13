import React, { useEffect, useMemo, useState } from 'react';
import { MicSeatListener, MutableTrackRoomSeat, ScreenMicSeatListener } from 'qnweb-high-level-rtc';
import { useRoomStore } from '@/store';

interface Player {
  uid: string,
  type: 'screen' | 'camera',
  isOpen: boolean,
}

export const usePlayer = (): {
  playerQueue: Player[],
  setPlayerQueue: React.Dispatch<React.SetStateAction<Player[]>>,
} => {
  const { state: roomStoreState } = useRoomStore();
  const roomClient = useMemo(() => roomStoreState.roomClient, [roomStoreState.roomClient]);
  const screenShareClient = useMemo(() => roomStoreState.roomClient?.screenTrackTool, [roomStoreState.roomClient?.screenTrackTool]);

  const [playerQueue, setPlayerQueue] = useState<Player[]>([]);

  /**
   * 麦位监听
   */
  useEffect(() => {
    const listener: MicSeatListener<MutableTrackRoomSeat> = {
      onUserSitUp: (seat) => {
        console.log(`订阅成功 listener onUserSitUp`, seat);
        setPlayerQueue(prevState => prevState.filter(
          item => !(item.uid === seat.uid && item.type === 'camera')
        ));
      },
      onUserSitDown: (seat) => {
        console.log(`订阅成功 listener onUserSitDown`, seat);
        setPlayerQueue(prevState => {
          return [{
            uid: seat.uid,
            type: 'camera',
            isOpen: false,
          }, ...prevState];
        });
      },
      onCameraStatusChanged: (seat) => {
        console.log(`订阅成功 listener onCameraStatusChanged`, seat);
        setPlayerQueue(prevState => prevState.map(item => {
          return seat.uid === item.uid && item.type === 'camera' ? {
            ...item,
            isOpen: seat.isOwnerOpenVideo
          } : item;
        }));
      },
      onMicrophoneStatusChanged: (seat) => {
        console.log(`订阅成功 listener onMicrophoneStatusChanged`, seat);
      },
    };
    if (roomClient) {
      roomClient.addMicSeatListener(listener);
      return () => {
        roomClient.removeMicSeatListener(
          listener
        );
      };
    }
  }, [roomClient]);

  /**
   * 屏幕共享监听
   */
  useEffect(() => {
    const listener: ScreenMicSeatListener = {
      onScreenMicSeatAdd: (seat) => {
        console.log(`listener onScreenMicSeatAdd`, seat);
        if (!seat.isMySeat) {
          setPlayerQueue(prevState => {
            return [{
              uid: seat.uid,
              type: 'screen',
              isOpen: true,
            }, ...prevState];
          });
        }
      },
      onScreenMicSeatRemove(seat) {
        console.log(`listener onScreenMicSeatRemove`, seat);
        setPlayerQueue(prevState => prevState.filter(
          item => !(item.uid === seat.uid && item.type === 'screen')
        ));
      }
    };
    if (screenShareClient) {
      screenShareClient.addScreenMicSeatListener(listener);
      return () => {
        screenShareClient.removeScreenMicSeatListener(
          listener
        );
      };
    }
  }, [screenShareClient]);

  return {
    playerQueue,
    setPlayerQueue,
  };
};
