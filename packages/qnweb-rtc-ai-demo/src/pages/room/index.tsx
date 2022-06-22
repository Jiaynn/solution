import { Button, Input, Modal, Popover, Spin } from 'antd';
import useRTCListeners from '../../hooks/useRTCListeners';
import { baseDownload } from '../../utils/download';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import useFaceActionLiveDetector from '../../hooks/useFaceActionLiveDetector';
import useRTCJoinRoom from '../../hooks/useRTCJoinRoom';
import useRTCWakeDevice from '../../hooks/useRTCWakeDevice';
import { generateAiToken, generateSignToken } from '../../utils/token';
import * as eruda from 'eruda';
import css from './index.module.scss';

/**
 * 光线检测状态值
 */
enum FaceFlashLiveStatus {
  Pending, // 预备
  InProgress, // 进行中
  Closed, // 已结束
}

const Room = () => {
  const roomToken = new URLSearchParams(location.search).get('roomToken') || '';
  const { RTCClient, isRTCRoomJoined } = useRTCJoinRoom(roomToken);
  const cameraTrackElement = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [saying, setSaying] = useState(false);
  const audioAnalyzer = useRef<any>(null);
  const [captionText, setCaptionText] = useState<string>(); // 语音转文字字幕
  const targetFileInput = useRef<HTMLInputElement>(null);
  const {
    countdown,
    faceActionLiveDetectorText,
    faceActionLiveDetectorType,
    setFaceActionLiveDetectorType
  } = useFaceActionLiveDetector();
  const [faceActionLiveDetector, setFaceActionLiveDetector] = useState<any>();
  const [faceFlashLiveStatus, setFaceFlashLiveStatus] = useState<FaceFlashLiveStatus>(FaceFlashLiveStatus.Closed);
  const [isRecord, setIsRecord] = useState(false);
  const recorder = useRef(null);
  const remoteTrackElement = useRef(null);
  const { remoteTracks } = useRTCListeners(RTCClient);
  const [aiText, setAiText] = useState<string>();
  // 采集参数(宽、高、视频帧率、视频码率、optimizationMode)
  const [cameraRecordConfigString, setCameraRecordConfigString] = useState<string>('');
  const [cameraRecordConfig, setCameraRecordConfig] = useState<any>();
  const { localTracks, facingMode, setFacingMode } = useRTCWakeDevice(RTCClient, cameraRecordConfig);
  const [loading, setLoading] = useState(false);
  const [isEnableActionAndAuth, setIsEnableActionAndAuth] = useState(false); // 动作活体+权威人脸认证

  /**
   * 获取摄像头采集参数
   * 宽、高、视频帧率、视频码率、optimizationMode
   * @param val
   */
  const getCameraConfig = (val: string) => {
    // 宽、高、视频帧率、视频码率、optimizationMode
    return val
      .split(',')
      .map((value, index) => {
        const keys: { key?: string; type?: string }[] = [
          { key: 'width', type: 'number' },
          { key: 'height', type: 'number' },
          { key: 'frameRate', type: 'number' },
          { key: 'bitrate', type: 'number' },
          { key: 'optimizationMode', type: 'string' }
        ];
        const matchKeyMap = keys[index] || {};
        const type = matchKeyMap.type;
        const isNeedFilter = ['', 'undefined', 'null'].includes(value);
        return {
          [matchKeyMap.key]: type === 'number' ? +value : value,
          isNeedFilter,
        };
      })
      .filter(v => !v.isNeedFilter)
      .reduce((previousValue, currentValue) => {
        const { isNeedFilter, ...config } = currentValue;
        return {
          ...previousValue,
          ...config
        };
      }, {});
  };

  /**
   * 初始化
   */
  useEffect(() => {
    const isDebug = JSON.parse(new URLSearchParams(location.search).get('isDebug'));
    if (isDebug) eruda.init();
    // 初始化 aiToken
    QNRTCAI.init(generateAiToken(), generateSignToken);
  }, []);

  /**
   * 本地 Track 发生变化
   */
  useEffect(() => {
    if (isRTCRoomJoined) {
      localTracks.forEach(track => {
        if (track.tag === 'camera' && cameraTrackElement.current) track.play(cameraTrackElement.current);
      });
      RTCClient.publish(localTracks);
    }
  }, [localTracks, isRTCRoomJoined, RTCClient]);

  /**
   * 远端 Track 发生变化
   */
  useEffect(() => {
    if (isRTCRoomJoined) {
      console.log('remoteTracks', remoteTracks);
      remoteTracks.forEach(track => {
        if (remoteTrackElement.current) track.play(remoteTrackElement.current);
      });
    }
  }, [remoteTracks, isRTCRoomJoined, RTCClient]);

  /**
   * 离开房间
   */
  useEffect(() => {
    return () => {
      if (isRTCRoomJoined) {
        RTCClient.leave();
        // localTracks.forEach(track => track.release());
      }
    };
  }, [RTCClient, isRTCRoomJoined]);

  /**
   * 结束动作活体检测、开始响应识别结果
   */
  useEffect(() => {
    if (
      countdown <= 0 &&
      localTracks.length &&
      faceActionLiveDetectorType &&
      faceActionLiveDetector
    ) {
      setLoading(true);
      console.log('faceActionLiveDetector');
      faceActionLiveDetector.commit().then(result => {
        setAiText(JSON.stringify(result, (key, value) => {
          if (key === 'image_b64') {
            return undefined;
          }
          return value;
        }));
      }).catch(error => {
        setAiText(JSON.stringify(error));
      }).finally(() => setLoading(false));
    }
  }, [countdown, faceActionLiveDetectorType, localTracks, faceActionLiveDetector]);

  /**
   * 身份证识别
   */
  const IDCard = () => {
    console.log('身份证识别');
    const cameraTrack = localTracks.find(t => t.tag === 'camera');
    QNRTCAI.IDCardDetector.run(cameraTrack).then((res: any) => {
      setAiText(JSON.stringify(res));
    });
  };

  /**
   * 文字转语音
   */
  const textToSpeak = () => {
    QNRTCAI.textToSpeak({ text }).then(result => {
      const base64String = result.response.audio;
      const snd = new Audio('data:audio/wav;base64,' + base64String);
      snd.play().catch(error => {
        Modal.error({
          title: 'textToSpeak error',
          content: JSON.stringify(error)
        });
      });
    });
  };

  /**
   * 语音转文字
   */
  const speakToText = () => {
    const audioTrack = localTracks.find(t => t.tag === 'microphone');
    console.log('audioTrack', audioTrack);
    if (saying) { // 关闭
      audioAnalyzer.current.stopAudioToText();
    } else { // 开启
      audioAnalyzer.current = QNRTCAI.AudioToTextAnalyzer.startAudioToText(audioTrack, {
        hot_words: '清楚,10;清晰,1'
      }, {
        onAudioToText: (message: any) => {
          console.log('message', message);
          const captionText = message.transcript;
          if (captionText) {
            setCaptionText(captionText);
          }
        }
      });
    }
    setSaying(!saying);
  };

  /**
   * 人脸检测
   */
  const faceDetector = () => {
    const cameraTrack = localTracks.find(t => t.tag === 'camera');
    QNRTCAI.faceDetector(cameraTrack).then(result => {
      setAiText(JSON.stringify(result));
    });
  };

  /**
   * 人脸对比
   */
  const faceCompare = () => {
    console.log('人脸对比');
    targetFileInput.current?.click();
  };

  /**
   * 选择文件
   * @param event
   */
  const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = event => {
    const files = event.target.files || [];
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        // base64码
        const imgFile = ev.target?.result; // 或 e.target 都是一样的
        const cameraTrack = localTracks.find(t => t.tag === 'camera');
        if (imgFile) {
          QNRTCAI.faceComparer(cameraTrack, imgFile + '').then(result => {
            setAiText(JSON.stringify(result));
          }).catch(error => {
            setAiText(JSON.stringify(error));
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * 切换前/后置摄像头
   */
  const toggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
    localTracks.forEach(track => track.release());
  };

  /**
   * 权威认证弹窗
   */
  const showAuthFaceModal = (): Promise<{
    realname: string,
    idcard: string,
  }> => {
    return new Promise((resolve) => {
      const inputStyle: CSSProperties = {
        marginBottom: 10
      };
      Modal.confirm({
        title: '权威人脸对比',
        content: <div>
          <Input placeholder="请输入姓名" id="realName" style={inputStyle}/>
          <Input placeholder="请输入身份证号" id="idCard" style={inputStyle}/>
        </div>,
        onOk() {
          const realname = document.querySelector<HTMLInputElement>('#realName')?.value;
          const idcard = document.querySelector<HTMLInputElement>('#idCard')?.value;
          resolve({
            realname,
            idcard
          })
        },
        cancelText: '取消',
        okText: '确定'
      });
    })
  }

  /**
   * 开始动作活体检测
   * @param actionType
   */
  const onFaceLiveAction = (actionType: string) => {
    try {
      const QNRTC = window.QNRTC.default;
      const videoTrack = localTracks.find(track => track.tag === 'camera');
      const faceActionParams = {
        action_types: [actionType],
        video_type: 1,
        debug: true
      };
      if (isEnableActionAndAuth) { // 动作活体+权威人脸比对
        showAuthFaceModal().then(authoritativeFaceParams => {
          setFaceActionLiveDetector(
            QNRTCAI.QNAuthorityActionFaceComparer.start(
              QNRTC, videoTrack, faceActionParams, authoritativeFaceParams
            )
          );
          setFaceActionLiveDetectorType(actionType);
        })
      } else {
        setFaceActionLiveDetector(QNRTCAI.FaceActionLiveDetector.start(QNRTC, videoTrack, faceActionParams));
        setFaceActionLiveDetectorType(actionType);
      }
    } catch (err) {
      Modal.error({
        title: 'onFaceLiveAction error',
        content: err.message
      });
    }
  };

  /**
   * 光线活体检测
   */
  const faceFlashLive = () => {
    setFaceFlashLiveStatus(FaceFlashLiveStatus.Pending);
    const cameraTrack = localTracks.find(track => track.tag === 'camera');
    const faceFlashLiveDetector = QNRTCAI.FaceFlashLiveDetector.start(cameraTrack);
    setTimeout(() => {
      setFaceFlashLiveStatus(FaceFlashLiveStatus.InProgress);
      faceFlashLiveDetector.commit().then(result => {
        setAiText(JSON.stringify(result, null, 2));
      }).catch(error => {
        Modal.error({
          title: '光线活体检测报错',
          content: `请求失败，http status: ${error.status}`
        });
      }).finally(() => {
        setFaceFlashLiveStatus(FaceFlashLiveStatus.Closed);
      });
    }, 3000);
  };

  /**
   * 开始/结束录制
   */
  const toggleRecord = () => {
    const nextValue = !isRecord;
    const QNRTC = window.QNRTC.default;
    const videoTrack = localTracks.find(track => track.tag === 'camera');
    const audioTrack = localTracks.find(track => track.tag === 'microphone');
    recorder.current = recorder.current || QNRTC.createMediaRecorder();
    if (nextValue) {
      recorder.current.start({
        videoTrack,
        audioTrack
      });
    } else {
      const recordBlob = recorder.current.stop();
      const blobURL = URL.createObjectURL(recordBlob);
      baseDownload(blobURL, 'test.webm');
    }
    setIsRecord(nextValue);
  };

  /**
   * 开始采集设备
   */
  const startWakeDevice = () => {
    localTracks.forEach(track => track.release());
    const config = getCameraConfig(cameraRecordConfigString);
    setCameraRecordConfig(config);
  };

  /**
   * 权威人脸对比
   */
  const onAuthoritativeFaceComparer = () => {
    showAuthFaceModal().then(res => {
      const videoTrack = localTracks.find(track => track.tag === 'camera');
      QNRTCAI.QNAuthoritativeFaceComparer.run(videoTrack, {
        realname: res.realname,
        idcard: res.idcard
      }).then(result => {
        setAiText(JSON.stringify(result));
      }).catch(error => {
        setAiText(JSON.stringify(error));
      }).finally(() => setLoading(false));
    })
  };

  /**
   * ocr识别
   */
  const onOCR = () => {
    setLoading(true);
    const videoTrack = localTracks.find(track => track.tag === 'camera');
    QNRTCAI.QNOCRDetector.run(videoTrack).then(result => {
      setAiText(JSON.stringify(result));
    }).finally(() => setLoading(false));
  };

  return <div className={css.room}>
    <Input
      placeholder="请输入摄像头采集的参数，并以英文逗号(,)分隔开"
      value={cameraRecordConfigString}
      onChange={event => setCameraRecordConfigString(event.target.value)}
    />
    <Button
      className={css.toolBtn}
      size="small"
      type="primary"
      onClick={startWakeDevice}
    >开始采集</Button>
    <div ref={remoteTrackElement} className={css.remoteTrack}/>
    <div className={css.toolBox}>
      <Button className={css.toolBtn} size="small" type="primary" onClick={IDCard}>身份证识别</Button>
      <Popover
        trigger="click"
        content={
          <>
            {
              ['nod', 'shake', 'blink', 'mouth'].map(action => {
                const mapText = { nod: '点点头', shake: '摇摇头', blink: '眨眨眼', mouth: '张张嘴' };
                return <Button
                  onClick={() => onFaceLiveAction(action)}
                  className={css.liveAction}
                  size="small"
                  type="primary"
                  key={action}
                >{mapText[action]}</Button>;
              })
            }
          </>
        }
      >
        <Button className={css.toolBtn} size="small" type="primary">动作活体</Button>
      </Popover>
      <Button className={css.toolBtn} size="small" type="primary"
              onClick={() => setIsEnableActionAndAuth(!isEnableActionAndAuth)}>动作活体{isEnableActionAndAuth ? '关闭' : '开启'}权威认证</Button>
      <Button className={css.toolBtn} size="small" type="primary" onClick={faceFlashLive}>光线活体</Button>
      <Button className={css.toolBtn} size="small" type="primary" onClick={faceDetector}>人脸检测</Button>
      <Button className={css.toolBtn} size="small" type="primary" onClick={faceCompare}>人脸对比</Button>
      <Button className={css.toolBtn} size="small" type="primary" onClick={textToSpeak}>文转音</Button>
      <Button className={css.toolBtn} size="small" type="primary" onClick={toggleCamera}>切换摄像头</Button>
      <Button className={css.toolBtn} size="small" type="primary" onClick={speakToText}>
        {saying ? '关闭' : '开启'}语音转文字
      </Button>
      <Button className={css.toolBtn} size="small" type="primary" onClick={toggleRecord}>
        {isRecord ? '结束' : '开始'}录制
      </Button>
      <Button className={css.toolBtn} size="small" type="primary" onClick={onAuthoritativeFaceComparer}>
        权威人脸对比
      </Button>
      <Button className={css.toolBtn} size="small" type="primary" onClick={onOCR}>
        OCR识别
      </Button>
    </div>

    <Input
      placeholder="请输入文字转语音的内容"
      value={text}
      onChange={event => setText(event.target.value)}
    />

    {
      saying && <div className={css.caption}>
        识别结果：{captionText}
      </div>
    }

    <input
      className={css.targetFileInput}
      ref={targetFileInput}
      type="file"
      onChange={onChangeFile}
      accept="image/*"
    />

    {
      faceFlashLiveStatus !== FaceFlashLiveStatus.Closed &&
      <div className={css.faceActionLiveDetectorToast}>
        {
          faceFlashLiveStatus === FaceFlashLiveStatus.Pending ? '光线活体检测中...' : '光线活体数据请求中...'
        }
      </div>
    }

    <div ref={cameraTrackElement} className={css.cameraTrack}>
      {
        faceActionLiveDetectorText &&
        <div className={css.faceActionLiveDetectorToast}>{faceActionLiveDetectorText}：{countdown}</div>
      }
    </div>
    <div className={css.aiText}>{aiText}</div>

    {
      loading && <div className={css.loadingMask}>
        <Spin tip="数据加载中..."/>
      </div>
    }
  </div>;
};

export default Room;