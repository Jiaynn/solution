# qnweb-exam-sdk

监考系统 High Level SDK

## 如何安装

```shell
$ pnpm add qnweb-exam-sdk
```

## 文档

通过以下命令会使用typedoc来自动生成api文档并预览

```shell
# 生成文档
$ pnpm doc:build
# 预览文档
$ pnpm doc:preview
```

## 快速开始

```ts
import { QNExamClient } from 'qnweb-exam-sdk';

const client = QNExamClient.create();

// 检测设备是否开启以及SDK是否支持
client.test().then(result => {
  console.log('test result', result);
});

// 开始监考
// 创建媒体设备
const camera = QNCamera.create({
  elementId: 'pc-camera',
});
const microphone = QNMicrophone.create();
const screen = QNScreen.create();
// 创建检测器
const browserTabDetector = QNBrowserTabDetector.create();
const userTakerDetector = QNUserTakerDetector.create({
  interval: 3000,
  idCard: 'xxxxxxx',
  realName: 'xxxxxxx',
});
const multiplePeopleDetector = QNMultiplePeopleDetector.create({
  interval: 3000
});
// 注册回调监听
userTakerDetector.on(result => { console.log('userTakerDetector result', result) });
browserTabDetector.on(result => { console.log('browserTabDetector result', result) });
multiplePeopleDetector.on(result => { console.log('multiplePeopleDetector result', result) });
// 将设备id与设备进行绑定
examClient.registerDevice('camera', camera);
examClient.registerDevice('microphone', microphone);
examClient.registerDevice('screen', screen);
// 开启检测，设备检测需要绑定到对应设备上
examClient.enable(browserTabDetector);
examClient.enable(userTakerDetector, 'camera');
examClient.enable(multiplePeopleDetector, 'camera');
// 开始监考
examClient.start({
  rtcToken: 'xxx',
  aiToken: 'xxxxxx',
  userData: 'xxxxx'
})
```

## API概览

### QNDetector

> 检测器

#### QNVideoDetector

> 视频检测器

