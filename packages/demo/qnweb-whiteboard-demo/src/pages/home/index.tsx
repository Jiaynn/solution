import { Button, Input } from 'antd';
import { useCallback, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as eruda from 'eruda';
import QNWhiteboard from 'qnweb-whiteboard';

import { storeContext } from '../../store';
import css from './index.module.scss';

const roomTokens = [
  'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:izA6cPmls835DDCSCJbVCRArGMw=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwMTQ5ODUxLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoiZ28xIiwidXNlcklkIjoiZ291c2VyMSJ9',
  'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:nDJqDjwJTRf2DVORszD4YrHP93M=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwMTQ5ODUxLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoiZ28yIiwidXNlcklkIjoiZ291c2VyMiJ9',
  'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:PfNrk5kl8uq56R45RCz5Ak9H1jE=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwMTQ5ODUxLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoiZ28zIiwidXNlcklkIjoiZ291c2VyMyJ9',
  'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:YGy-O2eDx5gNGQJm4eBDWZdfWdQ=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwMTQ5ODUxLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoiZ280IiwidXNlcklkIjoiZ291c2VyNCJ9',
  'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh:irEEx8TT7A_zG5MmnGI33chWFKk=:eyJhcHBJZCI6ImZsZXFmcTZ5YyIsImV4cGlyZUF0IjoxNzIwMTQ5ODUxLCJwZXJtaXNzaW9uIjoidXNlciIsInJvb21OYW1lIjoiZ281IiwidXNlcklkIjoiZ291c2VyNSJ9'
];

const Home = () => {
  const history = useHistory();
  const [roomToken, setRoomToken] = useState<string>();
  const [roomTitle, setRoomTitle] = useState<string>();
  const { dispatch, state } = useContext(storeContext);

  /**
   * 打开调试
   */
  const openDebug = () => {
    eruda.init();
    dispatch({
      type: 'updateIsDebug',
      payload: true
    });
  };

  /**
   * 点击随机生成 roomToken
   */
  const generateRoomToken = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * roomTokens.length);
    setRoomToken(roomTokens[randomIndex]);
  }, []);

  /**
   * 点击进入房间
   */
  const joinRoom = () => {
    let pushURL = `/room?roomToken=${roomToken}&isDebug=${state.isDebug}`;
    if (roomTitle) pushURL += `&roomTitle=${roomTitle}`;
    history.push(pushURL);
  };

  return <div className={css.container}>
    <h1 onClick={openDebug} className={css.title}>七牛白板 demo 体验</h1>
    <Input
      value={roomToken}
      onChange={e => setRoomToken(e.target.value)}
      placeholder="请输入roomToken"
      style={{ marginBottom: 10 }}
    />
    <Input
      value={roomTitle}
      onChange={e => setRoomTitle(e.target.value)}
      placeholder="请输入房间名"
      style={{ marginBottom: 10 }}
    />
    <Button
      type="primary"
      block
      onClick={joinRoom}
      style={{ marginBottom: 10 }}
    >点击进入房间</Button>
    <Button
      type="primary"
      block
      onClick={generateRoomToken}
    >点击随机生成 roomToken</Button>
    <div className={css.version}>sdk version: {QNWhiteboard.version}</div>
  </div>;
};

export default Home;
