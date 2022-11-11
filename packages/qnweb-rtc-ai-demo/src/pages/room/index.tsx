import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { Button, Input, message, Modal, Spin } from 'antd';
import * as eruda from 'eruda';
import * as QNRTCAI from 'qnweb-rtc-ai';
import { useInterval, useMount, useRequest, useUnmount } from 'ahooks';

import { useRTCWakeDevice } from '@/hooks';
import { baseDownload, generateAiToken, generateSignToken } from '@/utils';

import styles from './index.module.scss';

/**
 * 光线检测状态值
 */
enum FaceFlashLiveStatus {
  Pending, // 预备
  InProgress, // 进行中
  Closed, // 已结束
}

const faceActionLiveDetectorTypeMap = {
  0: '眨眼',
  4: '抬头',
  5: '低头',
  7: '左右摇头'
};

/**
 * 针对字符比较大的字段进行过滤，防止数据过大导致部分浏览器崩溃
 * @param result
 */
const filterBigData = (result: unknown): string => {
  return JSON.stringify(result, (key, value) => {
    if (typeof value === 'string' && value.length > 10) {
      return null;
    }
    return value;
  });
};

const Room = () => {
  const rtcClientRef = useRef(null);
  const localCameraTrackElementRef = useRef<HTMLDivElement>(null);
  const targetFileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef(null);
  const faceActionLiveDetectorIntervalRef = useRef(null);
  const faceActionLiveDetectorTimeoutRef = useRef(null);
  const audioToTextClientRef = useRef<QNRTCAI.AudioToTextAnalyzer>(null);

  /**
   * 初始化
   */
  useMount(() => {
    rtcClientRef.current = QNRTC.default.createClient();
  });

  /**
   * 页面卸载
   */
  useUnmount(() => {
    clearTimeout(faceActionLiveDetectorTimeoutRef.current);
    clearInterval(faceActionLiveDetectorIntervalRef.current);
  });

  const [text, setText] = useState('');
  const [saying, setSaying] = useState(false);
  const [captionText, setCaptionText] = useState<string>(); // 语音转文字字幕
  const [faceFlashLiveStatus, setFaceFlashLiveStatus] = useState<FaceFlashLiveStatus>(FaceFlashLiveStatus.Closed);
  const [isRecord, setIsRecord] = useState(false);
  const [aiText, setAiText] = useState<string>();
  // 采集参数(宽、高、视频帧率、视频码率、optimizationMode)
  const [cameraRecordConfigString, setCameraRecordConfigString] = useState<string>('');
  const [cameraRecordConfig, setCameraRecordConfig] = useState<any>();
  const {
    localTracks,
    localCameraTrack,
    localMicrophoneTrack,
    facingMode,
    setFacingMode
  } = useRTCWakeDevice(rtcClientRef.current, cameraRecordConfig);
  const [loading, setLoading] = useState(false);

  const [faceActionLiveDetectorCount, setFaceActionLiveDetectorCount] = useState<number>(3);
  const [faceActionCode, setFaceActionCode] = useState<string>('');
  const [faceActionCodeIndex, setFaceActionCodeIndex] = useState<number>(0);
  const [faceActionLiveDetectorModalVisible, setFaceActionLiveDetectorModalVisible] = useState<boolean>(false);

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
   * 预览本地摄像头
   */
  useEffect(() => {
    if (localCameraTrack) {
      localCameraTrack.play(localCameraTrackElementRef.current);
    }
  }, [localCameraTrack]);

  /**
   * 身份证识别
   */
  const IDCard = () => {
    console.log('身份证识别');
    QNRTCAI.IDCardDetector.run(localCameraTrack).then((result) => {
      setAiText(filterBigData(result));
    });
  };

  /**
   * 文字转语音
   */
  const {
    loading: textToAudioLoading,
    run: runTextToAudio
  } = useRequest(() => {
    return QNRTCAI.textToSpeak({ content: text }).then(result => {
      if (result.response.code === 0) {
        const snd = new Audio(result.response.result.audioUrl);
        return snd.play().catch(error => {
          Modal.error({
            content: error.message
          });
        });
      }
      Modal.error({
        content: result.response.msg
      });
    });
  }, {
    manual: true
  });

  /**
   * 语音转文字
   */
  const speakToText = () => {
    if (saying) { // 关闭
      audioToTextClientRef.current?.stopAudioToText();
      setCaptionText('');
    } else { // 开启
      audioToTextClientRef.current = QNRTCAI.AudioToTextAnalyzer.startAudioToText(localMicrophoneTrack, null, {
        onAudioToText: (result) => {
          const text = result.bestTranscription.transcribedText;
          setCaptionText(text);
        }
      });
    }
    setSaying(!saying);
  };

  /**
   * 人脸检测
   */
  const { loading: faceDetectLoading, run: runFaceDetect } = useRequest(() => {
    if (!localCameraTrack) {
      Modal.error({
        content: '请先打开摄像头'
      });
      return Promise.reject(new Error('localCameraTrack is null'));
    }
    return QNRTCAI.faceDetector(localCameraTrack).then(result => {
      setAiText(filterBigData(result));
    }).catch(error => {
      Modal.error({
        content: error.message
      });
    });
  }, {
    manual: true
  });

  /**
   * 人脸对比
   */
  const { loading: faceCompareLoading, run: runFaceCompare } = useRequest((params) => {
    if (!localCameraTrack) {
      Modal.error({
        content: '请先打开摄像头'
      });
      return Promise.reject(new Error('localCameraTrack is null'));
    }
    return QNRTCAI.faceComparer(localCameraTrack, {
      image: params.image.replace(/^data:image\/\w+;base64,/, ''),
      image_type: 'BASE64',
    }).then(result => {
      setAiText(filterBigData(result));
    }).catch(error => {
      Modal.error({
        content: error.message
      });
    });
  }, {
    manual: true
  });

  /**
   * 选择文件
   * @param event
   */
  const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = event => {
    const files = event.target.files || [];
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imgFile = e.target?.result; //  base64码, 或 e.target 都是一样的
        if (typeof imgFile !== 'string') {
          Modal.error({
            content: '文件类型错误'
          });
          console.error(`文件类型错误: ${imgFile}`);
          return;
        }
        runFaceCompare({
          image: imgFile
        });
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
          });
        },
        cancelText: '取消',
        okText: '确定'
      });
    });
  };

  /**
   * 动作活体检测
   */
  const { loading: faceActliveLoading, run: runFaceActlive } = useRequest(() => {
    if (!localCameraTrack) {
      Modal.error({
        content: '请先打开摄像头'
      });
      return Promise.reject(new Error('localCameraTrack is null'));
    }

    const client = QNRTCAI.FaceActionLiveDetector.create();
    if (faceActionLiveDetectorTimeoutRef.current) {
      clearTimeout(faceActionLiveDetectorTimeoutRef.current);
    }
    return client.getRequestCode().then(result => {
      const { code, session_id } = result.response.result;
      setFaceActionCode(code);
      setFaceActionCodeIndex(0);
      setFaceActionLiveDetectorCount(3);
      setFaceActionLiveDetectorModalVisible(true);
      client.start(localCameraTrack, {
        session_id
      });

      return new Promise(resolve => {
        faceActionLiveDetectorTimeoutRef.current = setTimeout(() => {
          resolve(0);
        }, code.length * 3000);
      });
    }).then(() => {
      setFaceActionLiveDetectorModalVisible(false);
      return client.commit();
    }).then(result => {
      setAiText(filterBigData(result));
    }).catch(error => {
      Modal.error({
        content: error.message
      });
    });
  }, {
    manual: true
  });

  /**
   * 多个动作活体的切换
   */
  useInterval(() => {
    setFaceActionCodeIndex(faceActionCodeIndex + 1);
  }, faceActionLiveDetectorModalVisible ? 3000 : null);

  /**
   * 动作活体倒计时
   */
  useInterval(() => {
    if (faceActionLiveDetectorCount <= 1) {
      setFaceActionLiveDetectorCount(3);
    } else {
      setFaceActionLiveDetectorCount(prev => prev - 1);
    }
  }, faceActionLiveDetectorModalVisible ? 1000 : null);

  /**
   * 光线活体检测
   */
  const faceFlashLive = () => {
    setFaceFlashLiveStatus(FaceFlashLiveStatus.Pending);
    const faceFlashLiveDetector = QNRTCAI.FaceFlashLiveDetector.start(localCameraTrack);
    setTimeout(() => {
      setFaceFlashLiveStatus(FaceFlashLiveStatus.InProgress);
      faceFlashLiveDetector.commit().then(result => {
        setAiText(filterBigData(result));
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
    recorderRef.current = recorderRef.current || QNRTC.default.createMediaRecorder();
    if (nextValue) {
      recorderRef.current.start({
        videoTrack: localCameraTrack,
        audioTrack: localMicrophoneTrack
      });
    } else {
      const recordBlob = recorderRef.current.stop();
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
      QNRTCAI.QNAuthoritativeFaceComparer.run(localCameraTrack, {
        realname: res.realname,
        idcard: res.idcard
      }).then(result => {
        setAiText(filterBigData(result));
      }).catch(error => {
        Modal.error({
          content: error.message
        });
      }).finally(() => setLoading(false));
    });
  };

  /**
   * ocr识别
   */
  const onOCR = () => {
    setLoading(true);
    QNRTCAI.QNOCRDetector.run(localCameraTrack).then(result => {
      setAiText(filterBigData(result));
    }).finally(() => setLoading(false));
  };

  /**
   * 动作活体+权威人脸对比
   */
  const onAuthFaceAction = () => {
    if (!localCameraTrack) {
      Modal.error({
        content: '请先打开摄像头'
      });
      return Promise.reject(new Error('localCameraTrack is null'));
    }

    const client = QNRTCAI.QNAuthorityActionFaceComparer.create();
    if (faceActionLiveDetectorTimeoutRef.current) {
      clearTimeout(faceActionLiveDetectorTimeoutRef.current);
    }
    return showAuthFaceModal().then(modalResult => {
      const codeHide = message.loading('正在获取动作活体检测请求码', 0);
      return client.getRequestCode().then(result => {
        codeHide();
        const { code, session_id } = result.response.result;
        setFaceActionCode(code);
        setFaceActionCodeIndex(0);
        setFaceActionLiveDetectorCount(3);
        setFaceActionLiveDetectorModalVisible(true);
        client.start(localCameraTrack, {
          session_id
        }, {
          realname: modalResult.realname,
          idcard: modalResult.idcard
        });

        return new Promise(resolve => {
          faceActionLiveDetectorTimeoutRef.current = setTimeout(() => {
            resolve(0);
          }, code.length * 3000);
        });
      }).then(() => {
        setFaceActionLiveDetectorModalVisible(false);
        message.loading({
          duration: 0,
          content: '正在获取识别结果',
          key: 'authFaceAction'
        });
        return client.commit();
      }).then(result => {
        message.destroy('authFaceAction');
        setAiText(filterBigData(result));
      }).catch(error => {
        Modal.error({
          content: error.message
        });
      });
    });
  };

  return <div className={styles.room}>
    <Input
      placeholder="请输入摄像头采集的参数，并以英文逗号(,)分隔开"
      value={cameraRecordConfigString}
      onChange={event => setCameraRecordConfigString(event.target.value)}
    />
    <Button
      className={styles.toolBtn}
      size="small"
      type="primary"
      onClick={startWakeDevice}
    >开始采集</Button>
    <div className={styles.toolBox}>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        onClick={IDCard}
      >身份证识别</Button>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        loading={faceActliveLoading}
        onClick={runFaceActlive}
      >动作活体</Button>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        onClick={onAuthFaceAction}
      >
        动作活体+权威认证
      </Button>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        onClick={faceFlashLive}
      >光线活体</Button>
      <Button
        className={styles.toolBtn}
        loading={faceDetectLoading}
        size="small"
        type="primary"
        onClick={runFaceDetect}
      >人脸检测</Button>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        loading={faceCompareLoading}
        onClick={() => targetFileInputRef.current?.click()}
      >人脸对比</Button>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        loading={textToAudioLoading}
        onClick={runTextToAudio}
      >文转音</Button>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        onClick={toggleCamera}
      >切换摄像头</Button>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        onClick={speakToText}
      >
        {saying ? '关闭' : '开启'}语音转文字
      </Button>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        onClick={toggleRecord}
      >
        {isRecord ? '结束' : '开始'}录制
      </Button>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        onClick={onAuthoritativeFaceComparer}
      >
        权威人脸对比
      </Button>
      <Button
        className={styles.toolBtn}
        size="small"
        type="primary"
        onClick={onOCR}
      >
        OCR识别
      </Button>
    </div>

    <Input
      placeholder="请输入文字转语音的内容"
      value={text}
      onChange={event => setText(event.target.value)}
    />

    {
      saying && <div className={styles.caption}>
        识别结果：{captionText}
      </div>
    }

    <input
      style={{ display: 'none' }}
      ref={targetFileInputRef}
      type="file"
      onChange={onChangeFile}
      accept="image/*"
    />

    {
      faceFlashLiveStatus !== FaceFlashLiveStatus.Closed && <div className={styles.faceActionLiveDetectorToast}>
        {
          faceFlashLiveStatus === FaceFlashLiveStatus.Pending ? '光线活体检测中...' : '光线活体数据请求中...'
        }
      </div>
    }

    <div ref={localCameraTrackElementRef} className={styles.localCamera}>
      {
        faceActionLiveDetectorModalVisible ? <div className={styles.faceActionLiveDetectorToast}>
          {faceActionLiveDetectorTypeMap[faceActionCode[faceActionCodeIndex]]}：{faceActionLiveDetectorCount}
        </div> : null
      }
    </div>

    <div className={styles.aiText}>{aiText}</div>

    {
      loading && <div className={styles.loadingMask}>
        <Spin tip="数据加载中..."/>
      </div>
    }
  </div>;
};

export default Room;
