/**
 * @desc component for GuideGroup
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { computed, observable, action, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import Popover from 'react-icecream/lib/popover'
import { useInjection } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { LocalStorageStore } from 'portal-base/common/utils/storage'

import { getClientPosition, isElementInViewport } from 'cdn/utils/dom'
import GuideStep from './Step'
import RoleConsumer from '../Role/Consumer'

import './style.less'

export interface IGuideGroupProps<T> {
  name: string // 一组 guide 的名称
  order: T[] // 指定 guide 的顺序
  contentMap: Map<T, React.ReactNode> // guide 名称 - 描述内容的 map
  children?: React.ReactNode
}

const localStorageKey = 'guideBooted'

const isBooted = true
const notBooted = false

export function getLocalStorageKey(name: string) { // 每组 Guide 对应的 localStorage 的 key
  return `${localStorageKey}-${name}`
}

const margin = 5

type PropsWithDeps<T> = IGuideGroupProps<T> & {
  localStorageStore: LocalStorageStore
}

@observer
class GuideGroupInner<T extends string> extends React.Component<PropsWithDeps<T>> {
  constructor(
    props: PropsWithDeps<T>
  ) {
    super(props)
    makeObservable(this)
  }

  @observable.ref targetMap?: Map<T, HTMLElement>
  @action.bound updateTargetMap(targets: Map<T, HTMLElement>) {
    this.targetMap = targets
  }

  // 当前 Guide 的序号
  @observable currentIndex = 0

  @computed get list() {
    return (this.props.order || []).filter(
      name => this.targetMap && this.targetMap.has(name)
    )
  }

  // 当前的 Guide 名称
  @computed get current(): T | null {
    return this.list[this.currentIndex] || null
  }

  // 上一个 Guide
  @action.bound prev() {
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : 0
  }

  // 下一个 Guide
  @action.bound next() {
    this.currentIndex += 1
  }

  disposable = new Disposable()

  @computed get localStorageKey() {
    return getLocalStorageKey(this.props.name)
  }

  init() {
    if (!this.props.localStorageStore.getItem(this.localStorageKey) && this.props.order.length > 0) {
      // 首次查看当前这组 Guide，设置下 localStorage
      this.props.localStorageStore.setItem(this.localStorageKey, notBooted)
    }

    this.disposable.addDisposer(reaction(
      () => this.current,
      current => {
        if (!current) { return }

        const target = this.targetMap!.get(current)!
        if (!isElementInViewport(target)) { // 如果不在视域内，就滚动到可见区域并更新 target
          target!.scrollIntoView()
        }
      }
    ))

    this.disposable.addDisposer(reaction(
      () => this.currentIndex === this.list.length,
      isEnded => {
        if (!isEnded) { return }
        // 导引完成，标记一下
        this.props.localStorageStore.setItem(this.localStorageKey, isBooted)
      }
    ))
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  getHighlightArea() {
    if (this.props.localStorageStore.getItem(this.localStorageKey)
      || !this.targetMap || !this.targetMap.has(this.current!)) { return }

    const target = this.targetMap.get(this.current!)!
    const targetPosition = getClientPosition(target)

    return {
      top: targetPosition.top - margin,
      left: targetPosition.left - margin,
      right: targetPosition.right - margin,
      bottom: targetPosition.bottom - margin,
      width: target.offsetWidth,
      height: target.offsetHeight
    }
  }

  @computed get stepContentView() {
    if (this.props.localStorageStore.getItem(this.localStorageKey)) { return }

    const content = (
      this.props.contentMap && this.props.contentMap.has(this.current!)
      ? this.props.contentMap.get(this.current!)
      : null
    )

    return (
      <GuideStep
        activeIndex={this.currentIndex}
        total={this.list.length}
        onPrev={this.prev}
        onNext={this.next}
      >
        {content}
      </GuideStep>
    )
  }

  render() {
    const { children } = this.props
    const highlightArea = this.getHighlightArea()

    if (this.props.localStorageStore.getItem(this.localStorageKey)) { // 已经看过导览，直接返回 children
      return <>{children}</>
    }

    const maskStyle = {
      borderTopWidth: number2Px(highlightArea && highlightArea.top),
      borderLeftWidth: number2Px(highlightArea && highlightArea.left),
      borderRightWidth: number2Px(highlightArea && highlightArea.right),
      borderBottomWidth: number2Px(highlightArea && highlightArea.bottom)
    }

    const anchorStyle = {
      top: number2Px(highlightArea && highlightArea.top),
      left: number2Px(highlightArea && highlightArea.left),
      width: number2Px(highlightArea && highlightArea.width + 2 * margin),
      height: number2Px(highlightArea && highlightArea.height + 2 * margin)
    }

    return (
      <div data-role="guide-wrapper" className="comp-guide-wrapper">
        <RoleConsumer onRolesDomChange={this.updateTargetMap}>
          {children}
        </RoleConsumer>
        <div className="guide-mask" style={maskStyle}></div>
        <Popover visible placement="bottom" content={this.stepContentView}>
          <div className="guide-mask-popover-anchor" style={anchorStyle}></div>
        </Popover>
      </div>
    )
  }
}

function number2Px(value?: number): string {
  return value ? value + 'px' : '0'
}

export function GuideGroup<T extends string>(props: IGuideGroupProps<T>) {
  const localStorageStore = useInjection(LocalStorageStore)

  return <GuideGroupInner {...props} localStorageStore={localStorageStore} />
}
