/**
 * @file deep merge utils
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import { isPlainObject } from 'lodash'
import produce from 'immer'

// https://github.com/lodash/lodash/wiki/FP-Guide

// TODO: 参考 lodash 修复安全漏洞
// TODO: 用 Object.assign 辅助实现好像会简单点

// TODO: deepCompare deepClone deepCopy deepMerge deepAssign etc...

// TODO: highcharts
//   `deepPartial<T>` for highcharts config
//   @types/highcharts
//   @types/react-highcharts

type ObjectKey = string | symbol | number

// DFS 的 node(ref) path
interface IPath<T = any> {
  ref: T // reference of (parent) node
  key: ObjectKey // key (property name) of node
}

// 检测依赖（菱形依赖 / 循环依赖），维持状态
// 目前只关心 source 的 被递归部分（pure array / object） 的 循环依赖，即 只保证基本正确性
function updateDepInfoOfPureMerge<T extends object>(
  // node
  ref: T,
  // 跟 stack 一一对应  TODO: path 其实还是取代不了原始的 call stack 的
  path: Array<IPath<T>>,
  // nodes' refs；感觉是不是普通的 Set 反而更好……
  cache: WeakSet<T>
) {
  if (!cache.has(ref)) {
    cache.add(ref)
    return
  }

  // not diamond dependency
  // TODO: path find 性能优化
  if (path.find(node => node.ref === ref)) {
    throw new Error(
      'Circular structure found in `source` argument of merge util, path: '
      + path.map(node => node.key).join(' -> ')
    )
  }
}

// 一个干净的、只递归 pure array / object 的、行为更像 deep assign 的、会检测循环依赖的 merge 方法
// TODO: 改善对 target / source 的 菱形依赖 / 循环依赖 的检测程度（详见 UT）
// TODO: path 反复重新生成性能优化
// TODO: 参数太多太复杂，待优化；会不会用闭包比传进去好，简单直接性能好？
function pureMerge<T, U>(
  target: T,
  source: U,
  path: IPath[] = [],
  cache = new WeakSet(),
  update = updateDepInfoOfPureMerge
): T & U {
  if (Array.isArray(target) && Array.isArray(source)) {
    update(source, path, cache)

    // 缓存 length
    const targetLength = target.length
    const sourceLength = source.length

    // 数组扩容：性能，并且考虑 source 结尾是 empty 的情况
    if (sourceLength > targetLength) {
      target.length = sourceLength
    }

    const guardPosition = Math.min(targetLength, sourceLength)

    // 正序遍历，对 菱形依赖 / 循环依赖 比较友好，符合直觉、方便调试
    // 不用 forEach 是因为不使用闭包性能也许会好点，同时也方便调试，也不用考虑 forEach 是否会跳过 empty

    // 1、overwrite
    for (let index = 0; index < guardPosition; index++) {
      // 跳过 empty
      if (Object.prototype.hasOwnProperty.call(source, index)) {
        target[index] = pureMerge(
          target[index],
          source[index],
          [...path, { key: index, ref: source }],
          cache,
          update
        )
      }
    }

    // 2、append
    for (let index = guardPosition; index < sourceLength; index++) {
      // 跳过 empty
      if (Object.prototype.hasOwnProperty.call(source, index)) {
        // TODO: 不经过 pureMerge，依赖分析数据丢失（但也许确实不需要。。？还有其他故意忽略的情况）
        target[index] = source[index]
      }
    }

    return target as any
  }

  if (isPlainObject(target) && isPlainObject(source)) {
    update(source, path, cache)

    // 排除各种乱七八糟的干扰项
    const sourceKeys = Object.keys(source)
    // 缓存 length
    const sourceKeysLength = sourceKeys.length

    // 正序遍历，key 顺序大概率会被保留，方便调试
    // 不用 forEach 是因为不使用闭包性能也许会好点，同时也方便调试
    for (let index = 0; index < sourceKeysLength; index++) {
      const key = sourceKeys[index]
      target[key] = pureMerge(
        target[key],
        source[key],
        [...path, { key, ref: source }],
        cache,
        update
      )
    }

    return target as any
  }

  // 两种可能：
  //   1、类型不同
  //   2、void / `基本`类型 (primitive) / Object.is? / `复杂`类型
  // 注意：
  //   类似 merge(**, null / void 0 / new Date) 会得到 null / undefined / date instance 的结果
  //   这是有意而为之的，目的是为了保持规则的简单性和一致性，即不区分是参数还是正在被递归的内部
  //   因此请自行保证合并`相同类型`的东西，以免被意外覆盖，如类似这样处理：
  //   merge(obj, source || {}) / merge(arr, source || [])
  return source as any
}

// 对 target 有副作用
function pureMergeAll<T, U>(target: T, source: U): T & U
function pureMergeAll<T, S1, S2>(target: T, s1: S1, s2: S2): T & S1 & S2
function pureMergeAll<T, S1, S2, S3>(target: T, s1: S1, s2: S2, s3: S3): T & S1 & S2 & S3
function pureMergeAll<T, S1, S2, S3, S4>(target: T, s1: S1, s2: S2, s3: S3, s4: S4): T & S1 & S2 & S3 & S4
function pureMergeAll(target: any, ...sources: any[]): any
function pureMergeAll(target, ...sources) {
  // 注意：target 不一定等于 pureMerge 返回值，哪怕 target 可能已经被修改了
  sources.forEach(source => { target = pureMerge(target, source) })
  return target
}

// immutable 版的 mergeAll
function mergeAll<T, U>(target: T, source: U): T & U
function mergeAll<T, S1, S2>(target: T, s1: S1, s2: S2): T & S1 & S2
function mergeAll<T, S1, S2, S3>(target: T, s1: S1, s2: S2, s3: S3): T & S1 & S2 & S3
function mergeAll<T, S1, S2, S3, S4>(target: T, s1: S1, s2: S2, s3: S3, s4: S4): T & S1 & S2 & S3 & S4
function mergeAll(target: any, ...sources: any[]): any
function mergeAll(target, ...sources) {
  // 注意：target 不一定等于 pureMerge 返回值，哪怕过程中试图修改过 target
  // immer 会忽略值为 undefined 的返回值，因此在这里修正
  let isUndefined = false
  const result = produce(target, draft => {
    draft = pureMergeAll(draft, ...sources)
    isUndefined = draft === undefined
    return draft
  })
  return isUndefined ? undefined : result
}

// 推荐使用，行为更接近于 `针对 JSON 的 deep assign`，具体特性如下：
// 1、真 immutable （通过 immer 实现），既不是 patch 也不是 deep clone
// 2、不跳过 undefined 和 null，包括 arguments 里的
// 3、跳过 array 的 empty
// 4、跳过 array 的非 index 部分
// 5、不 concat array
// 7、暂不考虑 Symbol  // TODO: 好像生效了… 跟 immer 有关？反正是 immutable 要不要用 merge({}, target, ...sources) 绕过去？
// 8、不进入原型链
// 9、不通过 generator 遍历
// 10、不遍历 enumerable 为 false 的 property
// 11、遍历的时候不会太过考虑 property description 的影响 （同 Proxy & Object.freeze）
// 12、不保证保持 property description 的各项 feature （同 Proxy & Object.freeze）
// 13、只深度处理 native array 和 plain object，其他都是浅复制
//   （包括 arguments NodeList HTMLElements Date RegExp Symbol Buffer Number String Boolean Function Error 等等）
// 14、只做加法，不做减法
// 15、一定程度的 循环依赖 和 菱形依赖 的检测和处理（但过程和结果都不保证一致性，实际从理论上说也做不到完满）
// 16、一定程度的 ts 类型支持  // TODO: 支持类似 <T, U extends deep Partial<T>> 的 feature  // FIXME: type like number & string...
// 17、underscore 不好用，lodash 和 lodash/fp 也不好用，还不如 ramda js
// 总的理念：它的规则比较简单、行为比较确定、做的事情尽可能地少，less is more，降低 deep merge 传统的语义模糊性，用起来省心；
// 或者说：稍微复杂、模糊一点的场景，它都会逼着你想清楚并亲自下场处理，从而让用的人和看代码的人都心里有底不用猜
export default mergeAll

export { pureMerge, pureMergeAll, mergeAll }
