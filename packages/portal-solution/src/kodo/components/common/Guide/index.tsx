/**
 * @desc component for Guide
 * @author yaojingtian <yaojingtian@qiniu.com>
 * @author Surmon <i@surmon.me>
 * @description <GuideGroup> 提供开箱即用的导览解决方案，仅需传入 steps 即可，组件内部自动管理（已阅、关闭）状态
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { computed, observable, action, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Inject } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { LocalStorageStore } from 'portal-base/common/utils/storage'
import { RoleConsumer, IRoleAccessor } from 'portal-base/common/components/Role'

import { isHtmlElement } from 'kodo/utils/dom'
import GuideGroupBasic, { IStep } from './Group'

// 存储相关的配置
const GUIDE_VISITED_LOCALSTORAGE_KEY = 'kodoPortalGuideVisited'

// 每组 Guide 对应的 localStorage 的 key
export function getGuideLocalStorageKey(stepRoleSelector: string, groupName?: string) {
  return `${GUIDE_VISITED_LOCALSTORAGE_KEY}-${groupName || ''}-${stepRoleSelector}`
}

// 此 Step 是否访问过/送达过
export function isGuideStepVisited(
  localStorageStore: LocalStorageStore,
  stepRoleSelector: string,
  groupName?: string
): boolean {
  return localStorageStore.getItem(getGuideLocalStorageKey(stepRoleSelector, groupName))
}

// 标记 Step 为访问过/送达过
export function makeGuideStepVisited(
  localStorageStore: LocalStorageStore,
  stepRoleSelector: string,
  groupName?: string
) {
  return localStorageStore.setItem(getGuideLocalStorageKey(stepRoleSelector, groupName), true)
}

export interface IProps {
  name?: string // 导览组名称
  steps: IStep[] // 所有导览步骤
  children?: React.ReactNode
}

interface IGuideGroupComponentProps extends IProps {
  localStorageStore: LocalStorageStore
  roleAccessor: IRoleAccessor
}

@observer
class GuideGroupComponent extends React.Component<IGuideGroupComponentProps> {
  disposable = new Disposable()
  @observable stepRoleSelector: string | null = null

  constructor(props: IGuideGroupComponentProps) {
    super(props)
    makeObservable(this)
  }

  @computed get stepElementMap(): Map<string, HTMLElement> {
    const htmlElementMap = new Map<string, HTMLElement>()

    // 当传入 steps 为空，不启用指引
    if (!this.props.steps) {
      return htmlElementMap
    }

    // props.steps 为全量集合，以（visited & Role 有效性 & DOM 有效性）作为条件取交集，即为最终需要渲染的 steps
    this.props.steps.forEach(step => {
      // 确保未展示过
      if (isGuideStepVisited(this.props.localStorageStore, step.roleSelector, this.props.name)) {
        return
      }

      // 确保存在有效 Role
      const targetRoles = this.props.roleAccessor.querySelectorAll(step.roleSelector)
      if (!targetRoles.length) {
        // 此处不该有错误提示
        // 如果某个 Step 没有对应的 Role 是符合预期的、合理的，比如可能：有异步 Role 的存在
        return
      }
      // TODO: Role 支持 [] 选择器后此处便不存在此问题
      if (targetRoles.length > 1) {
        // eslint-disable-next-line no-console
        console.error(`Guide:Step:${step.roleSelector}: 找到多个匹配的 Role！`)
        return
      }

      const targetRole = targetRoles[0].ref
      // eslint-disable-next-line react/no-find-dom-node
      const element = ReactDOM.findDOMNode(targetRole)
      // 确保存在有效 DOM & 排除非 HTML 节点，如 svg、纯文本
      if (element && isHtmlElement(element)) {
        // 符合 Guide 对目标元素的预期 -> 添加进 Map
        htmlElementMap.set(step.roleSelector, element)
        return
      }

      // eslint-disable-next-line no-console
      console.error(`Guide:Step:${step.roleSelector}:Role 没有有效的 children 内容！`)
    })

    return htmlElementMap
  }

  @computed get steps(): IStep[] {
    return !this.props.steps
      ? []
      : this.props.steps.filter(step => this.stepElementMap.has(step.roleSelector))
  }

  @action updateStepRoleSelector(stepRoleSelector: string | null) {
    this.stepRoleSelector = stepRoleSelector
  }

  autoResetStepRoleSelector() {
    // 如果当前 steps 已为空，则将选中 step 置为 null
    if (!this.steps.length) {
      this.updateStepRoleSelector(null)
      return
    }

    // 若当前 step 为 null，则激活第一个 step
    if (this.stepRoleSelector == null) {
      this.updateStepRoleSelector(this.steps[0].roleSelector)
      return
    }

    // 若当前 stepRoleSelector 无效，则做出对应处理
    const isUnavailableStep = this.steps.every(
      step => step.roleSelector !== this.stepRoleSelector
    )

    if (isUnavailableStep) {
      // 此组件不接受 “单项 step 被主动删除” 这种行为，调用者应自行保证 steps 变动时的有效性，如：等待异步 step 收到后统一传入 steps
      // 目前没有完备的解决方法，所以，当遇到当前 step 被删除后，暂时重置到第一个 step，以保证用户程序依旧可用
      // 同时对调用者做出错误提示
      // eslint-disable-next-line no-console
      console.error(`Guide:Step:${this.stepRoleSelector} 数据遇到非预期的删除行为，请检查 steps！`)
      this.updateStepRoleSelector(this.steps[0].roleSelector)
    }
  }

  @action.bound handleStepChange(stepRoleSelector: string) {
    // 无论如何都更新
    this.updateStepRoleSelector(stepRoleSelector)
    // 若关闭指引则将所有 step 标记为已读，localstorage 会响应式地驱动 computed 自动更新
    if (stepRoleSelector == null) {
      this.steps.forEach(step => makeGuideStepVisited(this.props.localStorageStore, step.roleSelector, this.props.name))
    }
  }

  @action.bound init() {
    // 首次自动更新 step & 关注 steps 的变化 -> 实时监测是否需要对选中值进行处理
    this.disposable.addDisposer(reaction(
      () => this.steps,
      () => this.autoResetStepRoleSelector(),
      { fireImmediately: true }
    ))
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    return (
      <GuideGroupBasic
        steps={this.steps}
        elementMap={this.stepElementMap}
        stepRoleSelector={this.stepRoleSelector}
        onStepChange={this.handleStepChange}
      >
        {this.props.children}
      </GuideGroupBasic>
    )
  }
}

export default function GuideGroup(props: IProps) {
  return (
    <Inject render={({ inject }) => {
      const localStorageStore = inject(LocalStorageStore)
      return (
        <RoleConsumer>
          {
            roleAccessor => (
              <GuideGroupComponent {...props} localStorageStore={localStorageStore} roleAccessor={roleAccessor} />
            )
          }
        </RoleConsumer>
      )
    }} />

  )
}
