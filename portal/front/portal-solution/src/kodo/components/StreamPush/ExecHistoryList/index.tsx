/**
 * @desc Stream push task execute history list
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import { useLocalStore } from 'qn-fe-core/local-store'
import { RangePickerProps } from 'antd/lib/date-picker/interface'
import { action, computed, observable, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'

import { Button, DatePicker, Input, Table } from 'react-icecream'

import { humanizeTimestamp } from 'kodo/transforms/date-time'

import { TaskExecHistory } from 'kodo/apis/stream-push'

import HistoryListStore from './store'
import TaskStatusTag from '../TaskStatusTag'
import styles from '../style.m.less'
import HistoryDetailDrawer from './HistoryDetailDrawer'

export interface ExecHistoryListProps {
  taskName?: string
}

class ExecHistoryTable extends Table<TaskExecHistory> { }

class ExecHistoryColumn extends Table.Column<TaskExecHistory> { }

@observer
class InternalExecHistoryList extends Component<ExecHistoryListProps & {
  store: HistoryListStore
}> {
  @observable detailDrawerVisible = false

  @observable.ref currentRecord: TaskExecHistory

  constructor(
    props: ExecHistoryListProps & {
      store: HistoryListStore
    }
  ) {
    super(props)
    makeObservable(this)
  }

  @computed
  get dateRangePickerProps(): RangePickerProps {
    return {
      value: this.props.store.dateRanges,
      onChange: this.props.store.updateDateRanges,
      format: 'YYYY-MM-DD HH:mm',
      disabledDate: date => Boolean(date && date > moment().endOf('day')),
      showTime: {
        format: 'HH:mm'
      },
      style: {
        marginRight: '8px'
      }
    }
  }

  @computed
  get tableView() {
    return (
      <ExecHistoryTable
        loading={this.props.store.isTaskExecHistoryListLoading}
        rowKey={history => `${history.name}-${history.startTime}-${history.stopTime}`}
        dataSource={this.props.store.taskExecHistoryList}
        pagination={false}
        loadMore={this.props.store.loadMoreProps}
      >
        <ExecHistoryColumn
          title="任务名称"
          dataIndex="name"
        />
        <ExecHistoryColumn
          title="开始时间"
          align="center"
          dataIndex="startTime"
          render={(_, record) => (humanizeTimestamp(record.startTime))}
        />
        <ExecHistoryColumn
          title="结束时间"
          align="center"
          dataIndex="stopTime"
          render={(_, record) => (humanizeTimestamp(record.stopTime))}
        />
        <ExecHistoryColumn
          title="状态"
          align="center"
          dataIndex="status"
          render={(_, record) => (<TaskStatusTag status={record.status} />)}
        />
        <ExecHistoryColumn
          key="detail"
          title="转推详情"
          align="center"
          render={this.renderDetailButton}
        />
      </ExecHistoryTable>
    )
  }

  @action.bound
  handleDetailDrawerVisibleChange(visible: boolean) {
    this.detailDrawerVisible = visible
  }

  @action.bound
  updateCurrentRecord(record: TaskExecHistory) {
    this.currentRecord = record
  }

  @action.bound
  handleOpenDetailDrawer(record: TaskExecHistory) {
    this.currentRecord = record
    this.detailDrawerVisible = true
  }

  @autobind
  renderDetailButton(_: any, record: TaskExecHistory) {
    return (<Button type="link" onClick={() => this.handleOpenDetailDrawer(record)}>查看</Button>)
  }

  componentDidMount() {
    this.props.store.fetchExecHistories()
  }

  render() {
    const { Search } = Input

    return (
      <>
        <div className={styles.operationBar}>
          <div />
          <div>
            <DatePicker.RangePicker {...this.dateRangePickerProps} />
            <Search
              value={this.props.store.searchKeywords}
              className={styles.search}
              placeholder="请输入任务名称按回车搜索"
              onChange={e => this.props.store.updateSearchKeywords(e.target.value)}
              onSearch={this.props.store.handleSearchTasks}
            />
          </div>
        </div>
        {this.tableView}
        <HistoryDetailDrawer
          record={this.currentRecord}
          visible={this.detailDrawerVisible}
          onVisibleChange={this.handleDetailDrawerVisibleChange}
        />
      </>
    )
  }
}

export default function ExecHistoryList(props: ExecHistoryListProps) {
  const store = useLocalStore(HistoryListStore, props)
  return (<InternalExecHistoryList {...props} store={store} />)
}