| 类                                                    | 描述           |
| :---------------------------------------------------- | :------------- |
| [QNMultiplePeopleDetector](#qnmultiplepeopledetector) | 多人同框检测器 |
| [QNOutOfScreenDetector](#qnoutofscreendetector)       | 用户出框检测器 |
| [QNUserTakerDetector](#qnusertakerdetector)           | 用户替考检测器 |

#### QNBrowserDetector

> 键盘/浏览器检测器

| 类                                                  | 描述            |
| :-------------------------------------------------- | :-------------- |
| [QNBrowserTabDetector](#qnbrowsertabdetector)       | 浏览器tab检测器 |
| [QNKeyboardCopyDetector](#qnkeyboardcopydetector)   | 复制检测器      |
| [QNKeyboardCutDetector](#qnkeyboardcutdetector)     | 剪切检测器      |
| [QNKeyboardPasteDetector](#qnkeyboardpastedetector) | 粘贴检测器      |

### QNDevice

> 媒体设备相关

| 类                            | 描述     |
| :---------------------------- | :------- |
| [QNCamera](#qncamera)         | 摄像头   |
| [QNMicrophone](#qnmicrophone) | 麦克风   |
| [QNScreen](#qnscreen)         | 屏幕共享 |

## API

### QNExamClient

> 监考类

| 方法             | 类型                                                         | 描述         |
| :--------------- | :----------------------------------------------------------- | :----------- |
| static create    | (): [QNExamClient](#qnexamclient)                            | 创建client   |
| registerDevice   | (deviceId: [QNDeviceId](#qndeviceid), device: [QNInternalDevice](#qninternaldevice)): void | 注册设备     |
| unregisterDevice | (deviceId: [QNDeviceId](#qndeviceid)): void                  | 取消注册设备 |
| enable           | (detector: [QNDetector](#qndetector), deviceId?: [QNDeviceId](#qndeviceid)): void | 开启检测     |
| disable          | (detector: [QNDetector](#qndetector)): void                  | 关闭检测     |
| test             | (): Promise\<[QNTestResult](#qntestresult)>                  | 设备调试     |
| start            | (token: [QNTokenParams](#qntokenparams)): Promise\<void>     | 开始监考     |
| stop             | (): Promise\<void>                                           | 结束监考     |

### QNDetector

> 检测器

#### QNBrowserTabDetector

> tab检测器

| 方法          | 类型                                                         | 描述             |
| :------------ | :----------------------------------------------------------- | :--------------- |
| static create | (): [QNBrowserTabDetector](#qnbrowsertabdetector)            | 创建检测器(实例) |
| on            | (callback: (result: [VisibilityState](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState)) => void): void | 注册回调         |
| enable        | (): void                                                     | 开启检测         |
| disable       | (): void                                                     | 关闭检测         |

#### QNKeyboardCopyDetector

> 复制检测器

| 方法          | 类型                                                         | 描述             |
| :------------ | :----------------------------------------------------------- | :--------------- |
| static create | (): [QNKeyboardCopyDetector](#qnkeyboardcopydetector)        | 创建检测器(实例) |
| on            | (callback: (result: [ClipboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent)) => void): void | 注册回调         |
| enable        | (): void                                                     | 开启检测         |
| disable       | (): void                                                     | 关闭检测         |

#### QNKeyboardCutDetector

> 剪切检测器

| 方法          | 类型                                                         | 描述             |
| :------------ | :----------------------------------------------------------- | :--------------- |
| static create | (): [QNKeyboardCutDetector](#qnkeyboardcutdetector)          | 创建检测器(实例) |
| on            | (callback: (result: [ClipboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent)) => void): void | 注册回调         |
| enable        | (): void                                                     | 开启检测         |
| disable       | (): void                                                     | 关闭检测         |

#### QNKeyboardPasteDetector

> 粘贴检测器

| 方法          | 类型                                                         | 描述             |
| :------------ | :----------------------------------------------------------- | :--------------- |
| static create | (): [QNKeyboardPasteDetector](#qnkeyboardpastedetector)      | 创建检测器(实例) |
| on            | (callback: (result:  [ClipboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent)) => void): void | 注册回调         |
| enable        | (): void                                                     | 开启检测         |
| disable       | (): void                                                     | 关闭检测         |

#### QNMultiplePeopleDetector

> 多人同框检测器

| 方法          | 类型                                                         | 描述             |
| :------------ | :----------------------------------------------------------- | :--------------- |
| static create | (config?: [QNMediaDetectorConfig](#qnmediadetectorconfig)): [QNMultiplePeopleDetector](#qnmultiplepeopledetector) | 创建检测器(实例) |
| on            | (callback: (result: number) => void): void                   | 注册回调         |
| enable        | (track: [QNLocalVideoTrack](https://developer.qiniu.com/rtc/9061/WebQNLocalVideoTrack) \| [QNRemoteVideoTrack](https://developer.qiniu.com/rtc/9060/WebQNRemoteVideoTrack)): void | 开启检测         |
| disable       | (): void                                                     | 关闭检测         |


#### QNOutOfScreenDetector

> 用户出框检测器

| 方法          | 类型                                                         | 描述             |
| :------------ | :----------------------------------------------------------- | :--------------- |
| static create | (config?: [QNMediaDetectorConfig](#qnmediadetectorconfig)): [QNOutOfScreenDetector](#qnoutofscreendetector) | 创建检测器(实例) |
| on            | (callback: (result: boolean) => void): void                  | 注册回调         |
| enable        | (track: [QNLocalVideoTrack](https://developer.qiniu.com/rtc/9061/WebQNLocalVideoTrack) \| [QNRemoteVideoTrack](https://developer.qiniu.com/rtc/9060/WebQNRemoteVideoTrack)): void | 开启检测         |
| disable       | (): void                                                     | 关闭检测         |

#### QNUserTakerDetector

> 用户替考检测器

| 方法          | 类型                                                         | 描述             |
| :------------ | :----------------------------------------------------------- | :--------------- |
| static create | (config?: [QNUserTakerDetectorConfig](#qnusertakerdetectorconfig)): [QNOutOfScreenDetector](#qnoutofscreendetector) | 创建检测器(实例) |
| on            | (callback: (result: number) => void): void                   | 注册回调         |
| enable        | (track: [QNLocalVideoTrack](https://developer.qiniu.com/rtc/9061/WebQNLocalVideoTrack) \| [QNRemoteVideoTrack](https://developer.qiniu.com/rtc/9060/WebQNRemoteVideoTrack)): void | 开启检测         |
| disable       | (): void                                                     | 关闭检测         |

### QNDevice

> 媒体设备

#### QNCamera

> 摄像头

| 属性             | 类型                                                         | 描述           |
| ---------------- | ------------------------------------------------------------ | -------------- |
| cameraVideoTrack | [QNCameraVideoTrack](https://developer.qiniu.com/rtc/9068/WebQNCameraVideoTrack) | 摄像头视频轨道 |

| 方法              | 类型                                                         | 描述                      |
| :---------------- | :----------------------------------------------------------- | :------------------------ |
| static create     | (config?: [QNCameraConfig](#qncameraconfig)): [QNCamera](#qncamera) | 创建摄像头(实例)          |
| static getCameras | (skipPermissionCheck?: boolean): Promise\<[MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo)[]> | 枚举可用的摄像头输入设备  |
| start             | (): Promise\<void>                                           | 采集/播放摄像头视频流     |
| stop              | (): Promise\<void>                                           | 停止采集/播放摄像头视频流 |

#### QNMicrophone

> 麦克风

| 属性                 | 类型                                                         | 描述           |
| -------------------- | ------------------------------------------------------------ | -------------- |
| microphoneAudioTrack | [QNMicrophoneAudioTrack](https://developer.qiniu.com/rtc/9064/WebQNMicrophoneAudioTrack) | 麦克风音频轨道 |

| 方法                  | 类型                                                         | 描述                      |
| :-------------------- | :----------------------------------------------------------- | :------------------------ |
| static create         | (config?: [QNMicrophoneConfig](#qnmicrophoneconfig)): [QNMicrophone](#qnmicrophone) | 创建麦克风(实例)          |
| static getMicrophones | (skipPermissionCheck?: boolean): Promise\<[MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo)[]> | 枚举可用的麦克风输入设备  |
| start                 | (): Promise\<void>                                           | 采集/播放麦克风音频流     |
| stop                  | (): Promise\<void>                                           | 停止采集/播放麦克风音频流 |

#### QNScreen

> 屏幕共享

| 属性             | 类型                                                         | 描述           |
| ---------------- | ------------------------------------------------------------ | -------------- |
| screenVideoTrack | [QNScreenVideoTrack](https://developer.qiniu.com/rtc/9092/WebQNScreenVideoTrack) | 屏幕共享视频流 |

| 方法          | 类型                                                         | 描述                        |
| :------------ | :----------------------------------------------------------- | :-------------------------- |
| static create | (config?: [QNScreenConfig](#qnscreenconfig)): [QNScreen](#qnscreen) | 创建屏幕共享(实例)          |
| start         | (): Promise\<void>                                           | 采集/播放屏幕共享视频流     |
| stop          | (): Promise\<void>                                           | 停止采集/播放屏幕共享视频流 |

## 类型定义

### QNDeviceId

```ts
export type QNDeviceId = 'camera' | 'microphone' | 'screen';
```

### QNTokenParams

```ts
export interface QNTokenParams {
  rtcToken: string; // rtc房间token
  aiToken?: string; // ai检测token
  userData?: string; // 用户加入rtc房间扩展字段
}
```

### QNInternalDevice

```ts
export type QNInternalDevice = QNCamera | QNMicrophone | QNScreen; // 内置设备
```

### QNTestResult

```ts
export interface QNTestResult {
  isCameraEnabled: boolean, // 摄像头是否正常开启
  isMicrophoneEnabled: boolean, // 麦克风是否正常开启
  isScreenEnabled: boolean, // 屏幕共享是否正常开启
  isSDKSupport: boolean; // SDK 是否支持
}
```

### QNMediaDetectorConfig

```ts
export interface QNMediaDetectorConfig {
  interval?: number; // 检测间隔时间，单位ms，默认为1000ms
}
```

### QNUserTakerDetectorConfig

```ts
export interface QNUserTakerDetectorConfig extends QNMediaDetectorConfig {
  realName: string; // 姓名
  idCard: string; // 身份证号
}
```

### QNCameraConfig

```ts
export interface QNNumberRange {
  max?: number; // 最大值
  min?: number; // 最小值
  exact?: number; // 希望能取到exact的值，如果失败就抛出错误
  ideal?: number; // 优先取ideal的值, 其次取min-max范围内一个支持的值, 否则就抛出错误
}

export type QNOptimizationMode = QNVideoOptimizationMode; // 传输优化模式, motion: 流畅优先, detail: 清晰优先, 默认浏览器根据自身算法确定模式

export interface QNCameraConfig {
  cameraId?: string, // 选择摄像头id
  elementId?: string, // 绑定元素的id
  bitrate?: number, // 传输的码率，单位 kbps
  frameRate?: number, // 帧率
  height?: number | QNNumberRange, // 视频高度
  width?: number | QNNumberRange, // 视频宽度
  optimizationMode?: QNOptimizationMode; // 传输优化模式
}
```

### QNMicrophoneConfig

```ts
export interface QNMicrophoneConfig {
  microphoneId?: string, // 选择麦克风id
  elementId?: string, // 绑定元素的id
  bitrate?: number, // 传输的码率，单位 kbps
  // 以下建议不要更改，浏览器会根据设备自动适配
  sampleRate?: number, // 采样率
  sampleSize?: number, // 采样大小
  stereo?: boolean, // 是否采用双声道
  AEC?: boolean, // 是否启动 automatic echo cancellation
  AGC?: boolean, // 是否启动 audio gain control
  ANS?: boolean, // 是否启动 automatic noise suppression
}
```

### QNScreenConfig

```ts
export interface QNScreenConfig {
  elementId?: string, // 绑定元素的id
  bitrate?: number, // 传输的码率，单位 kbps
  width?: number | QNNumberRange, // 输出画面的宽度
  height?: number | QNNumberRange, // 输出画面的高度
  optimizationMode?: QNOptimizationMode; // 传输优化模式
}
```

