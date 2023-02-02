# qnweb-whiteboard-demo

七牛云白板demo

基于 qnweb-whiteboard，集成了画笔、马克笔、手势、橡皮擦、图形等功能。

由于底层使用了 webassembly 相关技术，用户需要自行部署 [webassembly](./public/webassembly) 相关资源，并通过 initConfig 来配置 webassembly 相关资源地址。

## 相关文档

* [SDK 快速接入](./documents/QUICK_START.md)
* [SDK API 文档](./documents/SDK_API.md)
* [技术原理](./documents/PRINCIPLE.md)

## 相关资源

* [webassembly](./public/webassembly)
* [SDK](./public/sdk)

## 快速启动

```shell
$ pnpm install
$ pnpm dev
```

## 打包

### 测试环境

```shell
$ pnpm build:staging
```

### 线上环境

```shell
$ pnpm build
```

## FAQ(常见问题)

### 如何体验 Demo？

https://niucube-whiteboard.qiniu.com

或者

https://niucube-whiteboard.qiniu.com/[version]

注：[version] 为具体的版本号，如 2.1.2
