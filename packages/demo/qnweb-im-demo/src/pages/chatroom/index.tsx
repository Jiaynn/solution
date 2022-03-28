import React, { useEffect, useRef, useState } from 'react';
import ChatroomMessageBox from '../../components/ChatroomMessageBox';
import ChatroomMessageInput from '../../components/ChatroomMessageInput';
import useChatroom from '../../hooks/useChatroom';
import useMonitorGroupMessage from '../../hooks/useMonitorGroupMessage';
import { RoomTokenJSON } from '../../types';
import { parseRoomToken } from '../../utils/token';
import css from './index.module.scss';

const Chatroom = () => {
  const [roomTokenJSON, setRoomTokenJSON] = useState<RoomTokenJSON | null>(null);
  const { group_id } = useChatroom(roomTokenJSON);
  const { messages } = useMonitorGroupMessage(group_id);

  /**
   * 解析 roomToken
   */
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const roomToken = query.get('roomToken');
    const roomTokenJSON = parseRoomToken(roomToken);
    setRoomTokenJSON(roomTokenJSON);
  }, []);

  return <div className={css.chatroom}>
    <ChatroomMessageBox messages={messages} />
    <ChatroomMessageInput groupId={group_id} />
  </div>;
};

export default Chatroom;