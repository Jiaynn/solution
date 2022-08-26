import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Modal } from 'antd';

import { ServerApi } from '@/api';
import {
  IconBegin,
  IconJoin,
  JoinRoomFormData,
  JoinRoomModal,
  QuickStartFormData,
  QuickStartModal,
} from '@/components';

import styles from './index.module.scss';

const MAIN_VERSION = mainVersion;

const Home: React.FC = () => {
  const history = useHistory();

  const [quickStartVisible, setQuickStartVisible] = useState(false);
  const [joinVisible, setJoinVisible] = useState(false);
  const [joinRoomFormData, setJoinRoomFromData] = useState<JoinRoomFormData>();

  /**
   * 跳转到房间页
   * @param params
   */
  const onJoin = (
    params: JoinRoomFormData
  ) => {
    const query = Object.entries(params).map(([key, value]) => {
      return `${key}=${value}`;
    }).join('&');
    history.push(`/room?${query}`);
  };

  /**
   * 快速开始
   * 提交表单
   * @param value
   */
  const onFinish = (value: QuickStartFormData) => {
    ServerApi.createMeeting({
      type: Number(value.type),
      aspectRatio: value.aspectRatio,
      url: value.url || '',
      zoomScale: value.zoomScale,
      userIds: [value.userId]
    }).then(result => {
      onJoin({
        appId: result.data.appId,
        meetingId: result.data.meetingId,
        userId: value.userId,
        token: (result.data.userTokens || {})[value.userId],
        bucketId: result.data.bucketId,
      });
    }).catch(error => {
      Modal.error({
        title: '创建房间失败',
        content: error.message
      });
    });
  };

  return <div className={styles.container}>
    <QuickStartModal
      visible={quickStartVisible}
      onFinish={onFinish}
      onCancel={() => setQuickStartVisible(false)}
    />

    <JoinRoomModal
      visible={joinVisible}
      onCancel={() => setJoinVisible(false)}
      data={joinRoomFormData}
      onChange={result => setJoinRoomFromData(result)}
      onOk={() => onJoin(joinRoomFormData || {})}
    />

    <div className={styles.box}>
      <h1 className={styles.title}>七牛白板Demo体验{MAIN_VERSION}</h1>
      <div className={styles.buttons}>
        <div className={styles.button} onClick={() => setJoinVisible(true)}>
          <IconJoin className={styles.buttonIcon}/>
          <div className={styles.buttonText}>加入房间</div>
        </div>
        <div className={styles.button} onClick={() => setQuickStartVisible(true)}>
          <IconBegin className={styles.buttonIcon}/>
          <div className={styles.buttonText}>快速开始</div>
        </div>
      </div>
    </div>
  </div>;
};

export default Home;
