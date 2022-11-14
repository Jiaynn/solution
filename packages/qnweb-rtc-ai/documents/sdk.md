# 开发准备

  ## 引入 sdk

我们提供了两种方式引入方式，您可以直接下载 JS 文件，也可以通过 npm 完成引入

  ### NPM 安装

运行下方的命令即可通过 npm 引入我们的 SDK

```shell
$ npm install qnweb-rtc-ai
```
如果想要更新到最新版本或者指定版本，运行下列命令

```shell
$ npm install qnweb-rtc-ai@latest
$ npm install qnweb-rtc-ai@2.0.0   # 指定版本
```

  ### 直接导入 JS 文件

每次发布版本，我们都会将最新的 SDK JS 文件放在我们的 [Github](https://github.com/pili-engineering/QNWebRTCAISDK) 上，点击链接即可获取当前最新的 SDK JS 文件。 所以，每次想要升级版本时，只需要访问我们的 [Github](https://github.com/pili-engineering/QNWebRTCAISDK) 页面，然后替换一下自己的 js 文件即可。

SDK 的 JS 文件在导入页面后，会自动创建一个全局对象 QNRTCAI，这个对象的成员包括了 SDK 所导出的所有模块和对象。

```ts
// 当页面资源加载完成后
window.onload = () => {
  console.log("current version is", QNRTCAI.version);
}
```

运行时看到打印的 current version 表示引入成功。

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
    onAudioToText: (result) => {
      console.log('result', result)
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
QNRTCAI.IDCardDetector.run(videoTrack).then(result => {
  console.log('result', result);
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
    onAudioToText: result => {
    	console.log('result', result);
    }
  }
);
audioAnalyzer.getStatus(); // 获取当前状态
audioAnalyzer.stopAudioToText(); // 结束语音识别
```

#### 方法

| 方法                    | 类型                                                         | 说明             |
| ----------------------- | ------------------------------------------------------------ | ---------------- |
| static startAudioToText | (audioTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), params: [AudioToTextAnalyzerParams](#AudioToTextAnalyzerParams), callback: [AudioToTextAnalyzerCallback](#AudioToTextAnalyzerCallback)) => [AudioToTextAnalyzer](#AudioToTextAnalyzer) | 开始语音实时识别 |
| getStatus               | () => [AudioToTextAnalyzerStatus](#AudioToTextAnalyzerStatus) | 获取当前状态     |
| stopAudioToText         | () => void                                                   | 停止语音实时识别 |

### IDCardDetector

#### 如何使用

```ts
QNRTCAI.IDCardDetector
  .run(videoTrack)
  .then(res => console.log(res))
```

#### 方法

| 方法                 | 类型                                                         | 说明                                                    |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| static run(静态方法) | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), params?: [IDCardDetectorRunParams](#idcarddetectorrunparams) => Promise<[IDCardDetectorRunRes](#idcarddetectorrunRes)> | 身份证信息识别，返回的是一个promise，得到识别出来的信息 |

### textToSpeak

#### 如何使用

```ts
QNRTCAI.textToSpeak({ content: text }).then(result => {
  if (result.response.code === 0) {
    const snd = new Audio(result.response.result.audioUrl);
    return snd.play().catch(error => {
      console.log('error', error)
    });
  }
});
```

#### 方法

| 方法        | 类型                                                         | 说明       |
| ----------- | ------------------------------------------------------------ | ---------- |
| textToSpeak | (params: [QNVoiceTtsParams](#QNVoiceTtsParams))) => Promise<[QNVoiceTtsResult](#QNVoiceTtsResult)> | 文字转语音 |

### FaceActionLiveDetector

#### 如何使用

```ts
const client = QNRTCAI.FaceActionLiveDetector.create(); // 创建检测器实例

client.getRequestCode()
  .then(result => {
    // 先获取动作识别的验证码
    // 然后根据验证码调用 start 开始检测，并做出相应的动作
    const { code, session_id } = result.response.result;
    client.start(localCameraTrack, {
      session_id
    });
  
    // ...
  })
  .then(() => {
    // 结束检测
    return client.commit();
  })
  .then(result => {
    console.log('result', result);
  })
```

#### 方法

| 方法           | 类型                                                         | 说明                   |
| -------------- | ------------------------------------------------------------ | ---------------------- |
| static create  | () => [FaceActionLiveDetector](#FaceActionLiveDetector)      | 创建检测器（创建实例） |
| getRequestCode | (params?: [QNFaceActliveSessionParams](#QNFaceActliveSessionParams)) => Promise\<[QNFaceActliveSessionResult](#QNFaceActliveSessionResult)\> | 获取检测校验码         |
| start          | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), params?: [FaceActionLiveDetectorParams](#faceactionlivedetectorparams)) => [FaceActionLiveDetector](#FaceActionLiveDetector) | 开始检测               |
| commit         | () => Promise\<[FaceActionLiveDetectorResult](#FaceActionLiveDetectorResult)\> | 结束检测并响应数据     |

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
QNRTCAI.faceComparer(localCameraTrack, {
  image: '...',
  image_type: 'BASE64',
}).then(result => {
  console.log('result', result);
}).catch(error => {
  console.log('error', error);
});
```

#### 方法

| 方法         | 类型                                                         | 说明     |
| ------------ | ------------------------------------------------------------ | -------- |
| faceComparer | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), params: [FaceComparerParams](#FaceComparerParams)) => Promise\<[FaceComparerResult](#FaceComparerResult)\> | 人脸对比 |

### faceDetector

#### 如何使用

```ts
QNRTCAI.faceDetector(videoTrack).then(result => {
  console.log('result', result);
});
```

#### 方法

| 方法         | 类型                                                         | 说明     |
| ------------ | ------------------------------------------------------------ | -------- |
| faceDetector | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), params: [FaceDetectorParams](#facedetectorparams) => Promise\<[FaceDetectorResult](#FaceDetectorResult)\> | 人脸检测 |

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
const client = QNRTCAI.QNAuthorityActionFaceComparer.create(); // 创建实例

client.getRequestCode()
  .then(result => {
    // 先获取动作识别的验证码
    // 然后根据传入身份证、姓名、以及验证码调用 start 开始检测，并做出相应的动作
    const { code, session_id } = result.response.result;
    client.start(localCameraTrack, {
      session_id
    }, {
      realname: '...',
      idcard: '...'
    });
  
    // ...
  })
  .then(() => {
    // 结束检测
    return client.commit();
  })
  .then(result => {
    console.log('result', result);
  })
```

#### 方法

| 方法           | 类型                                                         | 说明                   |
| -------------- | ------------------------------------------------------------ | ---------------------- |
| static create  | () => [QNAuthorityActionFaceComparer](#QNAuthorityActionFaceComparer) | 创建检测器（创建实例） |
| getRequestCode | () => Promise\<[QNFaceActliveSessionResult](#QNFaceActliveSessionResult)\> | 获取校验码             |
| start          | (videoTrack: [Track](https://doc.qnsdk.com/rtn/web/docs/api_track), faceActionParams: [FaceActionLiveDetectorParams](#faceactionlivedetectorparams), authoritativeFaceParams: [QNAuthoritativeFaceParams](#qnauthoritativefaceparams)) => [QNAuthorityActionFaceComparer](#QNAuthorityActionFaceComparer) | 开始检测               |
| commit         | () => Promise<{   faceActionResult: [FaceActionLiveDetectorResult](#FaceActionLiveDetectorResult);   authoritativeFaceResult: [QNAuthoritativeFaceResult](#qnauthoritativefaceresult); } | 结束检测并响应数据     |

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

### FaceDetectorParams

```ts
interface FaceDetectorParams {
  /**
   * 包括`age,expression,face_shape,gender,glasses,landmark,landmark150,quality,eye_status,emotion,face_type,mask,spoofing`信息逗号分隔.
   * 默认只返回`face_token、人脸框、概率和旋转角度`
   */
  face_field?: string;
  /**
   * 最多处理人脸的数目，默认值为1，根据人脸检测排序类型检测图片中排序第一的人脸（默认为人脸面积最大的人脸），最大值120
   */
  max_face_num?: number;
  /**
   * 活体检测控制
   * **NONE**: 不进行控制
   * **LOW**:较低的活体要求(高通过率 低攻击拒绝率)
   * **NORMAL**: 一般的活体要求(平衡的攻击拒绝率, 通过率)
   * **HIGH**: 较高的活体要求(高攻击拒绝率 低通过率)
   * 默认 `NONE`
   * 若活体检测结果不满足要求，则返回结果中会提示活体检测失败
   */
  liveness_control?: string;
  /**
   * 人脸检测排序类型
   * **0**:代表检测出的人脸按照人脸面积从大到小排列
   * **1**:代表检测出的人脸按照距离图片中心从近到远排列
   * 默认为0
   */
  face_sort_type?: number;
  /**
   * 是否显示检测人脸的裁剪图base64值
   * 0：不显示（默认）
   * 1：显示
   */
  display_corp_image?: number;
  /**
   * 压缩的宽
   */
  captureWidth?: number;
  /**
   * 压缩的高
   */
  captureHeight?: number;
  /**
   * 压缩质量
   */
  captureQuality?: number;
}
```

### FaceDetectorResult

```ts
interface FaceDetectorResult {
  request_id?: string;
  response?: {
    /**
     * 错误码
     */
    error_code?: number;
    /**
     * 错误信息
     */
    error_msg?: string;
    /**
     * 请求ID
     */
    log_id?: number;
    /**
     * 请求结果
     */
    result?: QNDetectResult;
  };
}
```

### QNDetectResult

```ts
interface QNDetectResult {
  /**
   * 检测到的图片中的人脸数量
   */
  face_num?: number;
  /**
   * 人脸信息列表，具体包含的参数参考下面的列表。
   */
  face_list?: QNFaces[];
}
```

### QNFaces

```ts
interface QNFaces {
  /**
   * 人脸图片的唯一标识
   */
  face_token?: string;
  /**
   * 人脸在图片中的位置
   */
  location?: QNFaceLocation;
  /**
   * 检测人脸框的人脸图片base64值
   */
  corp_image_base64?: string;
  /**
   * 人脸置信度，范围【0~1】，代表这是一张人脸的概率，0最小、1最大。其中返回0或1时，数据类型为Integer
   */
  face_probability?: number;
  /**
   * 人脸旋转角度参数
   */
  angle?: QNFaceAngle;
  /**
   * 年龄 ，当face_field包含age时返回
   */
  age?: number;
  /**
   * 表情，当 face_field包含expression时返回
   */
  expression?: {
    /**
     * none:不笑；smile:微笑；laugh:大笑
     */
    type?: string;
    /**
     * 表情置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 脸型，当face_field包含face_shape时返回
   */
  face_shape?: {
    /**
     * square: 正方形 triangle:三角形 oval: 椭圆 heart: 心形 round: 圆形
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 性别，face_field包含gender时返回
   */
  gender?: {
    /**
     * male:男性 female:女性
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 是否带眼镜，face_field包含glasses时返回
   */
  glasses?: {
    /**
     * none:无眼镜，common:普通眼镜，sun:墨镜
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 双眼状态（睁开/闭合） face_field包含eye_status时返回
   */
  eye_status?: {
    /**
     * 左眼状态 [0,1]取值，越接近0闭合的可能性越大
     */
    left_eye?: number;
    /**
     * 右眼状态 [0,1]取值，越接近0闭合的可能性越大
     */
    right_eye?: number;
  };
  /**
   * 情绪 face_field包含emotion时返回
   */
  emotion?: {
    /**
     * angry:愤怒 disgust:厌恶 fear:恐惧 happy:高兴 sad:伤心 surprise:惊讶 neutral:无表情 pouty: 撅嘴 grimace:鬼脸
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 真实人脸/卡通人脸 face_field包含face_type时返回
   */
  face_type?: {
    /**
     * human: 真实人脸 cartoon: 卡通人脸
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 口罩识别 face_field包含mask时返回
   */
  mask?: {
    /**
     * 没戴口罩/戴口罩 取值0或1 0代表没戴口罩 1 代表戴口罩
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 4个关键点位置，左眼中心、右眼中心、鼻尖、嘴中心。face_field包含landmark时返回
   */
  landmark?: Array<{
    x?: number;
    y?: number
  }>;
  /**
   * 72个特征点位置 face_field包含landmark时返回
   */
  landmark72?: Array<{
    x?: number;
    y?: number
  }>;
  /**
   * 150个特征点位置 face_field包含landmark150时返回
   */
  landmark150?: Array<{
    x?: number;
    y?: number
  }>;
  /**
   * 人脸质量信息。face_field包含quality时返回
   */
  quality?: QNFaceQuality;
  /**
   * 判断图片是否为合成图
   */
  spoofing?: number;
}
```

### QNFaceLocation

```ts
interface QNFaceLocation {
  /**
   * 人脸区域离左边界的距离
   */
  left?: number;
  /**
   * 人脸区域离上边界的距离
   */
  top?: number;
  /**
   * 人脸区域的宽度
   */
  width?: number;
  /**
   * 人脸区域的高度
   */
  height?: number;
  /**
   * 人脸框相对于竖直方向的顺时针旋转角，[-180,180]
   */
  rotate?: number;
}
```

### QNFaceAngle

```ts
interface QNFaceAngle {
  /**
   * 三维旋转之左右旋转角[-90(左), 90(右)]
   */
  yaw?: number;
  /**
   * 三维旋转之俯仰角度[-90(上), 90(下)]
   */
  pitch?: number;
  /**
   * 平面内旋转角[-180(逆时针), 180(顺时针)]
   */
  roll?: number;
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

### AudioToTextAnalyzerParams

```ts
interface AudioToTextAnalyzerParams { 
  /**
   * 数据格式，1: pcm，2: AAC，3: MPEG2;默认1
   */
  aue?: number,
  /**
   * 数据采样率，取值: 48000, 44100, 32000, 16000, 8000;默认16000
   */
  voice_sample?: number,
  /**
   * 识别语言，中文: 1, 英文: 2, 中英混合: 0; 默认 1
   */
  model_type?: number,
  /**
   * 数据流id，不同流不同
   */
  voice_id?: string,
  /**
   * 识别关键字; 相同读音时优先识别为关键字。每个词 2-4 个字, 不同词用 `,` 分割
   */
  key_words?: string[],
  /**
   * 请求时间戳, 单位秒
   */
  e?: number 
}
```

### AudioToTextAnalyzerCallback

```ts
/**
 * 语音识别的回调
 */
interface AudioToTextAnalyzerCallback {
  /**
   * 连接状态变化
   * @param status
   * @param msg
   */
  onStatusChange?: (status: AudioToTextAnalyzerStatus, msg: string) => void,
  /**
   * 实时转化文字数据
   * @param result
   */
  onAudioToText?: (result: AudioToTextAnalyzerResult) => void
}
```

### AudioToTextAnalyzerStatus

```ts
enum AudioToTextAnalyzerStatus {
  AVAILABLE, // 未开始可用
  DESTROY, // 已经销毁不可用
  ERROR, // 连接异常断线
  DETECTING // 正在实时转化
}
```

### AudioToTextAnalyzerResult

```ts
interface AudioToTextAnalyzerResult {
  /**
   * 此识别结果是否为最终结果
   */
  isFinal: boolean;
  /**
   * 此识别结果是否为第一片
   */
  isBegin: boolean;
  /**
   * 最好的转写候选
   */
  bestTranscription: QNStreamingTranscription;
}
```

### QNStreamingTranscription

```ts
interface QNStreamingTranscription {
  /**
   * 转写结果
   */
  transcribedText: string;
  /**
   * 句子的开始时间, 单位毫秒
   */
  beginTimestamp: number;
  /**
   * 句子的结束时间, 单位毫秒
   */
  endTimestamp: number;
  /**
   * 转写结果中包含KeyWords内容
   */
  keyWordsType: QNKeyWordsType[];
  /**
   * 转写结果的分解（只对final状态结果有效，返回每个字及标点的详细信息）
   */
  piece: QNPiece[];
}
```

### QNKeyWordsType

```ts
interface QNKeyWordsType {
  /**
   * 命中的关键词KeyWords。返回不多于10个。
   */
  keyWords: string;
  /**
   * 命中的关键词KeyWords相应的分数。分数越高表示和关键词越相似，对应kws中的分数。
   */
  keyWordsScore: number;
  /**
   * 关键词结束时间, 单位毫秒
   */
  endTimestamp: number;
  /**
   * 关键词开始时间, 单位毫秒
   */
  beginTimestamp: number;
}
```

### QNPiece

```ts
interface QNPiece {
  /**
   * 转写分解结果。
   */
  transcribedText: string;
  /**
   * 分解结束时间(音频开始时间为0), 单位毫秒
   */
  endTimestamp: number;
  /**
   * 分解开始时间(音频开始时间为0), 单位毫秒
   */
  beginTimestamp: number;
}
```

### QNVoiceTtsParams

```ts
interface QNVoiceTtsParams {
  /**
   * TTS 发音人标识音源 id 0-6,实际可用范围根据情况, 可以不设置,默认是 0;
   * 其中0：女声（柔和）；1，女声（正式）；2，女生（柔和带正式）；3：男声（柔和），4：男声（柔和带正式）；5：男声（闽南话）；6：女生（闽南话）。
   */
  spkid?: number;
  /**
   * 需要进行语音合成的文本内容，最短1个字，最长200字
   */
  content: string;
  /**
   * 可不填，不填时默认为 3。
   * audioType=3 返回 16K 采样率的 mp3
   * audioType=4 返回 8K 采样率的 mp3
   * audioType=5 返回 24K 采样率的 mp3
   * audioType=6 返回 48k采样率的mp3
   * audioType=7 返回 16K 采样率的 pcm 格式
   * audioType=8 返回 8K 采样率的 pcm 格式
   * audioType=9 返回 24k 采样率的pcm格式
   * audioType=10 返回  8K 采样率的 wav 格式
   * audioType=11 返回 16K 采样率的 wav 格式
   */
  audioType?: number;
  /**
   * 音量大小，取值范围为 0.75 - 1.25，默认为1
   */
  volume?: number;
  /**
   * 语速，取值范围为 0.75 - 1.25，默认为1
   */
  speed?: number;
}
```

### QNVoiceTtsResult

```ts
interface QNVoiceTtsResult {
  request_id?: string;
  response?: {
    /**
     * 错误信息
     */
    msg: string;
    /**
     * 错误码
     * | code | 说明 |
     * | :--- | :--- |
     * | 0    | 成功 |
     */
    code: string;
    result: {
      /**
       * 合成音频的下载地址
       */
      audioUrl: string;
    };
  };
}
```

### QNFaceActliveSessionParams

```ts
interface QNFaceActliveSessionParams {
  /**
   * 视频动作活体的验证码最小长度：最大3 最小1 默认1
   */
  min_code_length?: number;
  /**
   * 视频动作活体的验证码最大长度：最大3 最小1 默认3
   */
  max_code_length?: number;
}
```

### QNFaceActliveSessionResult

```ts
interface QNFaceActliveSessionResult {
  request_id?: string;
  response?: {
    /**
     * 错误码
     */
    error_code?: number;
    /**
     * 错误信息
     */
    error_msg?: string;
    /**
     * 请求ID
     */
    serverlogid?: number;
    /**
     * 请求结果
     */
    result?: QNSessionResult;
  };
}
```

### QNSessionResult

```ts
interface QNSessionResult {
  /**
   * 随机校验码会话id，有效期5分钟
   * 请提示用户在五分钟内完成全部操作验证码使用过即失效
   * 每次使用视频活体前请重新拉取验证码
   */
  session_id?: string;
  /**
   * 随机验证码，数字形式，1~6位数字；
   * 若为动作活体时，返回数字表示的动作对应关系为：
   * 0:眨眼 4:抬头 5:低头 7:左右转头(不区分先后顺序，分别向左和向右转头)
   */
  code?: string;
}
```

### FaceActionLiveDetectorParams

```ts
interface FaceActionLiveDetectorParams {
  /**
   * 会话ID, 获取方式参考随机校验码接口
   */
  session_id?: string;
  /**
   * base64 编码的视频数据（编码前建议先将视频进行转码，h.264编码，mp4封装）
   * 需要注意的是，视频的base64编码是不包含视频头的，如 data:video/mp4;base64,；
   * 建议视频长度控制在01s-10s之间，
   * 视频大小建议在2M以内（视频大小强制要求在20M以内，推荐使用等分辨率压缩，压缩分辨率建议不小于640*480）
   * 视频大小分辨率建议限制在16~2032之间
   */
  face_field?: string;
  /**
   * 采集质量控制 - 视频宽
   */
  encodeWidth?: number;
  /**
   * 采集质量控制 - 视频高
   */
  encodeHeight?: number;
  /**
   * 采集质量控制 - 码率 码率越高识别结果越准确同时请求相应时间变长
   */
  encodeBitRate?: number;
  /**
   * 采集质量控制 - 帧率
   */
  encodeFPS?: number;
}
```

### FaceActionLiveDetectorResult

```ts
interface FaceActionLiveDetectorResult {
  request_id?: string;
  response?: {
    /**
     * 错误码
     */
    error_code?: number;
    /**
     * 错误信息
     */
    error_msg?: string;
    /**
     * 请求ID
     */
    serverlogid?: number;
    /**
     * 请求结果
     */
    result?: QNVerifyResult;
  };
}
```

### QNVerifyResult

```ts
interface QNVerifyResult {
  /**
   * 活体检测的总体打分 范围[0,1]，分数越高则活体的概率越大
   */
  score?: number;
  /**
   * 返回的1-8张图片中合成图检测得分的最大值 范围[0,1]，分数越高则概率越大
   */
  maxspoofing?: number;
  /**
   * 返回的1-8张图片中合成图检测得分的中位数 范围[0,1]，分数越高则概率越大
   */
  spoofing_score?: number;
  /**
   * 阈值 按活体检测分数>阈值来判定活体检测是否通过(阈值视产品需求选择其中一个)
   */
  thresholds?: QNThresholds;
  /**
   * 动作识别结果 pass代表动作验证通过，fail代表动作验证未通过
   */
  action_verify?: string;
  /**
   * 图片信息
   */
  best_image?: QNImage;
  /**
   * 返回1-8张抽取出来的图片信息
   */
  pic_list?: QNImage[];
}
```

### QNThresholds

```ts
interface QNThresholds {
  /**
   * 万分之一误拒率的阈值
   */
  'frr_1e-4'?: number;
  /**
   * 千分之一误拒率的阈值
   */
  'frr_1e-3'?: number;
  /**
   * 百分之一误拒率的阈值
   */
  'frr_1e-2'?: number;
}
```

### QNImage

```ts
interface QNImage {
  /**
   * base64编码后的图片信息
   */
  pic?: string;
  /**
   * 此图片的活体分数，范围[0,1]
   */
  liveness_score?: number;
  /**
   * 人脸图片的唯一标识
   */
  face_token?: string;
  /**
   * 此图片的合成图分数，范围[0,1]
   */
  spoofing?: number;
  /**
   * 人脸质量信息。face_field包含quality时返回
   */
  quality?: QNFaceQuality;
}
```

### QNFaceQuality

```ts
interface QNFaceQuality {
  /**
   * 人脸各部分遮挡的概率，范围[0~1]，0表示完整，1表示不完整
   */
  occlusion?: QNFaceQualityOcclusion;
  /**
   * 人脸模糊程度，范围[0~1]，0表示清晰，1表示模糊
   */
  blur?: number;
  /**
   * 取值范围在[0~255], 表示脸部区域的光照程度 越大表示光照越好
   */
  illumination?: number;
  /**
   * 人脸完整度，0或1, 0为人脸溢出图像边界，1为人脸都在图像边界内
   */
  completeness?: number;
}
```

### QNFaceQualityOcclusion

```ts
interface QNFaceQualityOcclusion {
  /**
   * 左眼遮挡比例，[0-1] ，1表示完全遮挡
   */
  left_eye?: number;
  /**
   * 右眼遮挡比例，[0-1] ，1表示完全遮挡
   */
  right_eye?: number;
  /**
   * 鼻子遮挡比例，[0-1] ，1表示完全遮挡
   */
  nose?: number;
  /**
   * 嘴遮挡比例，[0-1] ，1表示完全遮挡
   */
  mouth?: number;
  /**
   * 左脸颊遮挡比例，[0-1] ，1表示完全遮挡
   */
  left_cheek?: number;
  /**
   * 右脸颊遮挡比例，[0-1] ，1表示完全遮挡
   */
  right_cheek?: number;
  /**
   * 下巴遮挡比例，[0-1] ，1表示完全遮挡
   */
  chin?: number;
}
```

### FaceComparerParams

```ts
interface FaceComparerParams {
  /**
   * 图片信息(总数据大小应小于10M，图片尺寸在1920x1080以下)
   */
  image?: string;
  /**
   * 图片类型
   * **BASE64**:图片的base64值，base64编码后的图片数据，编码后的图片大小不超过2M
   * **URL**:图片的 URL地址( 可能由于网络等原因导致下载图片时间过长)
   */
  image_type?: string;
  /**
   * 人脸的类型
   * **LIVE**：表示生活照：通常为手机、相机拍摄的人像图片、或从网络获取的人像图片等，
   * **IDCARD**：表示身份证芯片照：二代身份证内置芯片中的人像照片，
   * **WATERMARK**：表示带水印证件照：一般为带水印的小图，如公安网小图
   * **CERT**：表示证件照片：如拍摄的身份证、工卡、护照、学生证等证件图片
   * **INFRARED**：表示红外照片,使用红外相机拍摄的照片
   * **HYBRID**：表示混合类型，如果传递此值时会先对图片进行检测判断所属类型(生活照 or 证件照)（仅针对请求参数 image_type 为 BASE64 或 URL 时有效）
   * 默认`LIVE`
   */
  face_type?: string;
  /**
   * 图片质量控制
   * **NONE**: 不进行控制
   * **LOW**:较低的质量要求
   * **NORMAL**: 一般的质量要求
   * **HIGH**: 较高的质量要求
   * 默认 `NONE`
   * 若图片质量不满足要求，则返回结果中会提示质量检测失败
   */
  quality_control?: string;
  /**
   * 活体检测控制
   * **NONE**: 不进行控制
   * **LOW**:较低的活体要求(高通过率 低攻击拒绝率)
   * **NORMAL**: 一般的活体要求(平衡的攻击拒绝率, 通过率)
   * **HIGH**: 较高的活体要求(高攻击拒绝率 低通过率)
   * 默认 `NONE`
   * 若活体检测结果不满足要求，则返回结果中会提示活体检测失败
   */
  liveness_control?: string;
  /**
   * 人脸检测排序类型
   * **0**:代表检测出的人脸按照人脸面积从大到小排列
   * **1**:代表检测出的人脸按照距离图片中心从近到远排列
   * 默认为`0`
   */
  face_sort_type?: number;
  /**
   * 合成图控制参数
   * **NONE**: 不进行控制
   * **LOW**:较低的合成图阈值数值，由于合成图判定逻辑为大于阈值视为合成图攻击，该项代表低通过率、高攻击拒绝率
   * **NORMAL**: 一般的合成图阈值数值，由于合成图判定逻辑为大于阈值视为合成图攻击，该项代表平衡的攻击拒绝率, 通过率
   * **HIGH**: 较高的合成图阈值数值，由于合成图判定逻辑为大于阈值视为合成图攻击，该项代表高通过率、低攻击拒绝率
   * 默认为`NONE`
   */
  spoofing_control?: string;
   /**
   * 压缩的宽
   */
  captureWidth?: number;
  /**
   * 压缩的高
   */
  captureHeight?: number;
   /**
   * 压缩质量
   */
  captureQuality?: number;
}
```

### FaceComparerResult

```ts
interface FaceComparerResult {
  request_id?: string;
  response?: {
    /**
     * 错误码
     */
    error_code?: number;
    /**
     * 错误信息
     */
    error_msg?: string;
    /**
     * 请求ID
     */
    log_id?: number;
    /**
     * 请求结果
     */
    result?: QNCompareResult;
  };
}
```

### QNCompareResult

```ts
interface QNCompareResult {
  /**
   * 人脸相似度得分，推荐阈值80分
   */
  score?: number;
  /**
   * 人脸信息列表
   */
  face_list?: Array<{
    /**
     * 人脸的唯一标志
     */
    face_token?: string;
  }>;
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

