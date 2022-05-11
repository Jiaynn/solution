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
| [joinRoom](#joinRoom)                   | 进入房间                                                     |
| [leaveRoom](#leaveRoom)                 | 离开房间                                                     |
| [registerRoomEvent](#registerRoomEvent) | 注册房间事件回调                                             |
| [createInstance](#createInstance)       | 创建实例，主要包含 ppt/pdf 事件的一个实例，主要是对 ppt/pdf 状态的管理 |

## 房间内主动控制的方法

以下方法均为 `client` 暴露的方法，无返回值

| 参数                                    | 描述                 |
| --------------------------------------- | -------------------- |
| [scaleWidget](#scaleWidget)             | widget 缩放          |
| [deleteWidget](#deleteWidget)           | 删除 widget          |
| [rubberUndo](#rubberUndo)               | 还原笔迹             |
| [clearRecovery](#clearRecovery)         | 清空笔迹回收站       |
| [setPentyle](#setPenStyle)              | 设置白板输入模式样式 |
| [setInputMode](#setInputMode)           | 设置白板输入模式     |
| [setEraseSize](#setEraseSize)           | 设置橡皮参数         |
| [setGeometryMode](#setGeometryMode)     | 设置图形模式         |
| [setWhiteBoardBack](#setWhiteBoardBack) | 设置白板的背景色     |
| [newDocument](#newDocument)             | 新建文档             |
| [cutDocument](#cutDocument)             | 切换文档             |
| [insertDocument](#insertDocument)       | 插入文档             |
| [deleteDocument](#deleteDocument)       | 删除文档             |
| [cleanDocument](#cleanDocument)         | 清空文档             |

## 以下方法都通过 `instance` 调用

| 方法名称                                            | 方法描述          |
| --------------------------------------------------- | ----------------- |
| [openWhiteBoard](#openWhiteBoard)                   | 打开白板          |
| [closeWhiteBoard](#closeWhiteBoard)                 | 关闭白板          |
| [registerWhiteBoardEvent](#registerWhiteBoardEvent) | 注册白板事件回调  |
| [registerPPTEvent](#registerPPTEvent)               | 注册 PPT 事件回调 |

## instance 主动控制的方法

| 参数                            | 描述                              |
| ------------------------------- | --------------------------------- |
| [nextStep](#nextStep)           | ppt 下一步（仅 ppt 模式可用）     |
| [preStep](#preStep)             | ppt 上一步（仅 ppt 模式可用）     |
| [jumpStep](#jumpStep)           | ppt 跳到指定步（仅 ppt 模式可用） |
| [nextPage](#nextPage)           | 下一页                            |
| [prePage](#prePage)             | 上一页                            |
| [jumpPage](#jumpPage)           | 跳到指定页                        |
| [getFileState](#getFileState)   | 获取当前文件状态                  |
| [getBucketId](#getBucketId)     | 获取白板 bucketId                 |
| [getBoardMode](#getBoardMode)   | 获取白板模式                      |
| [jumpBoardPage](#jumpBoardPage) | 跳转到指定页号的白板页            |

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

主要包含 ppt/pdf 事件的一个实例，主要是对 ppt/pdf 状态的管理

| 参数     | 类型   | 描述  |
| -------- | ------ | ----- |
| bucketId | string | 桶 ID |

### joinRoom

加入房间

```ts
client.join(roomToken: string, params?: JoinRoomParams)
```

| 参数 | 类型|描述 |
|- | -|- |
|roomToken|string|房间 token|
| params    | [JoinRoomParams](#JoinRoomParams) | 扩展参数   |

### leaveRoom

离开房间 

```ts
client.leaveRoom()
```

### registerRoomEvent

注册事件回调

```ts
client.registerRoomEvent({
	onJoinSuccess: () => console.log('onJoinSuccess'),
	onJoinFailed: () => console.log('onJoinFailed'),
	onRoomStatusChanged: (code: number) => console.log('onRoomStatusChanged', code),
})
```

| 事件名称            | 事件描述         |
| ------------------- | ---------------- |
| onJoinSuccess       | 加入房间成功     |
| onJoinFailed        | 加入房间失败     |
| onRoomStatusChanged | 房间连接状态改变 |

其中 `onRoomStatusChanged` 回调为房间状态改变时触发，参数 `code` 对应以下状态

|状态码| 描述|
|-|-|
|0 |未连接房间 |
|1| 正在连接房间|
|2| 已链接房间 |
|3 |连接失败 |

### scaleWidget

widget 缩放

```ts
client.scaleWidget(params: {
  widgetId: string,
  scale: number
})
```

| 参数     | 类型   | 描述     |
| -------- | ------ | -------- |
| widgetId | string | 文档 ID  |
| scale    | number | 缩放比例 |

### deleteWidget

删除 widget

```ts
client.deleteWidget(widgetId: string)
```

| 参数     | 类型   | 描述    |
| -------- | ------ | ------- |
| widgetId | string | 文档 ID |

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

设置白板输入模式样式

```ts
client.setPenStyle(params: {
  type: number;
  color: string;
  size: number;
})
```

| 参数  | 类型   | 描述                  |
| ----- | ------ | --------------------- |
| type  | number | 0: 铅笔 <br>1: 马克笔 |
| color | string | 16 进制颜色           |
| size  | number | 尺寸                  |

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

| 参数 | 类型     | 描述                                                                          |
| ---- |--------|-----------------------------------------------------------------------------|
| mode | number | 0: 矩形 <br> 1: 圆 <br> 3: 实线 <br> 6: 空心箭头 <br> 8: 虚线 <br> 9: 椭圆 <br> 10: 实心箭头 |

### setWhiteBoardBack

设置白板的背景色

```ts
client.setWhiteBoardBack(theme: string)
```

| 参数  | 类型     | 描述        |
| ----- |--------| ----------- |
| theme | string | 16 进制颜色 |

### newDocument

新建文档

```ts
client.newDocument()
```

### cutDocument

切换文档

```ts
client.cutDocument(widgetId: string)
```

| 参数     | 类型     | 描述    |
| -------- |--------| ------- |
| widgetId | string | 文档 ID |

### insertDocument

插入文档

```ts
client.insertDocument(widgetId: string)
```

| 参数     | 类型     | 描述    |
| -------- |--------| ------- |
| widgetId | string | 文档 ID |

### deleteDocument

删除文档

```ts
client.deleteDocument(widgetId: string)
```

| 参数     | 类型   | 描述    |
| -------- | ------ | ------- |
| widgetId | string | 文档 ID |

### cleanDocument

清空文档

```ts
client.cleanDocument(widgetId: string)
```

| 参数     | 类型   | 描述    |
| -------- | ------ | ------- |
| widgetId | string | 文档 ID |

## instance 方法

### openWhiteBoard

打开白板

```ts
instance.openWhiteBoard()
```

### closeWhiteBoard

关闭白板

```ts
instance.closeWhiteBoard()
```

### registerWhiteBoardEvent

注册白板事件回调

```ts
instantce.registerWhiteBoardEvent({
	onWhiteBoardOpened: () => console.log('onWhiteBoardOpened'),
	onWhiteBoardOpenFailed: () => console.log('onWhiteBoardOpenFailed'),
	onWhiteBoardClosed: () => console.log('onWhiteBoardClosed'),
})
```

| 事件名称               | 事件描述     |
| ---------------------- | ------------ |
| onWhiteBoardOpened     | 打开白板成功 |
| onWhiteBoardOpenFailed | 打开白板失败 |
| onWhiteBoardClosed     | 关闭白板成功 |

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

###  nextStep

ppt 下一步
```ts
instance.nextStep()
````

### preStep

ppt 上一步
```ts
instance.preStep()
```

### jumpStep

ppt 跳到指定步
```ts
instance.jumpStep(step)
```
|参数|类型|描述|
|-|-|-|
|step|number|ppt 目标步|

###  nextPage

下一页
```ts
instance.nextPage()
```

###  prePage

上一页
```ts
instance.prePage()
```

###  jumpPage

跳到指定页
```ts
instance.jumpPage(page)
```
|参数|类型|描述|
|-|-|-|
|page|int|ppt 目标页|

### getFileState

获取当前文件状态，返回值参考下方ppt/pdf事件回调onFileStateChanged参数
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

### jumpBoardPage

跳转到指定页号的白板页
```ts
instance.jumpBoardPage(no)
```

|参数|类型|描述|
|-|-|-|
|no|int|白板目标页|

# 类型说明

## BoardSize

```ts
/**
 * 白板的大小
 * 默认 3
 */
export enum BoardSize {
  Row2Column2 = 1,
  Row3Column3,
  Row1Column3
}
```

## BgColor

```ts
/**
 * 表示白板的颜色
 */
export enum BgColor {
  White = 1,
  Black,
  Green
}
```

## JoinRoomParams

```ts
/**
 * 加入房间配置
 */
export interface JoinRoomParams {
  boardSizeId?: BoardSize;
  bgColor?: BgColor;
  // 0 代表不限制
  // 如果 > 0，代表白板内最多limitNumber个人
  // 只要白板内人数超过limitNumber数量时，就会进不去。
  limitNumber?: number;
  // aspectRatio 宽高比，0.5 ～ 2.5之间，非必填
  aspectRatio?: number;
  // zoomScale 扩展比 1～5之间 非必填
  zoomScale?: number;
  // 白板标题(长度 1 ~ 20 支持数字、字符、下划线_)，
  // 相同的RTC房间，如果title相同，则进相同的房间，
  // 一个RTC房间可以有多个白板房间，标题不同就会生成新的，
  // 该字段非必填，
  title?: string;
}
```

