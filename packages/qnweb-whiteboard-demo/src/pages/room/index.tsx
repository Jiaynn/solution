import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, InputRef, message, Modal, Switch } from 'antd';
import QNWhiteBoard, { QNCreateInstanceResult } from 'qnweb-whiteboard';
import { useUnmount } from 'ahooks';

import { Toolbar, ToolbarProps, RedoUndo } from '@/components';
import { getRouteQuery } from '@/utils';

import styles from './index.module.scss';

const gestureMap = { 1: 3, 2: 2, 3: 4, 4: 5 };
const geometryMap = { 1: 6, 2: 1, 3: 0, 4: 3 };

const Room: React.FC = () => {
  const queryRef = useRef({
    appId: getRouteQuery('appId'),
    meetingId: getRouteQuery('meetingId'),
    userId: getRouteQuery('userId'),
    token: getRouteQuery('token'),
    bucketId: getRouteQuery('bucketId'),
    recordId: getRouteQuery('recordId'),
  });

  const [client, setClient] = useState<QNWhiteBoard | null>();
  const [instance, setInstance] = useState<QNCreateInstanceResult | null>();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<ToolbarProps['mode']>();
  const [toolPenPencilValue, setToolPenPencilValue] = useState<ToolbarProps['toolPenPencilValue']>({
    size: 10
  });
  const [toolPenMarkValue, setToolPenMarkValue] = useState<ToolbarProps['toolPenMarkValue']>({
    size: 10
  });
  const [toolGestureValue, setToolGestureValue] = useState<ToolbarProps['toolGestureValue']>();
  const [toolRubberValue, setToolRubberValue] = useState<ToolbarProps['toolRubberValue']>();
  const [toolGeometryValue, setToolGeometryValue] = useState<ToolbarProps['toolGeometryValue']>();
  const [pdfChecked, setPDFChecked] = useState(false);

  const seekEleRef = useRef<InputRef>(null);
  const calibrateEleRef = useRef<InputRef>(null);

  /**
   * 注册白板事件回调
   * @param instance
   */
  const registerWhiteBoardEvent = (instance: QNCreateInstanceResult) => {
    instance.registerWhiteBoardEvent({
      onWhiteBoardOpened: () => {
        console.log('白板已打开');
        message.success('白板打开成功');
      },
      onWhiteBoardOpenFailed: () => {
        console.log('白板打开失败');
        message.error('白板打开失败');
      },
      onWhiteBoardClosed: () => console.log('白板已关闭'),
    });
  };

  /**
   * 注册PPT文件事件回调
   * @param instance
   */
  const registerPPTEvent = (instance: QNCreateInstanceResult) => {
    instance.registerPPTEvent({
      onFileLoadedSuccessful: () => {
        console.log('onFileLoadedSuccessful');
      },
      onFileLoadingFailed: () => {
        console.log('onFileLoadingFailed');
      },
      onFileStateChanged: (data) => {
        console.log('onFileStateChanged', data);
      },
    });
  };

  /**
   * 注册PDF文件事件回调
   * @param instance
   */
  const registerPDFEvent = (instance: QNCreateInstanceResult) => {
    instance.registerPDFEvent({
      onFileLoadedSuccessful: () => {
        console.log('onFileLoadedSuccessful');
      },
      onFileLoadingFailed: (code) => {
        console.log('onFileLoadingFailed', code);
      },
      onFileStateChanged: (data) => {
        console.log('onFileStateChanged', data);
      },
    });
  };

  /**
   * 注册回放事件回调
   * @param instance
   */
  const registerPlaybackEvent = (instance: QNCreateInstanceResult) => {
    instance.registerPlaybackEvent({
      onInitFinished: (totalTime) => console.log('onInitFinished', totalTime),
      onError: (code) => console.log('onError', code),
      onStatusChanged: (status) => console.log('onStatusChanged', status),
      onProgress: (data) => console.log('onProgress', data),
      onBoardSizeChanged: (size) => console.log('onBoardSizeChanged', size),
      onFileLoadingFailed: (error) => console.log(error)
    });
  };

  /**
   * 注册房间事件回调
   * @param client
   */
  const registerRoomEvent = (client: QNWhiteBoard) => {
    client.registerRoomEvent({
      onJoinSuccess: () => {
        message.destroy('joinRoom');
        message.success('加入房间成功');
      },
      onJoinFailed: () => {
        message.destroy('joinRoom');
        message.error('加入房间失败');
      },
      onRoomStatusChanged: (code) => console.log('onRoomStatusChanged', code),
      onUserJoin: () => console.log('onUserJoin'),
      onUserLeave: () => console.log('onUserLeave'),
      webAssemblyOnReady: () => {
        client.joinRoom(
          queryRef.current.appId,
          queryRef.current.meetingId,
          queryRef.current.userId,
          queryRef.current.token
        );
      }
    });
  };

  /**
   * 初始化类
   */
  useEffect(() => {
    const client = QNWhiteBoard.create();
    client.initConfig({
      path: './webassembly/whiteboardcanvas.html',
    });
    setClient(client);
    setInstance(client.createInstance(queryRef.current.bucketId));
  }, []);

  /**
   * 注册房间事件回调
   */
  useEffect(() => {
    if (!client) return;
    if (!instance) return;
    registerWhiteBoardEvent(instance);
    registerPPTEvent(instance);
    registerPDFEvent(instance);
    registerPlaybackEvent(instance);
    registerRoomEvent(client);
  }, [client, instance]);

  /**
   * 离开页面
   */
  useUnmount(() => {
    if (client) {
      client.leaveRoom();
    }
  });

  /**
   * 加入房间
   */
  const onJoinRoom = () => {
    client?.joinRoom(
      queryRef.current.appId,
      queryRef.current.meetingId,
      queryRef.current.userId,
      queryRef.current.token
    );
  };
  /**
   * 离开房间
   */
  const onLeaveRoom = () => {
    client?.leaveRoom();
  };

  /**
   * 铅笔菜单切换
   * @param value
   */
  const onToolPenPencilChange: ToolbarProps['onToolPenPencilChange'] = (value) => {
    if (!client) return;
    const penStyle = { type: 0, color: `#FF${value?.color?.slice(1)}`, size: value?.size };
    console.log('onToolPenPencilChange', value, penStyle);
    client.setPenStyle(penStyle);
    setToolPenPencilValue(value);
  };

  /**
   * 马克笔菜单切换
   * @param value
   */
  const onToolPenMarkChange: ToolbarProps['onToolPenMarkChange'] = (value) => {
    if (!client) return;
    const penStyle = { type: 1, color: `#7F${value?.color?.slice(1)}`, size: value?.size };
    console.log('onToolPenMarkChange', value, penStyle);
    client.setPenStyle(penStyle);
    setToolPenMarkValue(value);
  };

  /**
   * 手势菜单切换
   * @param value
   */
  const onToolGestureChange: ToolbarProps['onToolGestureChange'] = (value) => {
    if (!client) return;
    const penStyle = {
      type: gestureMap[value],
      color: '#FF000000',
      size: 10
    };
    console.log('onToolGestureChange', penStyle);
    client.setPenStyle(penStyle);
    setToolGestureValue(value);
  };

  /**
   * 橡皮菜单切换
   * @param value
   */
  const onToolRubberChange: ToolbarProps['onToolRubberChange'] = (value) => {
    if (!client) return;
    client.setEraseSize(value);
    console.log('onToolGestureChange', value);
    setToolRubberValue(value);
  };

  /**
   * 图形菜单切换
   * @param value
   */
  const onToolGeometryChange: ToolbarProps['onToolGeometryChange'] = (value) => {
    if (!client) return;
    const geometryMode = value.geometryMode;
    const penStyle = {
      type: 0,
      color: `#FF${value?.color?.slice(1)}`,
      size: value?.size
    };
    if (geometryMode) {
      client.setGeometryMode(geometryMap[geometryMode]);
    }
    console.log('onToolGeometryChange', penStyle);
    client.setPenStyle(penStyle);
    setToolGeometryValue(value);
  };

  /**
   * toolbar 一级菜单切换为铅笔
   */
  const onModeChangePenPencil = () => {
    if (!client) return;
    const penStyle = {
      ...toolPenPencilValue,
      type: 0,
      color: `#FF${toolPenPencilValue?.color?.slice(1)}`,
    };
    console.log('onModeChange', mode, penStyle);
    client.setInputMode(0);
    client.setPenStyle(penStyle);
  };

  /**
   * toolbar 一级菜单切换为马克笔
   */
  const onModeChangePenMark = () => {
    if (!client) return;
    const penStyle = {
      ...toolPenMarkValue,
      type: 1,
      color: `#7F${toolPenMarkValue?.color?.slice(1)}`
    };
    console.log('onModeChange', mode, penStyle);
    client.setInputMode(0);
    client.setPenStyle(penStyle);
  };

  /**
   * toolbar 一级菜单切换为手势
   */
  const onModeChangeGesture = () => {
    if (!client) return;
    const penStyle = {
      type: gestureMap[1],
      color: '#FF000000',
      size: 10
    };
    console.log('onModeChange', mode, penStyle);
    client.setInputMode(0);
    client.setPenStyle(penStyle);
  };

  /**
   * toolbar 一级菜单切换为几何图形
   */
  const onModeChangeGeometry = () => {
    if (!client) return;
    const geometryMode = toolGeometryValue?.geometryMode;
    client.setInputMode(3);
    if (geometryMode) {
      client.setGeometryMode(geometryMap[geometryMode]);
    }
    client.setPenStyle({
      type: 0,
      color: `#FF${toolGeometryValue?.color?.slice(1)}`,
      size: toolGeometryValue?.size
    });
  };

  /**
   * 点击上传按钮触发选择文件上传
   */
  const onModeChangeUpload = () => {
    const inputFileElement = document.getElementById('inputFile') as HTMLInputElement;
    inputFileElement.click();
  };

  /**
   * toolbar 一级菜单切换
   * @param mode
   */
  const onModeChange: ToolbarProps['onModeChange'] = (mode) => {
    if (!client) return;
    console.log('onModeChange', mode);
    if (mode === 'mouse') { // 选择模式
      client.setInputMode(2);
    }
    if (mode === 'penPencil') { // 铅笔
      onModeChangePenPencil();
    }
    if (mode === 'penMark') { // 马克笔
      onModeChangePenMark();
    }
    if (mode === 'gesture') { // 手势
      onModeChangeGesture();
    }
    if (mode === 'rubber') { // 橡皮
      client.setInputMode(1);
    }
    if (mode === 'geometry') { // 几何图形
      onModeChangeGeometry();
    }
    if (mode === 'upload') {
      onModeChangeUpload();
    }
    setMode(mode);
  };

  /**
   * 上传文件 input onChange 事件触发
   * @param event
   */
  const onInputFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!client) return;
    client.uploadFile({
      file: file,
      left: 100,
      top: 200,
      width: 800,
      height: 1000
    });
  };

  /**
   * 加载回放
   */
  const onLoadReplay = () => {
    client?.getRecord(queryRef.current.recordId);
  };
  /**
   * 播放
   */
  const onPlay = () => {
    instance?.play();
  };
  /**
   * 暂停
   */
  const onPause = () => {
    instance?.pause();
  };
  /**
   * 停止
   */
  const onStop = () => {
    instance?.stop();
  };
  /**
   * 跳转
   */
  const onSeek = () => {
    Modal.confirm({
      title: '请输入跳转的时间',
      content: <Input ref={seekEleRef}/>,
      onOk() {
        const inputEle = seekEleRef.current?.input;
        instance?.seek(parseFloat(inputEle?.value || ''));
      }
    });
  };
  /**
   * 校准
   */
  const onCalibrate = () => {
    Modal.confirm({
      title: '请输入校准的时间',
      content: <Input ref={calibrateEleRef}/>,
      onOk() {
        const inputEle = calibrateEleRef.current?.input;
        instance?.calibrate(parseFloat(inputEle?.value || ''));
      }
    });
  };
  /**
   * 关闭回放
   */
  const onCloseReplay = () => {
    instance?.release();
  };

  return <div className={styles.container}>
    <Toolbar
      fixed="top"
      mode={mode}
      visible={visible}
      toolPenPencilValue={toolPenPencilValue}
      toolPenMarkValue={toolPenMarkValue}
      toolGestureValue={toolGestureValue}
      toolRubberValue={toolRubberValue}
      toolGeometryValue={toolGeometryValue}
      onToolPenPencilChange={onToolPenPencilChange}
      onToolPenMarkChange={onToolPenMarkChange}
      onToolGestureChange={onToolGestureChange}
      onToolRubberChange={onToolRubberChange}
      onToolGeometryChange={onToolGeometryChange}
      onVisibleChange={setVisible}
      onModeChange={onModeChange}
    />
    <div id="iframeBox" className={styles.box}></div>
    <div className={styles.bottom}>
      <div className={styles.bottomLeft}>
        <RedoUndo
          className={styles.bottomLeftBar}
          label="PPT上下页切换:"
          onUndoButtonClick={() => {
            if (!instance) return;
            instance.preStep();
          }}
          onRedoButtonClick={() => {
            if (!instance) return;
            instance.nextStep();
          }}
        />
        <span className={styles.PDFAction}>
          <Switch
            checked={pdfChecked}
            checkedChildren="PDF操作激活中"
            unCheckedChildren="PDF操作关闭中"
            onChange={(checked) => {
              if (!instance) return;
              instance.setPDFOperationMode(checked);
              setPDFChecked(checked);
            }}
          />
        </span>
      </div>
      <div className={styles.record}>
        <Button className={styles.button} type="primary" onClick={onJoinRoom}>加入房间</Button>
        <Button className={styles.button} type="primary" onClick={onLeaveRoom}>退出房间</Button>
        <Button className={styles.button} type="primary" onClick={onLoadReplay}>加载回放</Button>
        <Button className={styles.button} type="primary" onClick={onPlay}>播放</Button>
        <Button className={styles.button} type="primary" onClick={onPause}>暂停</Button>
        <Button className={styles.button} type="primary" onClick={onStop}>停止</Button>
        <Button className={styles.button} type="primary" onClick={onSeek}>跳转</Button>
        <Button className={styles.button} type="primary" onClick={onCalibrate}>校准</Button>
        <Button className={styles.button} type="primary" onClick={onCloseReplay}>关闭回放</Button>
      </div>
    </div>
    <input
      id="inputFile"
      type="file"
      style={{ display: 'none' }}
      onChange={onInputFileChange}
    />
  </div>;
};

export default Room;
