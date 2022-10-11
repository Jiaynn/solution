# QNSolutions_Web

一个基于pnpm，集合了牛魔方、白板、IM等项目的monorepo

## 安装依赖

```shell
$ pnpm install
```

## 运行

[packageName] 为项目名称，如 qnweb-interview-demo

首先需要构建 [packageName] 所需的workspace的依赖（如果依赖于workspace的package的话），然后在执行执行以下命令：

```shell
$ pnpm --filter [packageName] dev
```

## 打包

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
