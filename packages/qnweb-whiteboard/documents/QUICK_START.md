本文介绍七牛白板 WEB 端加入房间和加入白板，且若白板是 ppt/pdf 模式下打开 ppt/pdf 的操作流程

# 1. 准备

* 1.引用 sdk 文件
* 2.准备一个 div 容器，id 为 `iframeBox`

# 2. 创建实例

```ts
const client = QNWhiteBoard.create();
const instance = client.createInstance(bucketId);
```

# 3. 注册房间回调函数

```javascript
client.registerRoomEvent({
	onJoinSuccess: () => console.log('onJoinSuccess'),
	onJoinFailed: () => console.log('onJoinFailed'),
	onRoomStatusChanged: () => console.log('onRoomStatusChanged'),
})
```

# 4. 加入房间

```javascript
// 加入成功或失败后会调用步骤 3 中注册的回调
client.joinRoom(roomToken)
```

# 5. 关闭房间

```javascript
client.leave_room()
```

# 以下流程确保在房间加入成功后使用，比如在 3 中 onJoinSuccess 回调中使用

# 6. 创建白板实例


参数 `buckedId` 从服务端获取，可查看服务端开发指南
```javascript
const instance = client.createInstance(buckedId)
```

# 7. 注册白板回调函数

```javascript
instantce.registerWhiteBoardEvent({
	onWhiteBoardOpened: () => console.log('onWhiteBoardOpened'),
	onWhiteBoardOpenFailed: () => console.log('onWhiteBoardOpenFailed'),
	onWhiteBoardClosed: () => console.log('onWhiteBoardClosed'),
})
// 如果是 ppt 模式，还可注册 ppt 回调函数
instance.registerPPTEvent({
	onFileLoadedSuccessful: () => console.log('onFileLoadedSuccessful'),
	onFileLoadingFailed: () => console.log('onFileLoadingFailed'),
	onFileStateChanged: (data) => console.log('onFileStateChanged', data),
})
// 如果是 pdf 模式，还可注册 pdf 回调函数
instance.registerPDFEvent({
	onFileLoadedSuccessful: () => console.log('onFileLoadedSuccessful'),
	onFileLoadingFailed: () => console.log('onFileLoadingFailed'),
	onFileStateChanged: (data) => console.log('onFileStateChanged', data),
})
```

**ppt模式下 `onFileStateChanged` 回调参数内容如下:**

|名称|类型|描述|
|-|-|-|
|no|number|当前 ppt 页号|
|step|number|当前 ppt 动画位置索引|
|pageCount|number|ppt 总页数|
|stepCount |number|ppt 总动画数|

**pdf 模式下 `onFileStateChanged` 回调参数内容如下:**

|名称|类型|描述|
|-|-|-|
|currentPage|number|当前 pdf 页号|
|pageCount|number|pdf 总页数|

# 8. 打开白板

```javascript
client.openWhiteBoard()
```

# 9. 关闭白板

```javascript
client.closeWhiteBoard()
```
