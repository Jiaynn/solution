# QNSolutions_Web

一个基于pnpm，集合了牛魔方、白板、IM等项目的monorepo

## 分支

* main：生产环境分支
* develop：测试环境分支
* insex-rtc-ai-v2：新致客户 rtc-ai 项目分支
* rtc-ai-v4：基于 [qnweb-rtc](https://developer.qiniu.com/rtc/9478/an-overview-of-the-web-sd) sdk 的 rtc-ai 项目分支
* vr-player：VR 播放器项目分支
* whiteboard-v1：白板项目 v1 版本分支
* whiteboard-v2：白板项目 v2 版本分支

## 如何运行/打包

### 安装依赖

```shell
$ pnpm install
```

### 运行

[packageName] 为项目名称，如 qnweb-interview-demo

首先需要构建 [packageName] 所需的workspace的依赖（如果依赖于workspace的package的话），然后在执行执行以下命令：

```shell
$ pnpm --filter [packageName] dev
```

### 打包

[packageName] 为项目名称，如 qnweb-interview-demo

首先需要构建 [packageName] 所需的workspace的依赖（如果依赖于workspace的package的话），然后在执行执行以下命令：

```shell
$ pnpm --filter [packageName] build
```

## 脚本

为了便于构建以及运行，编写了一些脚本，位于 scripts 目录下。

```shell
# 直接运行，会在终端给出一些问题引导你运行想要运行的项目
$ ts-node scripts/start.ts
```

```shell
# 仅打包 [packageName] 所需要构建的相关的 workspace 中的 package，以及运行一些 shell 脚本来同步文件，具体查看 scripts/task.ts
$ ts-node scripts/start.ts [packageName]
```
