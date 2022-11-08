import { useEffect, useState } from 'react';

export const useRTCListeners = (client: any) => {
  const [remoteTracks, setRemoteTracks] = useState([]);
  useEffect(() => {
    function handleUserPublished(userID, tracks) {
      client.subscribe(tracks).then(() => {
        setRemoteTracks(tracks);
      });
    }

    if (client) {
      client.on('user-published', handleUserPublished);
      // 房间连接状态发生变化
      client.on('connection-state-change', connectionState => {
        console.log('连接状态变化', connectionState);
      });
      // 有用户加入房间
      client.on('user-joined', user => {
      });
      // 有用户离开房间
      client.on('user-left', user => {
      });
      // 有用户取消发布音视频流
      client.on('user-unpublished', (userID, tracks) => {
      });
      // 远端用户正在重连，此时可以做 UI 提示
      client.on('user-reconnecting', user => {
      });
      // 远端用户重连成功，此时可以做 UI 提示
      client.on('user-reconnected', user => {
      });
      // 因不可恢复原因与房间断开连接，此时可以做清空资源，重新加入房间操作
      client.on('disconnected', () => {
      });
    }
    return () => {
      if (client) {

      }
    };
  }, [client]);
  return {
    remoteTracks
  };
};
