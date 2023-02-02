import { useContext, useEffect, useState } from 'react';
import { storeContext } from '../store';
import { RoomTokenJSON } from '../types';
import { post } from '../utils/request';

const useChatroom = (roomTokenJSON?: RoomTokenJSON | null) => {

  const { state } = useContext(storeContext);
  const [groupId, setGroupId] = useState();

  useEffect(() => {
    const im = state.im;
    if (roomTokenJSON && im) {
      post('/v1/mock/group', {
        group_id: roomTokenJSON.roomName
      }).then(response => {
        setGroupId(response.data.im_group_id);
        return response.data.im_group_id;
      }).then(groupId => {
        im.chatroomManage.join(groupId);
      });
    }
  }, [roomTokenJSON, state.im]);

  useEffect(() => {
    return () => {
      if (groupId && state.im) {
        console.log('离开聊天室');
        state.im.chatroomManage.leave(groupId);
      }
    };
  }, [state.im, groupId]);

  return {
    group_id: groupId
  };
};

export default useChatroom;