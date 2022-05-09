# 开发准备

1. 引入 sdk

可以直接使用 script 标签方式引入。

```html
<script src='./qnweb-rtc-ai.umd.js'></script>
```

也可以通过 import 方式引入。

```js
import * as QNRTCAI from './qnweb-rtc-ai.umd.js'
```

2. 验证

用如下代码获取主类，验证是否正常引入成功。

```html
<script>
  console.log(QNRTCAI.version);
</script>
```

# 快速开始

```ts
/**
 * 根据回传的 url 由业务服务器生成 signToken
 * 生成算法
 * @param url
 */
async function signCallback(url) {
  /**
   * 这里编写通过 url 生成的 signToken 逻辑并返回
   */
  return signToken
}

/**
 * 初始化由服务端生成的 aiToken 和 signToken
 */
QNRTCAI.init(aiToken, signCallback);

/**
 * 语音识别转文字
 */
const analyzer = QNRTCAI.AudioToTextAnalyzer.startAudioToText(
  // 音频 Track 对象
  audioTrack,
  // 语音识别参数，可选
  params,
  {
    // 语音识别转文字的结果
    onAudioToText: (message: Message) => {
      console.log(message)
    }
  }
)

/**
 * 结束语音识别转文字
 */
analyzer.stopAudioToText();

/**
 * 身份证识别
 * videoTrack 为视频 Track 对象
 */
QNRTCAI.IDCardDetector.run(videoTrack).then(res => {
  console.log(res);
})
```

# API 概览

