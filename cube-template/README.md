# QNCube_Web

牛魔方demo

## 功能

* 实时互动
    * 实时视频/音频聊天 (RTC)
    * 实时消息传递 (RTM)
    * 多功能交互式白板
* 登录方式
    * 手机验证码登录

## 方案demo

* [监考场景](./packages/qnweb-exam-system-demo/README.md)
* [面试场景](./packages/qnweb-interview-demo/README.md)
* [检修场景](./packages/qnweb-overhaul-demo/README.md)
* [一起看视频场景](./packages/qnweb-video-together-demo/README.md)
* [云课堂场景](./packages/qnweb-cloud-class-demo/README.md)
* [小程序端面试场景](./packages/qnweapp-interview-demo/README.md)

## 快速启动

```shell
# <projectName> 为对应场景的项目名称，如：qnweb-exam-system-demo
$ pnpm i
$ pnpm --filter qnweb-high-level-rtc build:prod
$ pnpm --filter <projectName> dev
```
