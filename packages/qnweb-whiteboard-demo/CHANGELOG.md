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



