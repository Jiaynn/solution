import React, { useState } from 'react';
import { Button, Input } from 'antd';
import { useHistory } from 'react-router-dom';
import QNWhiteBoard from 'qnweb-whiteboard';

import { MockResult } from '../../api';

import styles from './index.module.scss';

const Home: React.FC = () => {
  const history = useHistory();

  const [appId, setAppId] = useState<string>(MockResult.appId);
  const [meetingId, setMeetingId] = useState<string>(MockResult.meetingId);
  const [userId, setUserId] = useState<string>(MockResult.userId);
  const [token, setToken] = useState<string>(MockResult.token);
  const [bucketId, setBucketId] = useState<string>(MockResult.bucketId);
  const [recordId, setRecordId] = useState<string>(MockResult.recordId);

  const onJoin = () => {
    history.push(`/room?appId=${appId}&meetingId=${meetingId}&userId=${userId}&token=${token}&bucketId=${bucketId}&recordId=${recordId}`);
  };

  return <div className={styles.container}>
    <div className={styles.box}>
      <h1 className={styles.title}>七牛白板Demo体验{QNWhiteBoard.version}</h1>
      <div className={styles.context}>
        <div className={styles.label}>appId：</div>
        <Input
          className={styles.input}
          placeholder="请输入appId"
          value={appId}
          onChange={event => setAppId(event.target.value)}
        />
      </div>
      <div className={styles.context}>
        <div className={styles.label}>meetingId：</div>
        <Input
          className={styles.input}
          placeholder="请输入meetingId"
          value={meetingId}
          onChange={event => setMeetingId(event.target.value)}
        />
      </div>
      <div className={styles.context}>
        <div className={styles.label}>userId：</div>
        <Input
          className={styles.input}
          placeholder="请输入userId"
          value={userId}
          onChange={event => setUserId(event.target.value)}
        />
      </div>
      <div className={styles.context}>
        <div className={styles.label}>token：</div>
        <Input
          className={styles.input}
          placeholder="请输入token"
          value={token}
          onChange={event => setToken(event.target.value)}
        />
      </div>
      <div className={styles.context}>
        <div className={styles.label}>bucketId：</div>
        <Input
          className={styles.input}
          placeholder="请输入bucketId"
          value={bucketId}
          onChange={event => setBucketId(event.target.value)}
        />
      </div>
      <div className={styles.context}>
        <div className={styles.label}>recordId：</div>
        <Input
          className={styles.input}
          placeholder="请输入recordId"
          value={recordId}
          onChange={event => setRecordId(event.target.value)}
        />
      </div>
      <Button
        className={styles.button}
        type="primary"
        block
        onClick={onJoin}
      >加入房间</Button>
    </div>
  </div>;
};

export default Home;
