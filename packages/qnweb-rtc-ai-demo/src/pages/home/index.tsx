import { Button, Input } from 'antd';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as eruda from 'eruda';
import css from './index.module.scss';

const roomTokens = [
  'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:izA6cPmls835DDCSCJbVCRArGMw=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwMTQ5ODUxLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoiZ28xIiwidXNlcklkIjoiZ291c2VyMSJ9',
  'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:nDJqDjwJTRf2DVORszD4YrHP93M=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwMTQ5ODUxLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoiZ28yIiwidXNlcklkIjoiZ291c2VyMiJ9',
  'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:PfNrk5kl8uq56R45RCz5Ak9H1jE=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwMTQ5ODUxLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoiZ28zIiwidXNlcklkIjoiZ291c2VyMyJ9',
  'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:YGy-O2eDx5gNGQJm4eBDWZdfWdQ=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwMTQ5ODUxLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoiZ280IiwidXNlcklkIjoiZ291c2VyNCJ9',
  'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:irEEx8TT7A_zG5MmnGI33chWFKk=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwMTQ5ODUxLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoiZ281IiwidXNlcklkIjoiZ291c2VyNSJ9'
];

const Home = () => {
  const [roomToken, setRoomToken] = useState<string>();
  const history = useHistory();
  const [isDebug, setIsDebug] = useState<boolean>(false);

  /**
   * 点击随机生成 roomToken
   */
  const generateRoomToken = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * roomTokens.length);
    setRoomToken(roomTokens[randomIndex]);
  }, []);

  /**
   * 加入房间
   */
  const joinRoom = useCallback(() => {
    const pushURL = `/room?roomToken=${roomToken}&isDebug=${isDebug}`;
    history.push(pushURL);
  }, [history, roomToken, isDebug]);

  /**
   * 开始 eruda debug 调试
   */
  const onOpenDebug = () => {
    setIsDebug(true);
    eruda.init();
  };

  return <div className={css.container}>
    <h1 className={css.title} onClick={onOpenDebug}>七牛 RTC-AI demo 体验</h1>
    <Input
      value={roomToken}
      onChange={e => setRoomToken(e.target.value)}
      placeholder='请输入roomToken'
      style={{ marginBottom: 10 }}
    />
    <Button
      type='primary'
      block
      style={{ marginBottom: 10 }}
      onClick={joinRoom}
    >点击进入房间</Button>
    <Button
      type='primary'
      block
      onClick={generateRoomToken}
    >点击随机生成 roomToken</Button>
    <div style={{ marginTop: 10 }} className={css.version}>Demo version: {__VERSION__}</div>
    <div className={css.version}>SDK version: {QNRTCAI.version}</div>
    <div className={css.version}>RTC version: {window.QNRTC.version}</div>
  </div>;
};

export default Home;