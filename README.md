# QNSolutions_Web

方案研发

## 功能

* 实时互动
    * 实时视频/音频聊天 (RTC)
    * 实时消息传递 (RTM)
    * 多功能交互式白板
* 登录方式
    * 手机验证码登录

## 快速启动

### 安装依赖

包管理工具使用 pnpm

cd 到当前目录，并执行以下操作

为所有 package 安装依赖

```shell
$ pnpm install
```

### 运行

```shell
# 执行之后，选择对应要运行的项目
$ pnpm start
```

## 规范

### changelog

使用以下工具来生成changelog:

* [changesets](https://github.com/changesets/changesets/blob/main/packages/cli/README.md)
* [ar-changelog](https://github.com/Spencer17x/arca/tree/main/packages/scripts/ar-changelog)
* [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli)

### 主依赖

* vite: 2.7.0
* react-router-dom: 5.3.3
* @types/react-router-dom: 5.3.3

### SDK打包工具

* [tsup](https://github.com/egoist/tsup)
* [rollup](https://github.com/rollup/rollup)

## 项目结构

* sdk部分
  * [qnuniapp-im](./packages/qnuniapp-im/README.md)
  * [qnweapp-im](./packages/qnweapp-im/README.md)
  * [qnweb-exam-high-level](./packages/qnweb-exam-high-level/README.md)
  * [qnweb-im](./packages/qnweb-im/README.md)
  * [qnweb-rtc-ai](./packages/qnweb-rtc-ai/README.md)
  * [qnweb-whiteboard](./packages/qnweb-whiteboard/README.md)
  * [whiteboard](./packages/whiteboard/README.md)
  * [qnweb-exam-sdk](./packages/qnweb-exam-sdk/README.md)
* demo部分
  * [qnuniapp-im-demo](./packages/qnuniapp-im-demo/README.md)
  * [qnweapp-im-demo](./packages/qnweapp-im-demo/README.md)
  * [qnweapp-interview-demo](./packages/qnweapp-interview-demo/README.md) 
  * [qnweb-cloud-class-demo](./packages/qnweb-cloud-class-demo/README.md) 
  * [qnweb-exam-system-demo](./packages/qnweb-exam-system-demo/README.md) 
  * [qnweb-high-level-rtc](./packages/qnweb-high-level-rtc/README.md) 
  * [qnweb-im-demo](./packages/qnweb-im-demo/README.md) 
  * [qnweb-interview-demo](./packages/qnweb-interview-demo/README.md) 
  * [qnweb-overhaul-demo](./packages/qnweb-overhaul-demo/README.md) 
  * [qnweb-rtc-ai-demo](./packages/qnweb-rtc-ai-demo/README.md) 
  * [qnweb-video-together-demo](./packages/qnweb-video-together-demo/README.md) 
  * [qnweb-whiteboard-demo](./packages/qnweb-whiteboard-demo/README.md) 
  * [qnuniapp-voice-chat](./packages/qnuniapp-voice-chat/README.md) 

## 规范

### changelog

使用以下工具来生成changelog:

* [changesets](https://github.com/changesets/changesets/blob/main/packages/cli/README.md)
* [ar-changelog](https://github.com/Spencer17x/arca/tree/main/packages/scripts/ar-changelog)
* [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli)

### 主依赖

* vite: 2.7.0
* react-router-dom: 5.3.3
* @types/react-router-dom: 5.3.3

### SDK打包工具

* [tsup](https://github.com/egoist/tsup)
* [rollup](https://github.com/rollup/rollup)
