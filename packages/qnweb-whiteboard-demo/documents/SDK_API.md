# 创建实例对象

```ts
const client = QNWhiteBoard.create();
const instance = client.createInstance(bucketId);
```

# API 概览

## 房间关键方法

以下方法均为 `client` 暴露的方法

| 方法名称                                | 方法描述                                                     |
| --------------------------------------- | ------------------------------------------------------------ |
| [setBasePath](#setBasePath)             | 设置白板iframe的src                                          |
| [joinRoom](#joinRoom)                   | 进入房间                                                     |
| [leaveRoom](#leaveRoom)                 | 离开房间                                                     |
| [registerRoomEvent](#registerRoomEvent) | 注册房间事件回调                                             |
| [createInstance](#createInstance)       | 创建实例，主要包含 ppt/pdf 事件的一个实例，主要是对 ppt/pdf 状态的管理 |
| [getRecord](#getRecord)                 | 获取回放数据并初始化回放模块                                 |

## 房间内主动控制的方法

以下方法均为 `client` 暴露的方法，无返回值

| 参数                                          | 描述          |
|---------------------------------------------|-------------|
| [scaleWidget](#scaleWidget)                 | widget 缩放   |
| [deleteWidget](#deleteWidget)               | 删除 widget   |
| [rubberUndo](#rubberUndo)                   | 还原笔迹        |
| [clearRecovery](#clearRecovery)             | 清空笔迹回收站     |
| [setPentyle](#setPenStyle)                  | 设置白板输入模式样式  |
| [setInputMode](#setInputMode)               | 设置白板输入模式    |
| [setEraseSize](#setEraseSize)               | 设置橡皮参数      |
| [setGeometryMode](#setGeometryMode)         | 设置图形模式      |
| [setWhiteBoardBack](#setWhiteBoardBack)     | 设置白板的背景色    |
| [getDocuments](#getDocuments)               | 获取当前白板页列表   |
| [newDocument](#newDocument)                 | 新建文档        |
| [cutDocument](#cutDocument)                 | 切换文档        |
| [insertDocument](#insertDocument)           | 插入文档        |
| [deleteDocument](#deleteDocument)           | 删除文档        |
| [cleanDocument](#cleanDocument)             | 清空文档        |
| [uploadFile](#uploadFile)                   | 白板内上传文件     |

## 以下方法都通过 `instance` 调用

| 方法名称                                                   | 方法描述         |
|--------------------------------------------------------|--------------|
| [registerWhiteBoardEvent](#registerWhiteBoardEvent)    | 注册白板事件回调     |
| [registerPPTEvent](#registerPPTEvent)                  | 注册 PPT 事件回调  |
| [registerPDFEvent](#registerPDFEvent)                  | 注册 pdf 事件回调  |

## instance 主动控制的方法

| 参数                              | 描述                      |
|---------------------------------|-------------------------|
| [nextStep](#nextStep)           | ppt 下一步（仅 ppt 模式可用）     |
| [preStep](#preStep)             | ppt 上一步（仅 ppt 模式可用）     |
| [jumpStep](#jumpStep)           | ppt 跳到指定步（仅 ppt 模式可用）   |
| [nextPage](#nextPage)           | 下一页                     |
| [prePage](#prePage)             | 上一页                     |
| [jumpPage](#jumpPage)           | 跳到指定页                   |
| [getFileState](#getFileState)   | 获取当前文件状态                |
| [getBucketId](#getBucketId)     | 获取白板 bucketId           |
| [getBoardMode](#getBoardMode)   | 获取白板模式                  |
| [setPDFOperationMode](#setPDFOperationMode) | 设置 pdf 操作模式 |

# API

* 以下方法都通过 `client` 调用

## QNWhiteBoard

### static create

创建实例

```ts
const client = QNWhiteBoard.create()
```

## client 方法

### createInstance

当没有白板实例时调用则创建一个实例并返回该实例

之后调用均会返回该实例 bucketId 从服务端获取

```ts
client.createInstance(bucketId ? : string, el ? : string | HTMLElement)
```

| 参数     | 类型                  | 描述            |
| -------- | --------------------- |---------------|
| bucketId | string                | 桶 ID          |
| el       | string \| HTMLElement   | 承载白板的容器 id，或者传入 DOM 元素 |

### initConfig

初始化打开白板所需的参数，params 包含以下属性

```ts
client.initConfig(params)
```

| 参数        | 类型                      | 描述                                                         |
| ----------- |-------------------------| ------------------------------------------------------------ |
| path        | string                  | 白板 iframe 的 src                                           |
| el          | string <br> HTMLElement | 承载白板 iframe 的容器，传 DOM 元素 id 或元素本身，默认传递'iframeBox' |
| playbackUrl | string                  | 回放模块请求地址                                             |

### getRecord

获取回放数据并初始化回放模块，必须在房间关闭的状态下调用

```ts
client.controller.getRecord(recordId)
```

### offlineConfig

用于配置房间中发生断网后的离线支持，必须在加入房间前调用，否则只会在下次加入房间生效

```ts
client.controller.offlineConfig(params)
```

| 参数     | 类型      | 描述                                                |
| -------- |---------| --------------------------------------------------- |
| supportOffline | boolean | 是否支持离线状态。默认为false。如果设为true，则房间模式中如果发生网络中断并在自动重连超出指定次数后进入到房间离线状态。离线状态时房间状态处于OFFLINE。此时可以继续使用白板的基础功能，但是不能插入文件。 |
| onlineAutoSync | boolean | 当房间从离线状态恢复到在线状态后是否自动同步离线状态时的操作记录到服务器。默认为false。 |

### enterOffline

进入离线模式。离线模式与房间模式和回放模式互斥，如过已经打开了房间或开始了回放，必须首先退出房间或关闭回放后才能进入离线模式

```ts
client.controller.enterOffline()
```

### exitOffline

退出离线模式

```ts
client.controller.exitOffline()
```

### joinRoom

加入房间，参数均从服务端获取

```ts
client.joinRoom(appId: string, meetingId: string, userId: string, token: string)
```

| 参数 | 类型|描述 |
|- | -|- |
|appId|string|应用的 id|
|meetingId|string|房间 id|
|userId|string|用户 id|
|token|string|认证信息|

### leaveRoom

离开房间

```ts
client.leaveRoom()
```

### registerRoomEvent

注册事件回调

```ts
client.registerRoomEvent({
  onJoinSuccess: (userlist) => console.log('onJoinSuccess', userlist),
  onJoinFailed: () => console.log('onJoinFailed'),
  onRoomStatusChanged: (code) => console.log('onRoomStatusChanged', code),
  onUserJoin: (user) => console.log('onUserJoin', user),
  onUserLeave: (user) => console.log('onUserLeave', user),
  onDocumentListChanged: (documentList) =>
    console.log('onDocumentListChanged', documentList),
  onDocumentPageChanged: (documentId) =>
    console.log('onDocumentPageChanged', documentId),
  onEnterOffline: () => console.log('onEnterOffline'),
  onWidgetActivity: (widget) => console.log('onWidgetActivity', widget),
  webAssemblyOnReady: () => console.log('webAssemblyOnReady')
})
```

| 事件名称              | 事件描述             |
| --------------------- | -------------------- |
| onJoinSuccess         | 加入房间成功         |
| onJoinFailed          | 加入房间失败         |
| onRoomStatusChanged   | 房间连接状态改变     |
| onUserJoin            | 有人加入房间         |
| onUserLeave           | 有人离开房间         |
| onDocumentListChanged | 白板页列表发生了变化 |
| onDocumentPageChanged | 白板页翻页           |
| onEnterOffline        | offlineConfig设置supportOffline为true后，重连超时自动进入离线模式         |
| onWidgetActivity     | 点击白板时触发，返回被点击的资源信息  |

其中 `onRoomStatusChanged` 回调为房间状态改变时触发，参数 `code` 对应以下状态

|状态码| 描述|
|-|-|
|0 |未连接房间 |
|1| 正在连接房间|
|2| 已链接房间 |
|3 |连接失败 |

其中 `onJoinSuccess` 参数 `userList` 为房间内当前人员列表，列表内人员属性参考 `onUserJoin` 和 `onUserLeave`

其中 `onUserJoin` 和 `onUserLeave` 回调为房间内有人加入或离开时触发，参数 `user` 为该人员的信息

| 属性      | 描述        |
| --------- | ----------- |
| headPic   | 用户头像url |
| nickName  | 用户昵称    |
| sessionId | sessionId   |
| userId    | userId      |

其中 `onDocumentListChanged` 回调为加入房间时以及白板页数量变动时触发，参数 `documentList` 为该房间内白板页列表,列表项包含属性如下

| 属性       | 描述         |
| ---------- | ------------ |
| bgColor    | 白板页背景色 |
| documentId | 白板页Id     |
| documentNo | 白板序列号   |

其中 `onDocumentPageChanged`  回调为加入房间时以及白板翻页时触发，参数 `documentId` 为当前白板页 Id

其中 `onWidgetActivity` 回调点击白板时触发，参数widget为被点击的资源，包含以下参数`
|属性| 描述|
|-|-|
|isDelete|是否被删除|
|md5|资源加密md5值|
|name|上传时的资源名称|
|objectName|服务器保存的资源名|
|pageCount|资源总页数|
|pageNo|资源当前页|
|path|加密路径|
|resourceId|资源id|
|type|类型 0白板  1文档  2图片|
|userId|上传用户的userId|
|widgetId|控件id，删除文件等操作时使用|

其中 `webAssemblyOnReady` 回调为白板wasm资源准备就绪时触发

### scaleWidget

widget 缩放，ppt/pdf 模式下不可用

```ts
client.scaleWidget(params: { 
  widgetId: string;
  scale:number;
});
```

| 参数     | 类型   | 描述                                                |
| -------- | ------ | --------------------------------------------------- |
| widgetId | string | 选择的文件 widgetId，默认点击文件时会存储，可以不传 |
| scale    | number | 缩放比例                                            |

### deleteWidget

删除白板内选择的文件，ppt/pdf 模式下不可用

```ts
client.deleteWidget(widgetId: string);
```

| 参数     | 类型   | 描述                                               |
| -------- | ------ | -------------------------------------------------- |
| widgetId | string | 选择的文件widgetId，默认点击文件时会存储，可以不传 |

### rubberUndo

还原笔迹

```ts
client.rubberUndo()
```

### clearRecovery

清空笔迹回收站

```ts
client.clearRecovery()
```

### setPenStyle

设置白板输入模式样式，setInputMode 设置为 0 时有效

```ts
client.setPenStyle(params:{
  type?: number;
  color?: string;
  size?: number;
});
```

| 参数  | 类型   | 描述                                                         |
| ----- | ------ | ------------------------------------------------------------ |
| type  | number | 0: 铅笔<br>1: 马克笔<br>2: 点<br>3: 手<br>4: 空心箭头<br>5: 实心箭头 |
| color | string | 16 进制颜色(只在0和1类型下生效，都不能为空)                  |
| size  | number | 尺寸(只在0和1类型下生效，都不能为空)                         |

### setInputMode

设置白板输入模式

```ts
client.setInputMode(mode: number)
```

| 参数 | 类型   | 描述                                                         |
| ---- | ------ | ------------------------------------------------------------ |
| mode | number | 0: 普通模式<br>1: 橡皮模式<br>2: 选择模式<br>3: 图形模式<br>4: 文字模式 |

### setEraseSize

设置橡皮参数

```ts
client.setEraseSize(size: number)
```

| 参数 | 类型   | 描述     |
| ---- | ------ | -------- |
| size | number | 橡皮大小 |

### setGeometryMode

设置图形模式

```ts
client.setGeometryMode(mode: number)
```

| 参数 | 类型   | 描述                                              |
| ---- | ------ | ------------------------------------------------- |
| mode | number | 0: 矩形 <br> 1: 圆 <br> 3: 线条 <br> 6: 箭头 <br> |

### setWhiteBoardBack

设置白板的背景色

```ts
client.setWhiteBoardBack(theme: string)
```

| 参数  | 类型     | 描述        |
| ----- |--------| ----------- |
| theme | string | 16 进制颜色 |

### getDocuments

获取当前白板页列表

```ts
client.getDocuments()
```

### newDocument

新建白板页

```ts
client.newDocument()
```

### cutDocument

切换白板页，ppt/pdf 模式下不可用

```ts
client.cutDocument(widgetId: string)
```

| 参数       | 类型   | 描述      |
| ---------- | ------ | --------- |
| documentId | string | 白板页 ID |

### insertDocument

插入白板页

```ts
client.insertDocument(documentId: string)
```

| 参数       | 类型   | 描述      |
| ---------- | ------ | --------- |
| documentId | string | 白板页 ID |

### deleteDocument

删除白板页

```ts
client.deleteDocument(documentId: string)
```

| 参数       | 类型   | 描述      |
| ---------- | ------ | --------- |
| documentId | string | 白板页 ID |

### cleanDocument

清空白板页，pdf模式下不用传 `documentId`

```ts
client.cleanDocument(documentId?: string)
```

| 参数       | 类型   | 描述      |
| ---------- | ------ | --------- |
| documentId | string | 白板页 ID |

### uploadFile

白板内上传文件

位置和大小相对 onWhiteBoardOpened 回调参数 size 的宽高

```ts
client.uploadFile({
  file: File,
  left: number,
  top: number,
  width: number,
  height: number
})
```

| 参数   | 类型   | 描述                       |
| ------ | ------ | -------------------------- |
| file   | File   | 要上传的文件               |
| left   | number | 文件在白板内距离左侧的距离 |
| top    | number | 文件在白板内距离上方的距离 |
| width  | number | 白板内显示文件的宽         |
| height | number | 白板内显示文件的高         |

## instance 方法

### switchBucket

切换白板

```ts
instance.switchBucket(bucketId)
```

| 参数     | 描述              |
| -------- | ----------------- |
| bucketId | 新白板的 bucketId |

### registerWhiteBoardEvent

注册白板事件回调

```ts
instantce.registerWhiteBoardEvent({
  onWhiteBoardOpened: (size: { width: number; height: number }) => console.log("onWhiteBoardOpened", size),
  onWhiteBoardOpenFailed: () => console.log('onWhiteBoardOpenFailed'),
  onWhiteBoardClosed: () => console.log('onWhiteBoardClosed'),
})
```

| 事件名称               | 事件描述     |
| ---------------------- | ------------ |
| onWhiteBoardOpened     | 打开白板成功 |
| onWhiteBoardOpenFailed | 打开白板失败 |
| onWhiteBoardClosed     | 关闭白板成功 |

其中 onWhiteBoardOpened 回调为白板打开成功时触发，参数 size 为白板的虚拟宽高，无单位

| 属性   | 描述           |
| ------ | -------------- |
| width  | 白板的虚拟宽度 |
| height | 白板的虚拟高度 |

### registerPPTEvent

注册 ppt 事件回调，以下回调只有在 ppt-play 模式才会触发

```ts
instance.registerPPTEvent({
  onFileLoadedSuccessful: () => console.log('onFileLoadedSuccessful'),
  onFileLoadingFailed: (code) => console.log('onFileLoadingFailed', code),
  onFileStateChanged: (data) => console.log('onFileStateChanged', data),
})
```

| 事件名称               | 事件描述         |
| ---------------------- | ---------------- |
| onFileLoadedSuccessful | ppt 加载成功     |
| onFileLoadingFailed    | ppt 加载失败     |
| onFileStateChanged     | ppt 文件状态改变 |

其中 `onFileStateChanged` 回调为 ppt 翻页等操作时触发，参数 `data` 内包含以下参数
|名称| 类型| 描述|
|-|-|-|
|no |number |当前 ppt 页号|
|step| number| 当前 ppt 动画位置索引|
|pageCount| number |ppt 总页数|
|stepCount |number |ppt 总动画数|

其中 `onFileLoadingFailed` 回调为 ppt 文档打开失败时触发，参数 `code` 对应以下描述
|错误码| 描述|
|-|-|
|501 | 幻灯片下载失败|
|502| 脚本下载失败 |

### registerPDFEvent

注册 pdf 事件回调，以下回调只有在 pdf-play 模式才会触发

```javascript
instance.registerPDFEvent({
  onFileLoadedSuccessful: () => console.log('onFileLoadedSuccessful'),
  onFileLoadingFailed: (code) => console.log('onFileLoadingFailed', code),
  onFileStateChanged: (data) => console.log('onFileStateChanged', data),
})
```

| 事件名称               | 事件描述         |
| ---------------------- | ---------------- |
| onFileLoadedSuccessful | pdf 加载成功     |
| onFileLoadingFailed    | pdf 加载失败     |
| onFileStateChanged     | pdf 文件状态改变 |

其中 `onFileStateChanged` 回调为 pdf 翻页操作时触发，参数 `data` 内包含以下参数
|名称| 类型| 描述|
|-|-|-|
|currentPage |number |当前 pdf 页号|
|pageCount| number |pdf 总页数|

其中 `onFileLoadingFailed` 回调为 pdf 文档打开失败时触发，参数 `code` 对应以下描述
|错误码| 描述|
|-|-|
|501 |加载失败|
|502| 文件无效 |
|503| 文件丢失 |
|504| 意外的错误 |

### nextStep

ppt 下一步，当该页没有动画或者当前已经是该页最后一步动画时调用，ppt会翻到下一页

```ts
instance.nextStep()
````

### preStep

ppt 上一步，如果当前页动画全部未执行时调用翻到上一页，否则状态变更为当前页未执行动画的状态

```ts
instance.preStep()
```

### jumpStep

ppt 跳到指定步

```ts
instance.jumpStep(step: number)
```

|参数|类型|描述|
|-|-|-|
|step|number|ppt 目标步|

### nextPage

ppt / pdf 下一页

```ts
instance.nextPage()
```

### prePage

ppt / pdf 上一页

```ts
instance.prePage()
```

### jumpPage

ppt / pdf 跳到指定页

```ts
instance.jumpPage(page: number)
```

|参数|类型|描述|
|-|-|-|
|page|number|ppt 目标页|

### getFileState

获取当前文件状态，返回值参考下方 ppt/pdf 事件回调 `onFileStateChanged` 参数

```ts
instance.getFileState()
```

### getBucketId

获取白板 bucketId

```ts
instance.getBucketId()
```

### getBoardMode

获取白板模式

```ts
instance.getBoardMode()
```

### setPDFOperationMode

设置pdf操作模式

```ts
instance.setPDFOperationMode(mode
:
boolean
)
```

| 参数 | 类型    | 描述                                                         |
| ---- | ------- | ------------------------------------------------------------ |
| mode | boolean | true 开启 pdf 操作模式, false 关闭。 <br>pdf 操作模式下： <br>pc：↑↓箭头和滚轮 控制上下滚动，ctrl+滚轮控制缩放 <br>h5：双指缩放，单指滑动滚动 |

### registerPlaybackEvent

注册回放事件回调

```ts
 instance.registerPlaybackEvent({
  onInitFinished: (totalTime) => console.log('onInitFinished', totalTime),
  onError: (code) => console.log('onError', code),
  onStatusChanged: (status) => console.log('onStatusChanged', status),
  onProgress: (data) => console.log('onProgress', data),
  onBoardSizeChanged: (size) => console.log('onBoardSizeChanged', size),
  onFileLoadingFailed: (error) => console.log(error)
})
```

onInitFinished 回放模式初始化完成回调

| 参数      | 类型     | 描述             |
| --------- |--------| ---------------- |
| totalTime | number | 回放总时长，毫秒 |

onError 回放模式错误回调，code对应以下描述

| 错误码 | 描述                       |
| ------ | -------------------------- |
| 100    | 网络不可用                 |
| 101    | 服务器错误或繁忙           |
| 500    | 未关闭房间，不可初始化回放 |
| 501    | 下载回放记录文件失败       |
| 502    | 回放记录不存在             |
| 503    | 录制未结束                 |

onStatusChanged 回放状态改变回调 status为当前状态

| 参数   | 类型     | 描述                                                         |
| ------ |--------| ------------------------------------------------------------ |
| status | string | `IDLE`空闲状态 <br> `LOADING`正在初始化数据 <br> `PREPARED` 已就绪<br> `PLAYING`播放中 <br> `PAUSED`已暂停 <br> `STOPPED`已停止 <br>`ERROR` 错误 <br> `DESTROYED`对象已销毁 |

onProgress 回放进度通知回调，播放中200毫秒触发一次，data包含参数如下

| 参数     | 类型     | 描述             |
| -------- |--------| ---------------- |
| position | number | 当前进度，毫秒   |
| duration | number | 回放总时长，毫秒 |

onBoardSizeChanged 白板尺寸改变回调，size包含参数如下

| 参数   | 类型     | 描述       |
| ------ |--------| ---------- |
| width  | number | 白板虚拟宽 |
| height | number | 白板虚拟高 |

onFileLoadingFailed 回放中的文件加载失败回调， error包含参数如下

| 参数      | 类型     | 描述                                  |
| --------- |--------| ------------------------------------- |
| bucketId  | string | 白板id                                |
| mode      | string | 白板类型`ppt_play pdf_scroll`两者之一 |
| extra     | string | 文件对应的描述信息                    |
| errorCode | number | 文件加载失败的错误码                  |

### play

播放回放

```ts
instance.play()
```

### stop

停止回放

```ts
instance.stop()
```

### pause

暂停回放

```ts
instance.pause()
```

### seek

跳转回放

```ts
instance.pause(position)
```

| 参数     | 类型   | 描述                                          |
| -------- | ------ | --------------------------------------------- |
| position | number | 跳转回放的目标位置时间，[0,总时长] 区间，毫秒 |

### calibrate

校准回放

```ts
instance.calibrate(offset)
```

| 参数   | 类型   | 描述                                    |
| ------ | ------ | --------------------------------------- |
| offset | number | 校准的时间长度，[-5000,5000] 区间，毫秒 |

### release

关闭回放

```ts
instance.release()
```

### getPosition

获取当前回放进度，毫秒

```ts
instance.getPosition()
```

### getDuration

获取回放总时长，毫秒

```ts
instance.getDuration()
```

### getStatus

获取当前回放状态，值参考 registerPlaybackEvent 中 onStatusChanged 回调参数

```ts
instance.getStatus()
```

### getRecordId

获取当前回放id

```ts
instance.getRecordId()
```

### getWhiteBoardSize

获取当前回放白板虚拟尺寸，值参考 registerPlaybackEvent 中 onBoardSizeChanged 回调参数

```ts
instance.getWhiteBoardSize()
```

### resize

设置白板canvas元素的width和height属性，参数`number`类型无单位

```ts
instance.resize(width, height)
```

