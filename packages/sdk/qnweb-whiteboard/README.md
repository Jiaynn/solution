## 开发准备

引入 sdk：

```html
<!--html 文件-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Title</title>
</head>
<body>
<!--  白板容器 -->
<div id='canvasBox'></div>
</body>
<script src='./qnweb-whiteboard.umd.js'></script>
</html>
```

或者通过 [npm](https://www.npmjs.com/) 安装：

```shell
$ npm install qnweb-whiteboard
```

## 查看 SDK 版本号

```ts
import QNWhiteboard from 'qnweb-whiteboard';

console.log(QNWhiteboard.version)
```

## 配置 wasm 资源

wasm 默认部署到 [unpkg.com](https://unpkg.com/qnweb-whiteboard) 下：https://unpkg.com/qnweb-whiteboard@[version]/build/qnweb-whiteboard.umd.js

可以通过如下方式查看 wasm 资源部署路径：

```ts
console.log(QNWhiteboard.config);
```

用户也可以将 wasm 部署在其他地方，如下所示：

```ts
QNWhiteboard.setConfig({
  wasmPath: './'
})
```

## 快速开始

```js
// js 文件

// 此时 QNWhiteboard 就已经被导入了

const qnWhiteboard = new QNWhiteboard(); // 初始化白板

// 获取 roomToken 加入房间 
qnWhiteboard.joinRoom(roomToken);

//处理白板和房间事件
function processEvent(event, params) {
  switch (event) {
    case qnWhiteboard.controller.Event.AllEvent:
      break;
    case qnWhiteboard.controller.Event.PageListChanged:
      break;
    case qnWhiteboard.controller.Event.WebassemblyReady:
      break;
    case qnWhiteboard.controller.Event.WhiteboardSizeChanged:
      break;
    case qnWhiteboard.controller.Event.JoinRoomError:
      break;
    case qnWhiteboard.controller.Event.DocumentChange:
      break;
    case qnWhiteboard.controller.Event.BackgroundChange:
      break;
    case qnWhiteboard.controller.Event.WidgetActivity:
      break;
    case qnWhiteboard.controller.Event.FileFlip:
      break;
    case qnWhiteboard.controller.Event.RecoveryState:
      break;
    case qnWhiteboard.controller.Event.WidgetAction:
      break;
  }
}

//注册白板的事件回调函数
qnWhiteboard.registerEvent(qnWhiteboard.controller.Event.AllEvent, processEvent);
```

## API 文档

### QNWhiteboard 实例方法

#### 加入房间

首先访问自己的服务器获取要加入的白板房间的token参数（房间的创建和token的生成由服务器对接SDK服务端接口）。

[如果您还不知道如何生成 RoomToken，请先阅读 七牛实时音视频云接入指南](https://doc.qnsdk.com/rtn/docs/rtn_startup)

```ts
/**
 * 加入房间状态
 */
enum JoinRoomStatus {
  Open = 'open',
  Error = 'error',
  Close = 'close'
}

interface JoinRoomCallbackResult {
  status: JoinRoomStatus;
  event: Event;
}

/**
 * 加入房间 WebSocket 状态
 */
type JoinRoomCallback = (result: JoinRoomCallbackResult) => void;

/**
 * 白板的大小
 * 默认 3
 */
enum BoardSize {
  Row2Column2 = 1,
  Row3Column3,
  Row1Column3
}

/**
 * 表示白板的颜色
 */
enum BgColor {
  White = 1,
  Black,
  Green
}

/**
 * 加入房间配置
 * 创建的白板(meeting)的大小。有三个可选值：1,2,3 1代表白板是2x2, 2代表白板是3x3, 3代表白板是1x3 默认
 * bgColor  [可选] 表示白板(meeting)的颜色。也有三个值可选: 1,2,3 1 代表白色，2 代表黑色，3 代表绿色。
 * limitNumber  0代表不限制：如果 >0，代表白板内最多limitNumber个人，只要白板内人数超过limitNumber数量时，就会进不去。
 * aspectRatio 宽高比，0.5 ～ 2.5之间，非必填
 * zoomScale 扩展比 1～5之间 非必填
 * title 白板标题(长度 1 ~ 20 支持数字、字符、下划线_)，相同的RTC房间，如果title相同，则进相同的房间，一个RTC房间可以有多个白板房间，标题不同就会生成新的，非必填
 */
interface JoinRoomConfig {
  boardSizeId?: BoardSize,
  bgColor?: BgColor,
  limitNumber?: number,
  aspectRatio?: number,
  zoomScale?: number
  title?: string;
}

joinRoom(
  roomToken:string, 
  callback: JoinRoomCallback, 
  config?: JoinRoomConfig
)
```

#### 离开房间

```js
leaveRoom()
```

#### widget 缩放

```js
// 1-放大，2-缩小
enum WidgetConfigScale {
  Zoom = 1, // 放大
  ZoomOut = -1 // 缩小
}
scaleWidget(config: WidgetConfig)
```

#### 删除 widget

```js
deleteWidget(widgetId: string)
```

#### 还原笔迹

```js
rubberUndo()
```

#### 清空 undo 回收站

```js
clearRecovery()
```

#### 设置白板输入模式属性

```js
// 画笔类型 type，0-写字笔，	1-荧光笔，2、3、4、5为指针状态
// 画笔颜色 color: string; #FF+颜色;彩笔: #7F+颜色  
// 画笔尺寸 size: number; 
enum PenType {
  WritingPen,
  HighlighterPen,
  Pointer1,
  Pointer2,
  Pointer3,
  Pointer4,
}
interface PenStyle {
  type?: PenType,
  color?: string,
  size?: number
}
setPenStyle(penStyle: PenStyle)
```

#### 设置白板输入模式

```js
enum InputMode {
  Select = 'select', // 选择模式
  Pencil = 'pencil', // 普通画笔模式
  Laser = 'laser', // 激光模式
  Rubber = 'rubber', // 橡皮模式
  Geometry = 'geometry', // 图形模式
  Mark = 'mark' // mark 笔模式
}
setInputMode(mode: InputMode)
```

#### 设置橡皮参数

```js
setEraseSize(size: number)
```

#### 设置图形模式

```js
// 0-矩形，1-圆，3-线，6-箭头
enum GeometryMode {
  Rectangle = 0,
  Circle = 1,
  Line = 3,
  Arrow = 6
}
setGeometryMode(mode: Mode)
```

#### 设置白板的背景色

```js
// #FF+颜色
// 透明白板值：#00000000
setWhiteboardBack(color: string)
```

#### 新建文档

```js
newDocument()
```

#### 切换文档

```js
cutDocument(widgetId: string)
```

#### 插入文档

```js
/**
 * 注意：这里的 api 是向传入 widgetId 前面插入的
 */
insertDocument(widgetId: string)
```

#### 删除文档

```js
deleteDocument(widgetId: string)
```

#### 文件上传

```tsx
interface RoleID {
  roleName: string;
  roleId: number;
  level: number;
}

interface Superior {
  appId: string;
  meetingId: string;
  userId: string;
  token: string;
  chatRoomId: number;
  fileGroupId: string;
  sessionId: string;
  nickName: string;
  avatar: string;
  roleId: RoleID[];
}

// file 为上传的文件，可写入一个 <input type="file" id="upload-file" /> 元素。
// 然后获取到这个元素的选中的文件：通过监听这个元素的 change 事件，获取 event.target.files[0] 的值即为要上传的文件
// superior 直接使用 Object.assign(qnWhiteboard.controller.room, qnWhiteboard.controller.me) 得到的值
// left-上传后文件展示的位置
// top-上传后文件展示的位置
// width, height-上传后文件展示的宽和高
interface UploadFileConfig {
  file?: File;
  superior?: Superior,
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  callback?: (error?: any) => void;
}

uploadFile(config: UploadFileConfig)
```

#### 清屏

```tsx
interface ClearPageConfig {
  widgetId: string
}

clearPage(config: ClearPageConfig)
```

#### 设置 canvas

```tsx
// 不传参默认为全屏
// 注：需要在白板完全初始化之后才可以设置(DocumentChange 事件之后执行)
interface SetCanvasStyle {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
}

setCanvasStyle(style: SetCanvasStyle)
```

#### 销毁 webgl 上下文

```tsx
// 可以通过访问 QNWhiteboard.controller.isWebglContextLost 来访问 webgl 上下文是否被销毁
// controller.isWebglContextLost 为 true，则为被销毁；false 为未被销毁
destroyWebglContext();
```

#### 事件回调接口介绍

示例：

```js
// 事件注册
// 第一个参数是要注册的事件类型，
// allEvent表示要监听所有事件，
// 如果要监听单一事件，请按照下面的参数说明来注册，第二个参数是要绑定的事件处理函数
qnWhiteboard.registerEvent(qnWhiteboard.controller.Event.AllEvent, processEvent);

function processEvent(event, params) {
  switch (event) {
    case qnWhiteboard.controller.Event.PageListChanged:
      break;
    case qnWhiteboard.controller.Event.WebassemblyReady:
      break;
    // ....
  }
}

// 事件注销
// 第一个参数是事件名称,AllEvent代表所有，其他单一事件参考下面的参数说明;第二个参数是具体的绑定函数
qnWhiteboard.unregisterEvent(qnWhiteboard.controller.Event.AllEvent, processEvent);
```

#### 事件参数说明:

##### PageListChanged

```
页面列表变更，例如有人新建或者删除页面
```

##### WhiteboardSizeChanged

```
白板的尺寸发生变更
注：你也可以监听 DocumentChange 事件，然后从 qnWhiteboard.controller.documentWidth、qnWhiteboard.controller.documentHeight 获取白板宽和高
```

##### JoinRoomError

```
加入房间失败
```

##### DocumentChange

```
文档发生变更
注：获取白板宽高：qnWhiteboard.controller.documentWidth、qnWhiteboard.controller.documentHeight
```

##### BackgroundChange

```
背景色发生变更
```

##### WidgetActivity

```
当前的活动 widget 发生变更
```

##### FileFlip

```
当前 widget 被翻页
```

##### RecoveryState

```
橡皮的可还原状态发生变更
```

##### WidgetAction

```
有文件发生变化，例如插入、删除等
```

#### WidgetScroll

```
文件滚动事件发生，ScrollToTop 为 1 表示滚动顶部，ScrollToBottom 为 1 标识滚动到了底部
```
