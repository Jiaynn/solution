/**
 * @desc Stream push task list
 * @author hovenjay <hovenjay@outlook.com>
 */

import autobind from 'autobind-decorator'
import React, { Component } from 'react'
import { action, computed, observable, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Inject } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import { Button, Icon, Input, Popconfirm, Switch, Table } from 'react-icecream'

import { gotoStreamPushTaskHistoryPage } from 'kodo/routes/stream-push'

import { StreamPushTaskStatus } from 'kodo/constants/stream-push'

import { StreamPushTask } from 'kodo/apis/stream-push'

import TaskStatusTag from '../TaskStatusTag'
import TaskEditDrawer from './TaskEditDrawer'
import TaskListStore from './store'
import styles from '../style.m.less'

class TaskTable extends Table<StreamPushTask> { }

class TaskColumn extends Table.Column<StreamPushTask> { }

@observer
class InternalTaskList extends Component<{
  store: TaskListStore
}> {
  @observable editTaskDrawerVisible = false

  constructor(
    props: {
      store: TaskListStore
    }
  ) {
    super(props)
    makeObservable(this)
  }

  @computed
  get tableView() {
    return (
      <TaskTable
        className={styles.taskList}
        loading={this.props.store.isTaskListLoading}
        dataSource={this.props.store.taskList}
        rowKey={task => task.taskID}
        loadMore={this.props.store.loadMoreProps}
        pagination={false}
      >
        <TaskColumn
          title="任务名称"
          dataIndex="name"
          render={this.renderTaskName}
        />
        <TaskColumn
          title="任务 ID"
          dataIndex="taskID"
        />
        <TaskColumn
          title="拉流地址"
          dataIndex="sourceUrls"
          render={(_, record) => (record.sourceUrls && record.sourceUrls[0] ? record.sourceUrls[0].url : '')}
        />
        <TaskColumn
          title="转推空间"
          dataIndex="bucket"
        />
        <TaskColumn
          align="center"
          title="状态"
          width="105px"
          dataIndex="status"
          render={(_, record) => (<TaskStatusTag status={record.status} />)}
        />
        <TaskColumn
          key="switch"
          align="center"
          width="100px"
          title="运行开关"
          render={this.renderRunTaskSwitch}
        />
        <TaskColumn
          key="operation"
          align="center"
          width="130px"
          title="操作"
          render={this.renderOperations}
        />
      </TaskTable>
    )
  }

  @action.bound
  handleEditTaskDrawerVisibleChange(visible: boolean) {
    this.editTaskDrawerVisible = visible
  }

  @autobind
  renderTaskName(_: any, record: StreamPushTask) {
    return (
      <span>
        {record.name}
        {record.triggerNow && (<Icon type="thunderbolt" theme="filled" className={styles.triggerNowIcon} />)}
      </span>
    )
  }

  @autobind
  renderRunTaskSwitch(_: any, record: StreamPushTask, index: number) {
    return (
      <Switch
        size="small"
        checked={record.status === StreamPushTaskStatus.Running}
        onChange={checked => (checked ? this.props.store.startTask(index) : this.props.store.stopTask(index))}
      />
    )
  }

  @autobind
  renderOperations(_: any, record: StreamPushTask) {
    return (
      <Inject render={({ inject }) => (
        <>
          <Button key="history" type="link" onClick={() => gotoStreamPushTaskHistoryPage(inject, record.name)}>执行记录</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => this.props.store.deleteTask(record.taskID)}>
            <Button key="remove" type="link">删除</Button>
          </Popconfirm>
        </>
      )} />
    )
  }

  componentDidMount() {
    this.props.store.fetchTaskList()
  }

  componentWillUnmount() {
    this.props.store.dispose()
  }

  render() {
    const { Search } = Input

    return (
      <>
        <div className={styles.operationBar}>
          <div>
            <Button icon="plus" type="primary" onClick={() => this.handleEditTaskDrawerVisibleChange(true)}>
              新建任务
            </Button>
            <Button icon="reload" onClick={this.props.store.refreshList}>刷新</Button>
          </div>
          <Search
            className={styles.search}
            value={this.props.store.searchKeywords}
            placeholder="请输入任务名称按回车搜索"
            onChange={e => this.props.store.updateSearchKeywords(e.target.value)}
            onSearch={this.props.store.handleSearchTasks}
          />
        </div>
        {this.tableView}
        <TaskEditDrawer
          store={this.props.store}
          visible={this.editTaskDrawerVisible}
          onVisibleChange={this.handleEditTaskDrawerVisibleChange}
        />
      </>
    )
  }
}

export default function TaskList() {
  const store = useLocalStore(TaskListStore)
  return (
    <InternalTaskList store={store} />
  )
}
