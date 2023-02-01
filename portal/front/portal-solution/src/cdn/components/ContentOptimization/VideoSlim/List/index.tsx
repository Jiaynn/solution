/**
 * @desc component for 视频瘦身任务列表
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'

import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Link as RouterLink } from 'portal-base/common/router'
import { useLocalStore } from 'portal-base/common/utils/store'
import { bindTextInput } from 'portal-base/common/form'
import Icon from 'react-icecream/lib/icon'
import Button from 'react-icecream/lib/button'
import Input from 'react-icecream/lib/input'
import Table from 'react-icecream/lib/table'
import Modal from 'react-icecream/lib/modal'
import { PaginationProps } from 'react-icecream/lib/pagination'

import { antdToPromise } from 'cdn/utils'

import { transformStorageSize, humanizePercent } from 'cdn/transforms/unit'

import { DomainType } from 'cdn/constants/domain'
import { VideoSlimRole } from 'cdn/constants/role'
import { TaskState, taskStateTextMap } from 'cdn/constants/video-slim'

import Link from 'cdn/components/common/Link/LegacyLink'
import Role from 'cdn/components/common/Role'
import TipIcon from 'cdn/components/TipIcon'
import AutoEnableSwitch from 'cdn/components/ContentOptimization/Inputs/AutoEnableSwitch'
import Popover from 'cdn/components/common/Popover'

import { IVideoSlimTask } from 'cdn/apis/video-slim'

import Routes from 'cdn/constants/routes'

import CreateModal from '../CreateModal'

import { LocalStore } from './store'

import './style.less'

export { LocalStore } from './store'

const { Column } = Table
const confirm = antdToPromise(Modal.confirm)

export interface IProps {
  domain: string
}

interface PropsWithDeps extends IProps {
  store: LocalStore
  toasterStore: ToasterStore
  routes: Routes
}

const stateFilters = (Object.keys(TaskState) as Array<keyof typeof TaskState>)
  .filter(key => TaskState[key] !== TaskState.Deleted)
  .map(key => ({
    text: humanizeTaskState(TaskState[key]),
    value: TaskState[key]
  }))

@observer
export class VideoSlimListInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @computed get batchOperationsView() {
    const { store } = this.props
    if (!store.hasSelected) {
      return (
        <ul className="batch-operations">
          请勾选瘦身资源
        </ul>
      )
    }
    const selected = store.collectionStore.selectedStore.list

    const enableItem = <li key="enable" onClick={() => this.handleEnable(selected)}>启用</li>
    const disableItem = <li key="disable" onClick={() => this.handleDisable(selected)}>停用</li>
    const deleteItem = <li key="delete" onClick={() => this.handleDelete(selected)}>删除</li>
    const autoEnableItem = <li key="autoEnable" onClick={() => this.handleCdnAutoEnableChange(true, selected)}>开启自动 CDN 分发</li>
    const dontAutoEnableItem = <li key="dontAutoEnable" onClick={() => this.handleCdnAutoEnableChange(false, selected)}>关闭自动 CDN 分发</li>

    // 根据选中记录的状态显示可用操作
    const operations = [
      !selected.find(id => !canEnable(store.collectionStore.get(id)?.state)) && enableItem,
      !selected.find(id => !canDisable(store.collectionStore.get(id)?.state)) && disableItem,
      !selected.find(id => !canDelete(store.collectionStore.get(id)?.state)) && deleteItem,
      !selected.find(id => !canChangeAutoEnable(store.collectionStore.get(id)?.state)) && autoEnableItem,
      !selected.find(id => !canChangeAutoEnable(store.collectionStore.get(id)?.state)) && dontAutoEnableItem
    ].filter(Boolean)

    return (
      <ul className="batch-operations">
        {operations.length > 0 ? operations : '无可用操作'}
      </ul>
    )
  }

  @computed get operationsView() {
    const { store } = this.props
    const urlState = store.collectionStore.queryStore.urlState

    return (
      <div className="operations-wrapper">
        <div>
          <Role name={VideoSlimRole.AddTask}>
            <Button icon="plus" type="primary" loading={store.isDomainLoading} onClick={this.handleAddTask}>添 加</Button>
          </Role>
          <Popover content={this.batchOperationsView} trigger="hover" placement="bottom">
            <Button icon="ellipsis">批量操作</Button>
          </Popover>
        </div>
        <div className="video-slim-task-filter">
          <Button icon="reload" type="ghost" disabled={!this.props.domain || store.collectionStore.isLoading} onClick={this.handleRefresh}>刷新状态</Button>
          <Input.Search size="small" className="url-input" {...bindTextInput(urlState)} onSearch={this.handleSearch} />
        </div>
      </div>
    )
  }

  @autobind
  renderSizeColumn(_: unknown, row: IVideoSlimTask) {
    const originSize = transformStorageSize(row.originSize, { to: 'MB' }).toFixed(2)
    const afterSize = row.afterSize ? transformStorageSize(row.afterSize, { to: 'MB' }).toFixed(2) : '--'
    return `${originSize}/${afterSize}`
  }

  @autobind
  renderSlimRateColumn(_: unknown, row: IVideoSlimTask) {
    return (
      row.originSize && row.afterSize
      ? humanizePercent(1 - row.afterSize / row.originSize)
      : null
    )
  }

  @autobind
  renderStateColumn(_: unknown, row: IVideoSlimTask) {
    if (!row.stateDesc) {
      return <span className={getStateColor(row.state)}>{humanizeTaskState(row.state)}</span>
    }
    return (
      <span>
        <span className={getStateColor(row.state)}>{humanizeTaskState(row.state)}</span>
        <TipIcon tip={row.stateDesc} className="state-icon" />
      </span>
    )
  }

  @autobind
  renderAutoEnableColumn(_: unknown, row: IVideoSlimTask) {
    return (
      canChangeAutoEnable(row.state)
      ? (
        <AutoEnableSwitch
          value={row.cdnAutoEnable}
          onChange={val => this.handleCdnAutoEnableChange(val, [row.id])}
          simple
        />
      )
      : null
    )
  }

  @autobind
  renderOperationColumn(_: unknown, row: IVideoSlimTask) {
    const state = row.state
    const previewBtn = (
      <Role name={VideoSlimRole.PreviewBtn}>
        <RouterLink className="link-btn" relative target="_blank" rel="noopener" to={`/preview/${row.id}`}>预览</RouterLink>
      </Role>
    )
    const enableBtn = (
      <Role name={VideoSlimRole.EnableCDN}>
        <Link className="link-btn" onClick={() => this.handleEnable([row.id])}>启用</Link>
      </Role>
    )
    const disableBtn = <Link className="link-btn" onClick={() => this.handleDisable([row.id])}>停用</Link>
    const deleteBtn = <Link className="link-btn" onClick={() => this.handleDelete([row.id])}>删除</Link>
    return (
      <span className="operations-cell">
        {canPreview(state) && previewBtn}
        {canEnable(state) && enableBtn}
        {canDisable(state) && disableBtn}
        {canDelete(state) && deleteBtn}
      </span>
    )
  }

  @computed get listView() {
    const { store } = this.props

    const filterOptions = store.filterOptionsForTable
    const stateFilterOptions = {
      filters: stateFilters,
      filteredValue: filterOptions && filterOptions.state || null
    }

    return (
      <Table
        dataSource={store.collectionStore.list}
        rowSelection={store.collectionStore.rowSelection}
        pagination={store.collectionStore.paginationStore.info}
        onChange={this.handleTableChange}
        loading={store.collectionStore.isLoading}
        rowKey="id"
      >
        <Column
          title="瘦身资源"
          dataIndex="resource"
        />
        <Column
          title="源文件格式"
          dataIndex="avType"
        />
        <Column
          title="文件大小(MB)"
          render={this.renderSizeColumn}
        />
        <Column
          title="瘦身率"
          render={this.renderSlimRateColumn}
        />
        <Column
          title="状态"
          dataIndex="state"
          {...stateFilterOptions}
          render={this.renderStateColumn}
        />
        <Column
          title="自动启动"
          render={this.renderAutoEnableColumn}
        />
        <Column
          title="操作"
          render={this.renderOperationColumn}
        />
      </Table>
    )
  }

  @autobind
  @ToasterStore.handle()
  handleTableChange(page: PaginationProps, filters: Record<string, any>) {
    const { store } = this.props

    store.collectionStore.paginationStore.updateCurrent(page.current!)
    store.updateFilterOptions(filters)

    return store.collectionStore.fetchList()
  }

  @autobind
  handleAddTask() {
    if (!this.props.domain) {
      this.props.toasterStore.error('请先选择域名')
      return
    }
    if (!this.props.store.domainInfo) {
      this.props.toasterStore.error('域名不存在')
      return
    }
    this.props.toasterStore.promise(
      this.props.store.createModalStore.open({
        domain: this.props.domain,
        domainBucketName: this.props.store.domainInfo.source.sourceQiniuBucket
      }).then(
        () => { this.resetAndSearch() }
      )
    )
  }

  @autobind
  @ToasterStore.handle()
  resetAndSearch() {
    const { store } = this.props

    store.collectionStore.queryStore.reset()
    store.collectionStore.paginationStore.reset()

    return store.collectionStore.fetchList()
  }

  @autobind
  @ToasterStore.handle()
  handleRefresh() {
    return this.props.store.collectionStore.fetchList()
  }

  @autobind
  @ToasterStore.handle()
  handleSearch() {
    const { store } = this.props
    store.collectionStore.queryStore.applyParams()
    store.collectionStore.paginationStore.reset()
    return store.collectionStore.fetchList()
  }

  getTarget(ids: string[]) {
    return ids.length > 1 ? `所选的 ${ids.length} 个文件` : `文件「${this.props.store.collectionStore.get(ids[0])?.resource}」`
  }

  @autobind
  handleCdnAutoEnableChange(cdnAutoEnable: boolean, ids: string[]) {
    const { store } = this.props
    const tip = (
      cdnAutoEnable
      ? <p className="confirm-content-text">开启后，当视频文件瘦身成功时会自动启用 CDN 分发<br />确认要开启{this.getTarget(ids)}的自动启用？</p>
      : <p className="confirm-content-text">关闭后，当视频文件瘦身成功后需手动设置启用 CDN 分发<br />确认要关闭{this.getTarget(ids)}的自动启用？</p>
    )

    confirm({
      title: '自动启用设置确认',
      content: tip
    }).then(
      () => store.toggleCdnAutoEnable(cdnAutoEnable, ids)
    ).then(this.resetAndSearch)
  }

  @autobind
  handleEnable(ids: string[]) {
    confirm({
      title: '文件启用确认',
      content: <p className="confirm-content-text">启用后，CDN 节点将会预取瘦身后文件做视频分发<br />确认要启用{this.getTarget(ids)}？</p>
    }).then(
      () => this.props.store.enableTask(ids)
    ).then(this.resetAndSearch)
  }

  @autobind
  handleDisable(ids: string[]) {
    confirm({
      title: '文件停用确认',
      content: <p className="confirm-content-text">停用后，CDN 节点将会预取瘦身前源文件做视频分发<br />确认要停用{this.getTarget(ids)}？</p>
    }).then(
      () => this.props.store.disableTask(ids)
    ).then(this.resetAndSearch)
  }

  @autobind
  handleDelete(ids: string[]) {
    confirm({
      title: '文件删除确认',
      content: <p className="confirm-content-text">瘦身后的视频文件将被删除，不可恢复<br />确认要删除{this.getTarget(ids)}？</p>
    }).then(
      () => this.props.store.deleteTask(ids)
    ).then(this.resetAndSearch)
  }

  render() {
    const { store, routes } = this.props

    const domainForStatistic = (
      store.domainInfo && store.domainInfo.type === DomainType.Pan
      ? store.domainInfo.pareDomain
      : this.props.domain
    )
    const statisticLink = (
      this.props.domain
      ? routes.videoSlim(domainForStatistic)
      : routes.videoSlim()
    )

    return (
      <div className="comp-video-slim-list">
        <div className="list-header-wrapper">
          <h3>视频瘦身列表</h3>
          <Role name={VideoSlimRole.StatisticsLink}>
            <RouterLink to={statisticLink} className="chart-link">
              <Icon type="line-chart" />
              查看节省流量统计
            </RouterLink>
          </Role>
        </div>
        {this.operationsView}
        {this.listView}
        <CreateModal
          {...store.createModalStore.bind()}
        />
      </div>
    )
  }
}

export default function VideoSlimList(props: IProps) {
  const toasterStore = useInjection(ToasterStore)
  const store = useLocalStore(LocalStore, props)
  const routes = useInjection(Routes)

  return (
    <VideoSlimListInner {...props} store={store} toasterStore={toasterStore} routes={routes} />
  )
}

export function humanizeTaskState(state: TaskState): string {
  return taskStateTextMap[state] || '未知'
}

export function canChangeAutoEnable(state?: TaskState): boolean {
  return state != null && (
    state === TaskState.SlimWaiting || state === TaskState.SlimProcessing
  )
}

export function canDelete(state?: TaskState): boolean {
  return state != null && (
    state === TaskState.SlimFailed || state === TaskState.SlimSuccess
  )
}

export function canPreview(state?: TaskState): boolean {
  return state != null && state === TaskState.SlimSuccess
}

export function canEnable(state?: TaskState): boolean {
  return state != null && state === TaskState.SlimSuccess
}

export function canDisable(state?: TaskState): boolean {
  return state != null && state === TaskState.Enabled
}

export function getStateColor(state: TaskState): string {
  const clsPrefix = 'status-color'
  switch (state) {
    case TaskState.Enabled:
    case TaskState.SlimSuccess: return `${clsPrefix}-success`
    case TaskState.SlimFailed: return `${clsPrefix}-failed`
    default: return ''
  }
}
