/**
 * @file bucket transfer index
 * @description bucket 跨区域同步
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { observer, Observer } from 'mobx-react'
import { computed, observable, action, makeObservable } from 'mobx'
import { Table, Button, Popover, Popconfirm } from 'react-icecream/lib'
import { PaginationProps } from 'react-icecream/lib/pagination'
import Role from 'portal-base/common/components/Role'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import { Inject, InjectFunc, useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'

import { valuesOf } from 'kodo/utils/ts'

import { humanizeTimestamp } from 'kodo/transforms/date-time'
import { humanizeStorageSize } from 'kodo/transforms/unit'

import { ConfigStore } from 'kodo/stores/config'

import { TransferRole } from 'kodo/constants/role'

import Prompt from 'kodo/components/common/Prompt'

import { Auth } from 'kodo/components/common/Auth'
import { Description } from 'kodo/components/common/Description'

import {
  ITransferTask,
  TransferTaskStatus,
  ICreateTransferTask,
  TranscodeApis
} from 'kodo/apis/transfer'

import CreateTransferTask, { IFormFields } from './Create'
import { TransferBaseStore } from './store'

import styles from './style.m.less'

enum Loading {
  GetTransferTasks = 'GetTransferTasks',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  CreateTransferTask = 'CreateTransferTask',
  DeleteTransferTask = 'DeleteTransferTask',
  StopTransferTask = 'StopTransferTask',
  StartTransferTask = 'StartTransferTask'
}

const taskStatusTextMap = {
  [TransferTaskStatus.Enabled]: '进行中',
  [TransferTaskStatus.Disabled]: '未进行'
}

const INVALID_TIME = '0001-01-01T00:00:00Z'

function humanizeTaskTimestamp(time: string): string {
  return time === INVALID_TIME
    ? '-'
    : humanizeTimestamp(time)
}

function TaskDetailContent(props: {
  task: ITransferTask,
  store: TransferBaseStore
}) {

  const { task, store } = props
  const configStore = useInjection(ConfigStore)
  const targetProduct = store.regionProductInfoMap.get(task.target.region)!
  const sourceProduct = store.regionProductInfoMap.get(task.source.region)!

  const targetProductName = (targetProduct && targetProduct.productName) || '未知'
  const sourceProductName = (sourceProduct && sourceProduct.productName) || '未知'

  const isShowProduct = targetProduct.product !== configStore.product
    || sourceProduct.product !== configStore.product

  return (
    <ul className={styles.taskDetailBox}>
      <li>同步任务名称：{task.name}</li>
      <li>同步任务 ID：{task.id}</li>
      <li>同步任务状态：{taskStatusTextMap[task.status]}</li>
      <li>创建时间点：{humanizeTaskTimestamp(task.created_at)}</li>
      {isShowProduct && (<li>源产品：{sourceProductName}</li>)}
      <li>源存储空间：{task.source.bucket}（{store.getRegionName(task.source.region)}）</li>
      {isShowProduct && (<li>目标产品：{targetProductName}</li>)}
      <li>目标存储空间：{task.target.bucket}（{store.getRegionName(task.target.region)}）</li>
      <li>同步历史数据：{task.option.is_sync ? '是' : '否'}</li>
      <li>最新同步时间点：{humanizeTaskTimestamp(task.last_job_done_time)}</li>
      <li>已同步文件容量：{humanizeStorageSize(task.file_done_size)}</li>
      <li>已同步文件数：{task.job_done}</li>
    </ul>
  )
}

export interface IProps { }

interface DiDeps {
  inject: InjectFunc,
  store: TransferBaseStore
}

@observer
class InternalBucketTransfer extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @observable tasks: ITransferTask[] = []
  @observable createModalVisible = false

  @computed get globalConfig() {
    const configStore = this.props.inject(ConfigStore)
    return configStore.getFull()
  }

  // 需要显示的任务
  @computed get tasksShouldShow(): ITransferTask[] {
    if (this.tasks == null) {
      return []
    }

    // 目标或者源产品是当前产品的任务
    const configStore = this.props.inject(ConfigStore)
    const tasksWithCurrentProduct = this.tasks.filter(task => {
      const targetProduct = this.props.store.regionProductInfoMap.get(task.target.region)
      const sourceProduct = this.props.store.regionProductInfoMap.get(task.source.region)
      return (targetProduct && targetProduct.product === configStore.product)
        || (sourceProduct && sourceProduct.product === configStore.product)
    })

    // TODO: 再次确认该逻辑
    // 如果允许用户选择源产品，则显示全量的数据
    if (this.globalConfig.objectStorage.transfer.crossProduct.sourceProductSelect.enable) {
      return tasksWithCurrentProduct
    }

    // 否则只显示源产品为当前产品的的任务
    const regionList = configStore.getRegion({ allRegion: true })
    const regionSymbolList = regionList.map(item => item.symbol)
    return tasksWithCurrentProduct.filter(task => regionSymbolList.includes(task.source.region))
  }

  @computed get alreadyExistsTasksNames(): string[] {
    return (this.tasks || []).map(task => task.name)
  }

  @computed get isLoadingTasks(): boolean {
    return this.loadings.isLoading(Loading.GetTransferTasks)
  }

  @computed get isSubmitting(): boolean {
    return this.loadings.isLoading(Loading.CreateTransferTask)
  }

  @computed get isTogglingTaskStatus(): boolean {
    // FIXME: 这个真是奇怪的设计，点某一个一整列都在 loading...
    return this.loadings.isLoading(Loading.StartTransferTask)
      || this.loadings.isLoading(Loading.StopTransferTask)
  }

  @computed get paginationOptions(): PaginationProps {
    return {
      defaultPageSize: 30
    }
  }

  // 是否显示产品列
  @computed get isShowProduct(): boolean {
    if (this.tasksShouldShow.length === 0) {
      return false
    }

    // 如果包含非当前产品的任务则在表格中显示
    return this.tasksShouldShow.some(task => {
      const configStore = this.props.inject(ConfigStore)
      const targetProduct = this.props.store.regionProductInfoMap.get(task.target.region)!
      const sourceProduct = this.props.store.regionProductInfoMap.get(task.source.region)!
      return (sourceProduct && sourceProduct.product !== configStore.product)
        || (targetProduct && targetProduct.product !== configStore.product)
    })
  }

  @action.bound
  updateTasks(tasks: ITransferTask[]) {
    this.tasks = tasks
  }

  @action.bound
  updateCreateModalVisible(visible: boolean) {
    this.createModalVisible = visible
  }

  @autobind
  closeCreateModal() {
    this.updateCreateModalVisible(false)
  }

  @autobind
  openCreateModal() {
    this.updateCreateModalVisible(true)
  }

  @autobind
  handleDeleteTask(task: ITransferTask) {
    this.deleteTask(task.id, task.name)
      .then(() => { this.fetchTransferTasks() })
  }

  handleToggleTaskStatus(task: ITransferTask) {
    if (task.status === TransferTaskStatus.Disabled) {
      this.startTask(task.id, task.name).then(this.fetchTransferTasks)
    }
    if (task.status === TransferTaskStatus.Enabled) {
      this.stopTask(task.id, task.name).then(this.fetchTransferTasks)
    }
  }

  @autobind
  handleCreateModalSubmit(task: IFormFields) {
    const newTask: ICreateTransferTask = {
      name: task.name,
      src_bkt: task.srcBucket!,
      dst_bkt: task.destBucket!,
      is_sync: task.isSync
    }
    this.createTask(newTask).then(() => {
      this.closeCreateModal()
      this.fetchTransferTasks()
    })
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.GetTransferTasks)
  fetchTransferTasks() {
    const transcodeApis = this.props.inject(TranscodeApis)
    return transcodeApis.getTransferTasks().then(result => {
      this.updateTasks(result && result.tasks || [])
    })
  }

  @Toaster.handle('创建成功')
  @Loadings.handle(Loading.CreateTransferTask)
  createTask(task: ICreateTransferTask) {
    const transcodeApis = this.props.inject(TranscodeApis)
    return transcodeApis.createTransferTask(task)
  }

  @autobind
  @Toaster.handle('删除成功')
  @Loadings.handle(Loading.DeleteTransferTask)
  deleteTask(taskId: string, taskName: string) {
    const transcodeApis = this.props.inject(TranscodeApis)
    return transcodeApis.deleteTransferTask(taskId, taskName)
  }

  @autobind
  @Toaster.handle('操作成功')
  @Loadings.handle(Loading.StartTransferTask)
  startTask(taskId: string, taskName: string) {
    const transcodeApis = this.props.inject(TranscodeApis)
    return transcodeApis.startTransferTask(taskId, taskName)
  }

  @autobind
  @Toaster.handle('操作成功')
  @Loadings.handle(Loading.StopTransferTask)
  stopTask(taskId: string, taskName: string) {
    const transcodeApis = this.props.inject(TranscodeApis)
    return transcodeApis.stopTransferTask(taskId, taskName)
  }

  @computed
  get descriptionView() {
    if (!this.globalConfig.objectStorage.transfer.description) {
      return null
    }

    return (
      <Prompt className={styles.pageTip} type="assist">
        <Description dangerouslyText={
          this.globalConfig.objectStorage.transfer.description
        } />
      </Prompt>
    )
  }

  render() {
    return (
      <div className={styles.content}>
        {this.descriptionView}
        <div className={styles.toolbar}>
          <Auth
            notProtectedUser
            render={disabled => (
              <Role name={TransferRole.CreateTaskEntry}>
                <Button
                  icon="plus"
                  type="primary"
                  disabled={disabled}
                  className={styles.button}
                  onClick={this.openCreateModal}
                >
                  创建任务
                </Button>
              </Role>
            )}
          />
          <Button
            icon="reload"
            className={styles.button}
            loading={this.isLoadingTasks}
            onClick={this.fetchTransferTasks}
          >
            刷新列表
          </Button>
        </div>
        <Role name={TransferRole.TaskList}>
          <div className={styles.listBox}>
            <Table
              loading={this.isLoadingTasks}
              pagination={this.paginationOptions}
              dataSource={this.tasksShouldShow.slice()}
              rowKey={task => `${task.name}-${task.target.bucket}-${task.source.bucket}`}
            >
              <Table.Column
                title="同步任务名称"
                dataIndex="name"
              />
              <Table.Column
                title="同步状态"
                key="status"
                width={120}
                render={(_, task: ITransferTask) => taskStatusTextMap[task.status]}
              />
              {this.isShowProduct && (
                <Table.Column
                  width="10%"
                  title="源产品"
                  key="source.region"
                  render={(_, task: ITransferTask) => <Observer render={() => {
                    const sourceProduct = this.props.store.regionProductInfoMap.get(task.source.region)
                    return <>{sourceProduct ? sourceProduct.productName : '未知'}</>
                  }} />}
                />
              )}
              <Table.Column
                width="20%"
                title="源存储空间"
                key="source.bucket"
                className={styles.bucketName}
                render={(_, task: ITransferTask) => task.source.bucket}
              />
              {this.isShowProduct && (
                <Table.Column
                  width="10%"
                  title="目标产品"
                  key="target.region"
                  render={(_, task: ITransferTask) => <Observer render={() => {
                    const targetProduct = this.props.store.regionProductInfoMap.get(task.target.region)
                    return <>{targetProduct ? targetProduct.productName : '未知'}</>
                  }} />}
                />
              )}
              <Table.Column
                width="20%"
                title="目标存储空间"
                key="target.bucket"
                className={styles.bucketName}
                render={(_, task: ITransferTask) => task.target.bucket}
              />
              <Table.Column
                title="操作"
                width="20%"
                render={(_, task: ITransferTask) => (
                  <Observer render={() => (
                    <>
                      <Role name={TransferRole.TaskDetailEntry}>
                        <Popover
                          trigger="hover"
                          placement="left"
                          content={<TaskDetailContent task={task} store={this.props.store} />}
                          title={<span>同步任务详情</span>}
                        >
                          <Button type="link">查看</Button>
                        </Popover>
                      </Role>
                      <Auth notProtectedUser>
                        <Role name={TransferRole.TaskStatusToggleCtrl}>
                          <Button
                            type="link"
                            disabled={this.isTogglingTaskStatus}
                            loading={this.isTogglingTaskStatus}
                            onClick={() => this.handleToggleTaskStatus(task)}
                          >
                            {task.status === TransferTaskStatus.Disabled && '开始'}
                            {task.status === TransferTaskStatus.Enabled && '暂停'}
                          </Button>
                        </Role>
                      </Auth>
                      <Role name={TransferRole.TaskDeleteCtrl}>
                        <Popconfirm
                          placement="bottom"
                          title="确认删除该条任务？"
                          onConfirm={() => this.handleDeleteTask(task)}
                        >
                          <Button type="link">
                            删除
                          </Button>
                        </Popconfirm>
                      </Role>
                    </>
                  )} />
                )}
              />
            </Table>
          </div>
        </Role>
        <CreateTransferTask
          store={this.props.store}
          visible={this.createModalVisible}
          isSubmitting={this.isSubmitting}
          onCancel={this.closeCreateModal}
          onSubmit={this.handleCreateModalSubmit}
          taskNames={this.alreadyExistsTasksNames}
        />
      </div>
    )
  }

  componentDidMount() {
    this.fetchTransferTasks()
  }
}

export default function BucketTransfer(props: IProps) {
  const store = useLocalStore(TransferBaseStore)

  return (
    <Inject render={({ inject }) => (
      <InternalBucketTransfer
        {...props}
        store={store}
        inject={inject}
      />
    )} />
  )
}
