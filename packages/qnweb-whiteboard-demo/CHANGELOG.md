## [2.2.3](https://github.com/qbox/QNSolutions_Web/compare/qnweb-whiteboard-demo@2.2.2...qnweb-whiteboard-demo@2.2.3) (2022-11-02)


### Bug Fixes

* **qnweb-whiteboard-demo:** 补充-2.2.2版本wasm资源更新 ([a08adab](https://github.com/qbox/QNSolutions_Web/commit/a08adab4bbe96389f4fcdee5b79d90f8c8cf9204))
* **qnweb-whiteboard-demo:** 更新wasm，修复回放模块的问题 ([00bb109](https://github.com/qbox/QNSolutions_Web/commit/00bb109a076c831a3deaeba57c6884ccf60e7d1b))
* **qnweb-whiteboard-demo:** 添加@types/react-router-dom ([74eff2f](https://github.com/qbox/QNSolutions_Web/commit/74eff2f7ebcd16c4af1fa6ea5c0f641d16bbdd22))
* **qnweb-whiteboard-demo:** 修复打包之后带版本的包丢失静态资源 ([039f607](https://github.com/qbox/QNSolutions_Web/commit/039f60735dbc7ebc8641e3c99bd50fbe82cff7ea))


### Features

* **qnweb-whiteboard-demo:** 创建dist-version脚本来优化打包方式 ([5574592](https://github.com/qbox/QNSolutions_Web/commit/5574592c51d91e3cf47c1fd7dfad0e1448d9a0d6))
* **qnweb-whiteboard-demo:** qnweb-whiteboard 升级到 2.2.3 ([5b584f4](https://github.com/qbox/QNSolutions_Web/commit/5b584f418fdb9b4337810d2cf00f12d1d63d2d79))



## [2.1.2](https://github.com/qbox/QNSolutions_Web/compare/qnweb-whiteboard-demo@2.1.1...qnweb-whiteboard-demo@2.1.2) (2022-09-15)


### Bug Fixes

* **qnweb-whiteboard-demo:** 修复赋值错误引发的跨域问题 ([00075ac](https://github.com/qbox/QNSolutions_Web/commit/00075acb5b81d5eb1a790b0f5b9f6b1d5cb8fee6))



## 2.1.1 (2022-09-09)

### Bug Fixes

* 修复白板normal类型房间无法修改背景色BUG
* 修复房间内ppt_play模式和pdf_scroll模式切换normal模式时下层预览的文件未正确切换BUG
* setPenStyle设置pen_mode为3时（手指模式）,手指更显眼
* 调用joinRoom接口时白板wasm资源准备就绪会报错
* 优化打开白板流程，提升打开时的速度
* 修复同时有人缩小和放大白板会导致白板崩溃的BUG

### Features

* offlineConfig
* enterOffline
* exitOffline
* 新增房间回调`onWidgetActivity`，点击白板时触发，返回点击区域资源的widgetId
* 新增房间回调`webAssemblyOnReady`,白板wasm资源准备就绪
* 白板实例新增resize方法，设置白板大小



## 2.2.2 (2022-10-18)

### Features

* 新增[preUpload](#preUpload)和[loadPreUploadFile](#loadPreUploadFile)方法，预上传文件与渲染预上传文件
