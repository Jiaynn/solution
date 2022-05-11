本文介绍北纬白板 WEB 端加入房间和加入白板，且若白板是 ppt/pdf 模式下打开 ppt/pdf 的操作流程

## 1.准备

-1.引用`sdk文件`
-2.准备一个 div容器，id 为`iframeBox`

## 2.注册房间回调函数

`whiteboard为webassembly暴露的全局变量，不可更改`

```javascript
whiteboard.controller.registerRoomEvent({
	onJoinSuccess,
	onJoinFailed: () => console.log('onJoinFailed'),
	onRoomStatusChanged: () => console.log('onRoomStatusChanged'),
})
```

## 3.加入房间

`参数:appId, meetingId, userId, token均从服务端获取，可查看开发指南 -> 服务端`
```javascript
whiteboard.controller.join_room(appId, meetingId, userId, token)
// 加入成功或失败后会调用步骤2中注册的回调
```

## 4.关闭房间

```javascript
whiteboard.controller.leave_room()
```

### `以下流程确保在房间加入成功后使用，比如在1中onJoinSuccess回调中使用`

## 5.创建白板实例


`参数buckedId从服务端获取，可查看开发指南 -> 服务端`
```javascript
let testwhiteboard = whiteboard.controller.createInstance(buckedId)
```

## 6.注册白板回调函数

```javascript
testwhiteboard.registerWhiteBoardEvent({
	onWhiteBoardOpened: () => console.log('onWhiteBoardOpened'),
	onWhiteBoardOpenFailed: () => console.log('onWhiteBoardOpenFailed'),
	onWhiteBoardClosed: () => console.log('onWhiteBoardClosed'),
})
// 如果是ppt模式，还可注册ppt回调函数
testwhiteboard.registerPPTEvent({
	onFileLoadedSuccessful: () => console.log('onFileLoadedSuccessful'),
	onFileLoadingFailed: () => console.log('onFileLoadingFailed'),
	onFileStateChanged: (data) => console.log('onFileStateChanged', data),
})
// 如果是pdf模式，还可注册pdf回调函数
testwhiteboard.registerPDFEvent({
	onFileLoadedSuccessful: () => console.log('onFileLoadedSuccessful'),
	onFileLoadingFailed: () => console.log('onFileLoadingFailed'),
	onFileStateChanged: (data) => console.log('onFileStateChanged', data),
})
```

`ppt模式下onFileStateChanged回调参数内容如下:`
|名称|类型|描述|
|-|-|-|
|no|number|当前 ppt 页号|
|step|number|当前 ppt 动画位置索引|
|pageCount|number|ppt 总页数|
|stepCount |number|ppt 总动画数|

`pdf模式下onFileStateChanged回调参数内容如下:`
|名称|类型|描述|
|-|-|-|
|currentPage|number|当前 pdf 页号|
|pageCount|number|pdf 总页数|

## 7.打开白板

```javascript
testwhiteboard.openWhiteBoard()
```

## 8.关闭白板

```javascript
testwhiteboard.closeWhiteBoard()
```
