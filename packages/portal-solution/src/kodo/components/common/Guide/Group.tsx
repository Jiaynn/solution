/**
 * @desc Basic component for GuideGroup UI
 * @author yaojingtian <yaojingtian@qiniu.com>
 * @author Surmon <i@surmon.me>
 * @description <GuideGroupBasic> 提供一个纯受控、无副作用的导览组件，其内部不包含状态，消费方需自己收集 DOM、维护状态、处理事件
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { computed, observable, action, reaction, autorun, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { mapValues } from 'lodash'
import Disposable from 'qn-fe-core/disposable'
import Popover from 'antd/lib/popover'
import { Button } from 'react-icecream/lib'

import { getClientPosition } from 'kodo/utils/dom'
import GuideStep from './Step'
import Mask from './Mask'
import { IProps as IGuideGroupProps } from '.'
import style from './style.m.less'

// 目标高亮元素与 MASK 之间的间隙
const HIGHLIGHT_AREA_MARGIN = 4

function number2Px(value: number): string {
  return value ? value + 'px' : '0'
}

export interface IStep<T extends string = string> {
  roleSelector: T
  content: React.ReactNode
}

export interface IGuideGroupBasicProps extends IGuideGroupProps {
  elementMap: Map<string, HTMLElement> // 用于导览的 DOM Map
  stepRoleSelector: string | null // 当前激活的 step 的选择器
  onStepChange(stepRoleSelector: string | null, stepIndex: number | null): void // 当 step 发生（切换）变化
}

interface IHighlightArea {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

@observer
export default class GuideGroupBasic extends React.Component<IGuideGroupBasicProps> {
  requestFrameID: number | null = null
  disposable = new Disposable()
  @observable.shallow highlightArea: IHighlightArea | null = null

  constructor(props: IGuideGroupBasicProps) {
    super(props)
    makeObservable(this)
  }

  @computed get list(): IStep[] {
    return this.props.steps || []
  }

  @computed get isGuideEnabled(): boolean {
    return this.list.length > 0 && this.props.stepRoleSelector !== null
  }

  @computed get currentStepIndex(): number {
    return this.list.findIndex(step => step.roleSelector === this.props.stepRoleSelector)
  }

  @computed get currentStep(): IStep | null {
    if (this.currentStepIndex != null) {
      return this.list[this.currentStepIndex]
    }

    return null
  }

  pageTo(targetIndex: number) {
    if (targetIndex !== this.currentStepIndex) {
      this.props.onStepChange(
        this.list[targetIndex].roleSelector,
        targetIndex
      )
    }
  }

  @action.bound prev() {
    this.pageTo(
      this.currentStepIndex > 0
      ? this.currentStepIndex - 1
      : 0
    )
  }

  @action.bound next() {
    const listMaxIndex = this.list.length - 1
    this.pageTo(
      this.currentStepIndex < listMaxIndex
      ? this.currentStepIndex + 1
      : listMaxIndex
    )
  }

  @action.bound close() {
    this.props.onStepChange(null, null)
  }

  @autobind getHighlightArea(): IHighlightArea | null {
    // 若目标区域 DOM 是无意义的，则不再继续获取信息
    const { elementMap } = this.props
    if (this.props.stepRoleSelector == null) return null
    if (!elementMap || !elementMap.has(this.props.stepRoleSelector)) {
      return null
    }

    const target = elementMap.get(this.props.stepRoleSelector)!
    const targetPosition = getClientPosition(target)

    return {
      top: targetPosition.top - HIGHLIGHT_AREA_MARGIN,
      left: targetPosition.left - HIGHLIGHT_AREA_MARGIN,
      right: targetPosition.right - HIGHLIGHT_AREA_MARGIN,
      bottom: targetPosition.bottom - HIGHLIGHT_AREA_MARGIN,
      width: target.offsetWidth,
      height: target.offsetHeight
    }
  }

  @action.bound updateHighlightArea() {
    const highlightArea = this.getHighlightArea()
    if (highlightArea) {
      if (this.highlightArea) {
        Object.assign(this.highlightArea, highlightArea)
      } else {
        this.highlightArea = observable(highlightArea)
      }
    }
  }

  @autobind autoUpdateHighlightArea() {
    this.updateHighlightArea()
    this.requestFrameID = window.requestAnimationFrame(this.autoUpdateHighlightArea)
  }

  cancelAutoUpdateHighlightArea() {
    if (this.requestFrameID) {
      window.cancelAnimationFrame(this.requestFrameID)
      this.requestFrameID = null
    }
  }

  init() {
    this.disposable.addDisposer(
      () => this.cancelAutoUpdateHighlightArea(),
      reaction(
        // 关心 Group 启用状态，决定是否启用实时渲染
        () => this.isGuideEnabled,
        isGuideEnabled => (
          isGuideEnabled
            ? this.autoUpdateHighlightArea()
            : this.cancelAutoUpdateHighlightArea()
        ),
        { fireImmediately: true }
      )
    )

    // 监听及 DOM 处理
    this.disposable.addDisposer(autorun(() => {
      const currentStepRoleSelector = this.props.stepRoleSelector
      const targetMap = this.props.elementMap
      if (!currentStepRoleSelector || !targetMap) {
        return
      }

      // 当激活项改变 -> 将目标项滚动到可见区域
      const target = targetMap.get(currentStepRoleSelector)
      if (target) {
        // 优先使用 scrollIntoViewIfNeeded API，此 API 可提前检测 “目标元素是否在可视区域内”，如果不在，才会进行滚动行为
        if ((target as any).scrollIntoViewIfNeeded) {
          (target as any).scrollIntoViewIfNeeded()
          return
        }
        // 否则使用 scrollIntoView API，任何情况下，自动滚动目标项宿主容器，使目标元素尽量滚动到可视区域正中心（此 API 可能会导致在频繁切换目标元素时，页面出现上下跳动的效果）
        target.scrollIntoView({
          behavior: 'auto',
          block: 'center'
        })
      }
    }))
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @computed get stepContentView() {
    const content = (
      this.currentStep
      ? this.currentStep.content
      : null
    )

    return (
      <>
        <Button
          type="link"
          icon="close"
          className={style.closeButton}
          onClick={this.close}
        />
        <GuideStep
          activeIndex={this.currentStepIndex}
          total={this.list.length}
          onPrev={this.prev}
          onNext={this.next}
        >
          {content}
        </GuideStep>
      </>
    )
  }

  @computed get popoverView() {
    const { highlightArea } = this
    if (!highlightArea) {
      return null
    }

    const width = highlightArea && highlightArea.width + 2 * HIGHLIGHT_AREA_MARGIN
    const height = highlightArea && highlightArea.height + 2 * HIGHLIGHT_AREA_MARGIN
    const top = highlightArea && highlightArea.top
    const left = highlightArea && highlightArea.left

    const highlightInfo = { top, left, width, height, radius: 4 }
    const anchorStyle = mapValues({ top, left, width, height }, number2Px)

    return (
      <>
        <Mask highlight={highlightInfo} />
        <Popover
          visible
          placement="bottomLeft"
          content={this.stepContentView}
          overlayClassName={style.guidePopover}
        >
          <div className={style.guideMaskPopoverAnchor} style={anchorStyle}></div>
        </Popover>
      </>
    )
  }

  render() {
    return (
      <div data-role="guide-wrapper" className={style.guideWrapper}>
        {this.props.children}
        {this.isGuideEnabled && this.popoverView}
      </div>
    )
  }
}