| 方法                                                         | 描述                  |
| ------------------------------------------------------------ | --------------------- |
| [AudioToTextAnalyzer](#audiototextanalyzer)                  | 语音识别转文字        |
| [IDCardDetector](#idcarddetector)                            | 身份证信息识别        |
| [textToSpeak](#texttospeak)                                  | 文字转语音            |
| [FaceActionLiveDetector](#faceactionlivedetector)            | 动作活体检测          |
| [FaceFlashLiveDetector](#faceflashlivedetector)              | 光线活体检测          |
| [faceComparer](#facecomparer)                                | 人脸对比              |
| [faceDetector](#facedetector)                                | 人脸检测              |
| [QNAuthoritativeFaceComparer](#qnauthoritativefacecomparer)  | 权威人脸比对          |
| [QNAuthorityActionFaceComparer](#qnauthorityactionfacecomparer) | 权威人脸比对+动作活体 |
| [QNOCRDetector](#qnocrdetector)                              | OCR识别               |

## API文档

### AudioToTextAnalyzer

#### 如何使用

```ts
// 开启语音识别
const audioAnalyzer = QNRTCAI.AudioToTextAnalyzer.startAudioToText(
  audioTrack, 
  null, 
  {
    onAudioToText: message => {
    console.log('message', message);
    if (message.transcript) {
      localAudioText.innerText = message.transcript
    }
  }
});
audioAnalyzer.getStatus(); // 获取当前状态
audioAnalyzer.stopAudioToText(); // 结束语音识别
```

#### 方法

| 方法                              | 类型                                                         | 说明             |
| --------------------------------- | ------------------------------------------------------------ | ---------------- |
| static startAudioToText(静态方法) | (audioTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), params: [AudioToTextParams](#audiototextparams), callback: [Callback](#callback)) => QNAudioToTextAnalyzer | 开始语音实时识别 |
| getStatus                         | () => [Status](#status)                                      | 获取当前状态     |
| stopAudioToText                   | () => void                                                   | 停止语音实时识别 |

### IDCardDetector

#### 如何使用

```ts
QNRTCAI.IDCardDetector.run(videoTrack)
  .then(res => console.log(res))
```

#### 方法

| 方法                 | 类型                                                         | 说明                                                    |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| static run(静态方法) | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), params?: [IDCardDetectorRunParams](#idcarddetectorrunparams) => Promise<[IDCardDetectorRunRes](#idcarddetectorrunRes)> | 身份证信息识别，返回的是一个promise，得到识别出来的信息 |

### textToSpeak

#### 如何使用

```ts
QNRTCAI.textToSpeak({ text }).then(response => {
  const base64String = response.response.audio;
  console.log('response', response)
  console.log('base64String', base64String);
  const snd = new Audio('data:audio/wav;base64,' + base64String);
  snd.play();
});
```

#### 方法

| 方法        | 类型                                                         | 说明       |
| ----------- | ------------------------------------------------------------ | ---------- |
| textToSpeak | (params: [TextToSpeakParams](#texttospeakparams))) => Promise<[TextToSpeakRes](#texttospeakres)> | 文字转语音 |

### FaceActionLiveDetector

#### 如何使用

```ts
// 需通过 QNRTC 创建 recorder
const QNRTC = window.QNRTC.default;
// 开始检测
const detector = QNRTCAI.FaceActionLiveDetector.start(QNRTC, videoTrack, {
  action_types: ['shake'] // 传入动作活体动作的标示字符串
});
// 结束检测并响应数据
detector.commit().then(response => {
  console.log('response', response)
});
```

#### 方法

| 方法                   | 类型                                                         | 说明                                                         |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| static start(静态方法) | (QNRTC, videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), params: [FaceActionLiveDetectorParams](#faceactionlivedetectorparams)) => FaceActionLiveDetector | video_type 表示选择录制的格式，默认为 1(1 为 mp4，2 为 h264)。调用 start 开始录制。 |
| commit                 | () => Promise\<[FaceActionLiveDetectorRes](#faceactionlivedetectorres)\> | 结束检测并响应数据                                           |

### FaceFlashLiveDetector

#### 如何使用

```ts
// 开始检测
const faceFlashLiveDetector = QNRTCAI.FaceFlashLiveDetector.start(videoTrack);
// 结束检测
faceFlashLiveDetector.commit().then(response => console.log('response', response))
```

#### 方法

| 方法                   | 类型                                                         | 说明                                         |
| ---------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| static start(静态方法) | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), defaultFrameRate: number) => FaceFlashLiveDetector | 开始检测，defaultFrameRate 为帧率，默认为 15 |
| commit                 | () => Promise\<[FaceFlashLiveDetectorRes](#faceflashlivedetectorres)\> | 结束检测并响应数据                           |

### faceComparer

#### 如何使用

```ts
/**
 * targetImgBase64 为需要对比的图片 base64 编码
 */
QNRTCAI.faceComparer(videoTrack, targetImgBase64).then(response => {
  console.log('response', response);
});
```

#### 方法

| 方法         | 类型                                                         | 说明     |
| ------------ | ------------------------------------------------------------ | -------- |
| faceComparer | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), targetImg: string, params: [FaceComparerParams](#facecomparerparams) => Promise\<[FaceComparerRes](#facecomparerres)\> | 人脸对比 |

### faceDetector

#### 如何使用

```ts
QNRTCAI.faceDetector(videoTrack).then(response => {
  console.log('response', response);
});
```

#### 方法

| 方法         | 类型                                                         | 说明     |
| ------------ | ------------------------------------------------------------ | -------- |
| faceDetector | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), params: [FaceDetectorParams](#facedetectorparams) => Promise\<[FaceDetectorRes](#facedetectorres)\> | 人脸检测 |

### QNAuthoritativeFaceComparer

#### 如何使用

```ts
QNRTCAI.QNAuthoritativeFaceComparer.run(videoTrack, {
  realname, // 真实名字
  idcard, // 身份证号
}).then(result => {
  console.log('result', result)
}).catch(error => {
  console.error(error);
});
```

#### 方法

| 方法                 | 类型                                                         | 说明             |
| -------------------- | ------------------------------------------------------------ | ---------------- |
| static run(静态方法) | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), params: [QNAuthoritativeFaceParams](#qnauthoritativefaceparams)) => Promise\<[QNAuthoritativeFaceResult](#qnauthoritativefaceresult)\> | 执行权威人脸对比 |

### QNAuthorityActionFaceComparer

#### 如何使用

```ts
// 开始权威人脸比对和动作活体检测
const detector = QNRTCAI.QNAuthorityActionFaceComparer.start(
  QNRTC, 
  videoTrack, 
  faceActionParams,
  authoritativeFaceParams
);
// 结束权威人脸比对和动作活体检测, 得到响应值
detector.commit().then(result => {
  console.log('result', result)
})
```

#### 方法

| 方法                   | 类型                                                         | 说明               |
| ---------------------- | ------------------------------------------------------------ | ------------------ |
| static start(静态方法) | (QNRTC, videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), faceActionParams: [FaceActionLiveDetectorParams](#faceactionlivedetectorparams), authoritativeFaceParams: [QNAuthoritativeFaceParams](#qnauthoritativefaceparams)) => QNAuthorityActionFaceComparer | 开始检测           |
| commit                 | () => Promise<{   faceActionResult: [FaceActionLiveDetectorRes](#faceactionlivedetectorres);   authoritativeFaceResult: [QNAuthoritativeFaceResult](#qnauthoritativefaceresult); } | 结束检测并响应数据 |

### QNOCRDetector

#### 如何使用

```ts
QNRTCAI.QNOCRDetector.run(videoTrack).then(result => {
  console.log('result', result);
});
```

#### 方法

| 方法                 | 类型                                                         | 说明        |
| -------------------- | ------------------------------------------------------------ | ----------- |
| static run(静态方法) | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track)) => Promise\<[qnocrdetectorresult](#qnocrdetectorresult)\> | 执行ocr识别 |

## 类型说明

### AudioToTextParams

```ts
// 开启语音识别所需的参数
interface AudioToTextParams {
  force_final: number; // 是否在text为空的时候返回final信息, 1->强制返回;0->不强制返回。
  maxsil: number; // 最长静音间隔，单位秒，默认10s
  model_type: number; // 0->cn; 默认0
  need_partial: number; // 是否返回partial文本，1->返回，0-> 不返回;默认1
  need_words: number; // 是否返回词语的对齐信息，1->返回， 0->不返回;默认0。
  needvad: number; // 是否需要vad;0->关闭;1->开启; 默认1
  vad_sil_thres: number; // vad断句的累积时间，大于等于0， 如果设置为0，或者没设置，系统默认
  /**
   * 提供热词，格式为: hot_words=热词1,因子1;热词2,因子2，
   * 每个热词由热词本身和方法因子以英文逗号隔开，不同热词通过;隔开，
   * 最多100个热词，每个热词40字节以内。由于潜在的http服务对url大小的限制，以实际支持的热词个数为准
   * 因子范围[-10,10], 正数代表权重权重越高，权重越高越容易识别成这个词，建议设置1 ，负数代表不想识别
   */
  hot_words: string;
}
```

### Callback

```ts
/**
 * 连接状态变化
 * 参数:status-当前状态; msg-提示消息
 */
type StatusChangeCallback = (status: Status, msg: string) => void

/**
 * 实时转化文字数据
 * 参数:audioToText - 当前片段的结果文字数据
 */
type AudioToTextCallback = (audioToText: AudioToText) => void;

// 语音识别的回调
interface Callback {
  onStatusChange: StatusChangeCallback;
  onAudioToText: AudioToTextCallback;
}
```

### Status

```ts
// 当前的状态
enum Status {
  AVAILABLE, // 未开始可用 
  DESTROY, // 已经销毁不可用
  ERROR, // 连接异常断线
  DETECTING // 正在实时转化
}
```

### AudioToText

```ts
// 语音识别的内容
interface AudioToText {
  end_seq: number; // 为该文本所在的切片的终点(包含)，否则为-1
  end_time: number; // 该片段的终止时间，毫秒
  ended: number; // 是否是websocket最后一条数据,0:非最后一条数据,1: 最后一条数据。
  finalX: number; // 分片结束,当前消息的transcript为该片段最终结果，否则为partial结果
  long_sil: number; // 是否长时间静音，0:否;1:是
  partial_transcript: string; // partial结果文本, 开启needpartial后返回
  seg_begin: number; // 是否分段开始: 1:是; 0:不是。
  seg_index: number; // 是否是vad分段开始说话的开始1:是分段开始说话; 0:不是。
  spk_begin: number; // 是否是vad分段开始说话的开始1:是分段开始说话; 0:不是。
  start_seq: number; // 该文本所在的切片的起点(包含), 否则为-1
  start_time: number; // 该片段的起始时间，毫秒
  transcript: string; // 语音的文本, 如果final=0, 则为partinal结果 (后面可能会更改),final=1为该片段最终结果
  uuid: string;
  words: WordsDTO; // 返回词语的对齐信息, 参数need_words=1时返回详细内存见下表。
}

interface WordsDTO {
  seg_end: number; // 该词语相对整个数据流的起始时间, 毫秒
  seg_start: number; // 该词语相对当前分段的起始时间, 毫秒
  voice_end: number; // 该词语相对整个数据流的终止时间, 毫秒
  voice_start: number; // 该词语相对当前分段的终止时间, 毫秒
  word: string; // 词语本身，包括标点符号
}
```

### IDCardDetectorRunParams

```ts
// 身份证识别参数
interface IDCardDetectorRunParams {
  image?: string, // base64图像
  session_id?: string, // 唯一会话 id
  ret_image?: boolean, // 是否返回识别后的切图(切图是指精确剪裁对齐后的身份证正反面图片)，返回格式为 JPEG 格式二进制图片使用 base64 编码后的字符串
  ret_portrait?: boolean, // 是否返回身份证(人像面)的人脸图 片，返回格式为 JPEG 格式二进制图片使用 base64 编码后的字符串
  ref_side?: string, // 当图片中同时存在身份证正反面时，通过该参数指定识别的版面:取值'Any' - 识别人像面或国徽面，'F' - 仅 识别人像面，'B' - 仅识别国徽面
  enable_border_check?: string, // 身份证遮挡检测开关，如果输入图片中的身份证卡片边框不完整则返回告警
  enable_detect_copy?: string, // 复印件、翻拍件检测开关，如果输入图片中的身份证卡片是复印件，则返回告警
}
```

### IDCardDetectorRunRes

```ts
// 身份证识别响应值
interface IDCardDetectorRunRes {
  request_id?: string,
  response: {
    session_id: string, //唯一会话 id
    errorcode: number,	// 返回状态码
    errormsg: string,	// 返回错误消息
    warnmsg: Array<string>, // 多重警告码
    ocr_result: OcrResult,	// 文字识别结果
    image_result: ImageResult,	// 图片检测结果
  }
}

interface OcrResult {
  side: string	// F-身份证人像面，B-身份 证国徽面
  idno: string, // 身份号码(人像面)
  name: string, //	姓名(人像面)
  nation: string, //	民族(人像面)
  gender: string, //	性别(人像面)
  address: string, //	地址(人像面)
  birthdate: string, //	生日(人像面) eg. "19900111"
  validthru: string, //	有效期(国徽面) eg. "20001010-20101009"
  issuedby: string, //	签发机关(国徽面)
}

interface ImageResult {
  idcard: string, //	身份证区域图片，使用Base64 编码后的字符串， 是否返回由请求参数ret_image 决定
  portrait: string, //	身份证人像照片，使用Base64 编码后的字符串， 是否返回由请求参数ret_portrait 决定
  idcard_bbox: Array<Array<number>>, //	框坐标，格式为 [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]
}
```

### TextToSpeakParams

```ts
// 文字转语音声效枚举
enum Speaker {
  Male1 = 'male1', // 男声1
  Male2 = 'male2', // 男声2
  Female3 = 'female3', // 女声3
  Male4 = 'male4', // 男声4
  Female5 = 'female5', // 女声5
  Female6 = 'female6', // 女声6
  Kefu1 = 'kefu1', // 客服1
  Girl1 = 'girl1', // 女孩1
}

// tts 音频编码格式枚举
enum AudioEncoding {
  Wav = 'wav',
  Pcm = 'pcm',
  Mp3 = 'mp3',
}

/**
 * 文字转语音参数
 */
interface TextToSpeakParams {
  text: string; // 需要进⾏语⾳合成的⽂本内容，最短1个字，最⻓200字
  speaker?: Speaker; // 发⾳⼈id，⽤于选择不同⻛格的⼈声，⽬前默认为kefu1， 可选的包括female3，female5，female6，male1，male2， male4，kefu1，girl1
  audio_encoding?: AudioEncoding; // 合成⾳频格式，⽬前默认为wav，可选的包括wav，pcm，mp3
  sample_rate?: number; // 合成⾳频的采样率，默认为16000，可选的包括8000，16000， 24000，48000
  volume?: number; // ⾳量⼤⼩，取值范围为0~100，默认为50
  speed?: number; // 语速，取值范围为-100~100，默认为0
}
```

### TextToSpeakRes

```ts
/**
 * 文字转语音响应值
 */
interface TextToSpeakRes {
  request_id?: string; // 请求唯一 id
  response: {
    voice_id?: string; // 声音唯一 id
    error_code?: number; // 返回状态码，详见状态码表格
    err_msg?: number; // 状态码对应错误信息
    audio?: string; // 合成的音频，采用 base64 编码
  }
}
```

### FaceActionLiveDetectorParams

```ts
/**
 * 动作的标示字符串
 */
enum ActionType {
  Nod = 'nod',
  Shake = 'shake',
  Blink = 'blink',
  Mouth = 'mouth'
}

/**
 * 视频格式，1 表示 mp4, 2 表示 h264，默认值为 1
 */
export enum VideoType {
  Mp4 = 1,
  H264
}

/**
 * 动作活体检测参数
 */
interface FaceActionLiveDetectorParams {
  action_types: ActionType[];
  video_type?: VideoType; // 选择录制的格式
  debug?: boolean; // 是否开启 debug，开启 debug 的记录目前会在数据库里面保存 12 小时
}
```

### FaceActionLiveDetectorRes

```ts
/**
 * 动作活体检测响应体
 */
interface FaceActionLiveDetectorRes {
  request_id: string;
  response: FaceActionLiveResData;
}

/**
 * 动作活体检测响应值
 */
interface FaceActionLiveResData {
  best_frames: BestFrame[]; // 最优帧列表，列表中每个元素格式是 json，包括 base64 编码的二进制图片数据和图像质量分数
  errorcode: number;
  errormsg: string;
  live_status: number; // 返回动作活体状态码，1 表示通过，0 表示不通过
  session_id: string; // 唯一会话 id
}

/**
 * 最优帧列表，列表中每个元素格式是 json，
 * 包括 base64 编码的二进制图片数据和图像质量分数
 */
interface BestFrame {
  image_b64: string; // base64 编码的二进制图像数据
  quality: number; // 图像质量分数, 取值范围是[0,100]
}
```

### FaceFlashLiveDetectorRes

```ts
/**
 * 光线活体检测响应体
 */
interface FaceFlashLiveDetectorRes {
  request_id: string;
  response: FaceFlashLiveDetectorResData;
}

/**
 * 光线活体检测响应值
 */
interface FaceFlashLiveDetectorResData {
  errorcode: number;
  errormsg: string;
  face_num: number; // 视频中检测到的人脸帧数
  pass_num: number; // 视频中通过的人脸帧数
  score: number; // 活体分数 [0,100]
  session_id: string; // 唯一会话 id
}
```

### FaceComparerParams

```ts
/**
 * 人脸对比参数
 * @param rotate_A  否  bool  人脸检测失败时，是否对图像 A 做旋转再检测，旋转角包括 90、180、270 三个角度，默认值为 False
 * @param rotate_B  否  bool  人脸检测失败时，是否对图像 B 做旋转再检测，旋转角包括 90、180、270 三个角度，默认值为 False
 * @param maxface_A  否  bool  图像 A 中检测到多张人脸时是否取最大区域的人脸作为输出，默认值为 True
 * @param maxface_B  否  bool  图像 B 中检测到多张人脸时是否取最大区域的人脸作为输出，默认值为 True
 */
interface FaceComparerParams {
  rotate_A?: boolean;
  rotate_B?: boolean;
  maxface_A?: boolean;
  maxface_B?: boolean;
}
```

### FaceComparerRes

```ts
/**
 * 人脸对比响应体
 */
interface FaceComparerRes {
  request_id: string;
  response: FaceComparerResData;
}

/**
 * 人脸对比响应体数据
 */
interface FaceComparerResData {
  errorcode: number;
  errormsg: string;
  session_id: string; // 唯一会话 id
  similarity: number; // 两个 face 的相似度, 取值范围为[0,100]
}
```

### FaceDetectorParams

```ts
/**
 * 人脸检测参数
 * @param rotate-人脸检测失败时，是否对图像 A 做旋转再检测，旋转角包 括 90、180、270 三个角度，默认值为false
 */
interface FaceDetectorParams {
  rotate?: boolean;
}
```

### FaceDetectorRes

```ts
/**
 * 人脸检测响应体
 */
interface FaceDetectorRes {
  request_id: string;
  response: FaceDetectorResData;
}

/**
 * 人脸检测响应值
 * @param num_face int 图像中人脸数量
 * @param rotangle float 图像旋转角度
 * @param face []faceItem [face1,face2,…]，其中 face1,face2,…等为 json 格式，具体格式见下表
 * @param errorcode  int  返回状态码
 * @param errormsg  string  返回错误消息
 */
export interface FaceDetectorResData {
  errorcode: number;
  errormsg: string;
  face: FaceItem[];
  num_face: number;
  rotate_angle: number;
  session_id: string;
}

/**
 * faceItem
 * @param blur  float  人脸模糊度，取值范围[0,1]，越大越清晰
 * @param gender  string  性别，’M’代表男，’F’代表女
 * @param age  int  年龄，区间 1-107 岁
 * @param illumination  float  人脸光照范围，取值范围[0,100]，越大光照质量越好
 * @param facesize  float  人脸尺寸分数，取值分数[0,100]， 越大人脸尺寸越大
 * @param quality  float  人脸综合质量分数，取值范围[0,100], 越大质量越好
 * @param eye  flaot  闭眼概率,取值范围[0,100]
 * @param mouth  float  闭嘴概率,取值范围[0,100]
 * @param pitch  float  三维旋转之俯仰角，[-180,180]
 * @param roll  float  三维旋转之旋转角，[-180,180]
 * @param yaw  float  三维旋转之左右旋转角, [-180,180]
 * @param completeness  int  取值0到100；0表示人脸不完整，溢出了图像边界，100 表示人脸是完整的，在图像边界内
 * @param area  int  人脸区域的大小
 * @param face_aligned_b64  string  使用 base64 编码的对齐后人脸图片数据
 * @param score  float  人脸分数 取值范围 [0,100]
 * @param x  int  人脸框的左上角 x 坐标
 * @param y  int  人脸框的左上角 y 坐标
 * @param width  int  人脸框的宽度
 * @param height  int  人脸框的高度
 * @param face_shape  json  人脸 106 个关键点坐标，包含 face_profile，left_eye, left_eyebrow，right_eye，right_eyebrow，mouth，nose，pupil 等组件，每个组件都是一个 json
 */
interface FaceItem {
  score: number;
  x: number;
  y: number;
  width: number;
  height: number;
  pitch: number;
  yaw: number;
  roll: number;
  eye: number;
  mouth: number;
  blur: number;
  gender: string;
  age: number;
  illumination: number;
  face_shape: FaceShape;
  completeness: number;
  area: number;
  facesize: number;
  quality: number;
  face_aligned_b64: string;
}

/**
 * @param face_shape  json
 * 人脸 106 个关键点坐标，
 * 包含 face_profile，left_eye, left_eyebrow，right_eye，right_eyebrow，mouth，nose，pupil 等组件
 */
interface FaceShape {
  face_profile: FaceProfile[];
  left_eye: FaceProfile[];
  left_eyebrow: FaceProfile[];
  right_eye: FaceProfile[];
  right_eyebrow: FaceProfile[];
  mouth: FaceProfile[];
  nose: FaceProfile[];
  pupil: FaceProfile[];
}

interface FaceProfile {
  x: number;
  y: number;
}
```

### QNAuthoritativeFaceParams

```ts
// 权威人脸比对请求参数
interface QNAuthoritativeFaceParams {
  realname: string; // 真实名字
  idcard: string; // 身份证号
}
```

### QNAuthoritativeFaceResult

```ts
// 权威人脸比对响应值
interface QNAuthoritativeFaceResult {
  request_id: string; // 请求id
  response: { 
    session_id: string; // 会话id
    similarity: number; // 人脸比对相似度。 71大约千分之一误识率，79大约万分之一误识率
    errorcode: number; // 返回状态码
    errormsg: string; // 返回错误消息
  }
}
```

### QNOCRDetectorResult

```ts
// ocr识别响应值
interface QNOCRDetectorResult {
  request_id: string; // 请求id
  response: {
    code: number; // 错误码
    message: string; // 错误消息
    data: Array<{
      line: number; // 文字所在行
      bbox: [number, number][]; // 文本框坐标
      text: string; // 文本内容
      score: number; // 识别置信度
    }>
  }
}
```

## 错误码

```ts
业务错误码	信息

// 通用:
0	成功
1000	未知异常
1001	音频/视频轨道没有数据返回
1002	音频/视频数据异常

// 语音转文字:
2000	网络异常连接中断

// 身份证识别:
53090001	请求解析失败
53090002	图片解码错误
53090003	OCR 内部错误
53090004	无法识别的身份证(非中国身份证等)
53090005	参数错误
55060030	鉴权失败
53091001	黑白复印件
53091003	无法检测到人脸
53091004	证件信息缺失或错误
53091005	证件过期
53091006	身份证不完整

// 人脸检测:
55060001	请求字段有非法传输
55060002	图片解码失败
55060006	人脸特征提取失败
55060018	人脸配准失败
55060019	人脸检测图片 Base64 解码失败
55060033	人脸图片无效

// 人脸对比:
55060001	请求字段有非法传输
55060002	图片解码失败
55060028	人脸比对图片 A Base64 解码失败
55060029	人脸比对图片 B Base64 解码失败
55060040	图片A人脸检测失败
55060041	图片B人脸检测失败

// 动作活体检测:
55060001	请求字段有非法传输
55060002	图片解码失败
55060012	点头动作检测失败
55060013	摇头动作检测失败
55060014	眨眼动作检测失败
55060015	张嘴动作检测失败
55060016	不是活体
55060024	视频帧率过低
55060016	动作类型无效

// 光线活体
55060001    请求字段有非法传输
55060002	图片解码失败
55060009	视频无效
55060011	视频中人脸检测失败
55060016	不是活体

// 文转音
100        请求参数缺失
101        请求参数不合法，⽐如合成⽂本过⻓
102        服务不可⽤
103        语⾳合成错误

// 权威人脸对比
55060001    请求字段有非法传输
55060004    高清照人脸检测失败
55060006    人脸特征提取失败
55060019    人脸检测图片 Base64 解码失败
55060029    人脸鉴别失败
55060044    姓名格式不正确
55060045    身份证号码有误
55060046    照片大小不在1kb-30kb的范围内
55060047    认证信息不存在
55060048    证件照不存在
55060049    照片质量检验不合格
55060050    照片出现多张人脸
```

