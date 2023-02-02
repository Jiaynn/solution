import { Button, Input, Modal } from 'antd';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import css from './index.module.scss';

const Home = () => {
  const [roomToken, setRoomToken] = useState<string>();
  const history = useHistory();
  /**
   * 随机生成 roomToken
   */
  const onGenerateRoomToken = () => {
    window.open('https://portal.qiniu.com/rtn/app')
  };

  /**
   * 点击进入房间
   */
  const onJoinRoomBtn = () => {
    if (!roomToken) {
      return Modal.warning({
        title: '提示',
        content: '请输入roomToken'
      });
    }
    history.push(`/chatroom?roomToken=${roomToken}`);
  };
  return <div className={css.home}>
    <div className={css.card}>
      <Input
        value={roomToken}
        onChange={event => setRoomToken(event.target.value)}
        placeholder='请输入roomToken'
        style={{ marginBottom: 10 }}
      />
      <Button
        type='primary'
        block
        style={{ marginBottom: 10 }}
        onClick={onJoinRoomBtn}
      >点击进入房间</Button>
      <Button
        type='primary'
        block
        onClick={onGenerateRoomToken}
      >点击前往生成token</Button>
    </div>
  </div>;
};

export default Home;