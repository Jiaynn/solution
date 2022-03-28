import { Modal } from 'antd';
import * as eruda from 'eruda';
import { useContext, useEffect, useRef } from 'react';
import { storeContext } from '../store';
import { JoinRoomStatus } from 'qnweb-whiteboard';
import { log } from '../utils';
import { WhiteboardDocument } from './usePageListChanged';

interface Props {
  webassemblyReady: boolean;
  isJoined: boolean;
  roomError?: JoinRoomStatus;
  curDocument?: WhiteboardDocument;
}

const useLoadTime = ({ webassemblyReady, isJoined, roomError, curDocument }: Props) => {
  const startTime = useRef<number | undefined>();
  const webassemblyTimeSpent = useRef<number | undefined>();
  const joinedRoomTimeSpent = useRef<number | undefined>();
  const { dispatch, state } = useContext(storeContext);

  /**
   * 计算加载花费的时间
   */
  function getTimeSpent(): number {
    if (startTime.current) {
      return Date.now() - startTime.current;
    }
    return 0;
  }

  /**
   * 收集初始时间和 debug 信息
   */
  useEffect(() => {
    startTime.current = Date.now();
    const isDebug = JSON.parse(new URLSearchParams(window.location.search).get('isDebug') || '') || false;
    dispatch({
      type: 'updateIsDebug',
      payload: isDebug
    });
    if (isDebug) {
      eruda.init();
    }
  }, [dispatch]);

  /**
   * 计算 webassembly 性能时间
   */
  useEffect(() => {
    if (state.isDebug) {
      if (webassemblyReady) { // webassembly 资源加载花费的时间
        webassemblyTimeSpent.current = getTimeSpent();
        log('webassemblyTimeSpent', webassemblyTimeSpent.current);
      }
    }
  }, [state.isDebug, webassemblyReady]);

  /**
   * 计算加入房间时间
   */
  useEffect(() => {
    if (state.isDebug) {
      if (isJoined) { // 加入房间花费的时间
        joinedRoomTimeSpent.current = getTimeSpent();
        log('joinedRoomTimeSpent', joinedRoomTimeSpent.current);
      } else {
        if (roomError) {
          const webSocketError = [
            JoinRoomStatus.Error,
            JoinRoomStatus.Close
          ].includes(roomError);
          if (webSocketError) { // WebSocket 连接错误
            Modal.error({
              title: 'WebSocket Connect Error',
              content: `WebSocket Connect ${webSocketError}`
            });
          } else { // 请求错误
            Modal.error({
              title: 'error',
              content: JSON.stringify(roomError)
            });
          }
        }
      }
    }
  }, [state.isDebug, isJoined, roomError]);

  /**
   * 弹窗显示加载的时间
   */
  useEffect(() => {
    if (curDocument && state.isDebug) {
      const webassemblyTimeSpentSecond = webassemblyTimeSpent.current || 0;
      const joinedRoomTimeSpentSecond = joinedRoomTimeSpent.current || 0;
      Modal.info({
        title: '性能检测',
        content: <>
          <div>webassembly 资源加载花费了{(webassemblyTimeSpentSecond / 1000).toFixed(2)}秒</div>
          <div>加入房间花费了{(joinedRoomTimeSpentSecond / 1000).toFixed(2)}秒</div>
        </>
      });
    }
  }, [curDocument, state.isDebug]);
};

export default useLoadTime;
