# qnweb-whiteboard-demo

白板demo

## 技术选型

* [React](https://github.com/facebook/react)
* [TypeScript](https://github.com/microsoft/TypeScript)
* [qnweb-whiteboard](https://www.npmjs.com/package/qnweb-whiteboard)

## 快速启动

```shell
$ pnpm install
$ pnpm dev
```

## 如何打包

```shell
$ pnpm build
```

## 常见问题

### 1.npm install 安装失败

报错如下：

```shell
npm WARN ERESOLVE overriding peer dependency
npm WARN While resolving: qnweb-whiteboard@1.1.0
npm WARN Found: whiteboard@undefined
npm WARN node_modules/whiteboard
npm WARN
npm WARN Could not resolve dependency:
npm WARN peer whiteboard@"^1.0.0" from qnweb-whiteboard@1.1.0
npm WARN node_modules/qnweb-whiteboard
npm WARN   qnweb-whiteboard@"*" from the root project
npm ERR! Cannot read property 'matches' of null

npm ERR! A complete log of this run can be found in:
npm ERR!     /Users/xxxx/.npm/_logs/2022-04-07T06_04_59_863Z-debug-0.log
```

**原因：** 在新版本的npm（v7）中，默认情况下，`npm install`当遇到冲突的`peerDependencies`时将失败。不会继续安装。

**解决方案：** 

1. 使用 yarn 或者 pnpm 安装
2. npm install qnweb-whiteboard --legacy-peer-deps

### 2. wasm 资源加载方式

默认情况下，wasm 在开发环境下资源存在于 node_modules 的 wasm 目录里，生产环境会自动改为 [unpkg.com](https://unpkg.com/qnweb-whiteboard)。

核心代码如下：

```ts
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
const defaultWasmPath = isDev ?
  resolveURL('/node_modules/qnweb-whiteboard/wasm/') :
  `https://unpkg.com/qnweb-whiteboard@${version}/wasm/`;
```

用户可以通过 ```QNWhiteboard.setConfig({ wasmPath: 'xxx' })``` 来设置 wasm 的访问资源。

由于 unpkg 的不确定性，建议用户将 wasm 相关资源下载下来部署到自己的服务器上，然后通过 setConfig 指向对应的路径。

该部分的逻辑借鉴于 [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)。
