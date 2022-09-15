## 2.1.2 (2022-09-15)


### Bug Fixes

* **qnweb-whiteboard:** 修复赋值错误引发的跨域问题 ([cc4ad12](https://github.com/qbox/QNSolutions_Web/commit/cc4ad12b96ad338101b721b48488bb0cfdd70266))
* **qnweb-whiteboard:** 修复类型引用错误 ([a9308aa](https://github.com/qbox/QNSolutions_Web/commit/a9308aa3a609322cb324cd30f2618ea7e693de9f))
* **qnweb-whiteboard:** 修复已知问题 ([6384d5e](https://github.com/qbox/QNSolutions_Web/commit/6384d5e73c20ed35f0cad0649666d8b81a8c28ce))


### Features

* **qnweb-whiteboard-demo:** 文档同步shell ([a65a819](https://github.com/qbox/QNSolutions_Web/commit/a65a8194a827ddaff7bfe973cf6e60b4b78f6abe))
* **qnweb-whiteboard-demo:** store封装 ([50e7920](https://github.com/qbox/QNSolutions_Web/commit/50e7920f1fd9f89bfdd38e343dac40d1baae5594))
* **qnweb-whiteboard-demo:** v2版本 ([e4c0ea3](https://github.com/qbox/QNSolutions_Web/commit/e4c0ea31235fa242e71ca6df5c8ea15070b0402e))
* **qnweb-whiteboard:** 结构调整 ([c0c1d3a](https://github.com/qbox/QNSolutions_Web/commit/c0c1d3a0aaaa3a4043513d4e923dd7edb45f204e))
* **qnweb-whiteboard:** 文档完成 ([8aaecd6](https://github.com/qbox/QNSolutions_Web/commit/8aaecd67035247b969ac626debfa1362bcb38880))
* **qnweb-whiteboard:** sdk api 文档 ([a51fe80](https://github.com/qbox/QNSolutions_Web/commit/a51fe80930e56e4f53748da31ee93e6ccdfb4e06))
* **qnweb-whiteboard:** sdk v2 ([090966f](https://github.com/qbox/QNSolutions_Web/commit/090966f7cc69a0e332b72e8bd34fd68807399550))



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



