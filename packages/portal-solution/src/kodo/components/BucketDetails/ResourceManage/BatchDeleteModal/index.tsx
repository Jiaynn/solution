/**
 * @file component BatchDeleteModal of ResourceManage
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Modal, Button, Icon } from 'react-icecream/lib'
import classNames from 'classnames'
import autobind from 'autobind-decorator'

import { getOriginalKey } from 'kodo/transforms/bucket/resource'
import Store, { ModalState, humanizeTaskState, TaskState } from './store'
import styles from './style.m.less'

export { Store }

export interface IProps {
  store: Store
}

class BatchDeleteModal extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @autobind
  handleDelete() {
    this.props.store.delete()
  }

  cancel() {
    this.props.store.cancel()
  }

  @autobind
  handleCancel() {
    const { state } = this.props.store
    if (state !== ModalState.Deleting) {
      this.cancel()
      return
    }

    // 简化处理，一旦处于删除状态则不可取消
    Modal.warning({
      title: '终止删除',
      content: (<>
        <p>当前还有正在删除中的任务，不可终止删除</p>
      </>)
    })
  }

  @computed
  get listView() {
    const { tasks, taskDetailStateMap } = this.props.store
    return (
      <div className={styles.deleteBox}>
        <ul>
          {
            tasks && tasks.map(task => {
              const { state, err } = taskDetailStateMap.get(task.id)!
              const isDeleting = state === TaskState.Deleting
              const isSuccess = state === TaskState.Deleted
              return (
                <li key={task.id}>
                  <span className={styles.taskTitle}>{getOriginalKey(task.id)}</span>
                  <span className={classNames({
                    [styles.leftGap]: true,
                    [styles.deleting]: isDeleting,
                    [styles.error]: !!err,
                    [styles.success]: isSuccess
                  })}
                  >
                    {(err && err.message) || humanizeTaskState(state)}
                  </span>
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }

  render() {
    const { store: { state, visible, isModalLoading } } = this.props

    if (!visible) {
      return null
    }

    const okText = {
      [ModalState.ToRetry]: '重试',
      [ModalState.Deleting]: '开始删除'
    }[state] || '确定'

    return (
      <Modal
        title={
          <div className={styles.modalTitle}>
            <Icon type="exclamation-circle" className={styles.warningIcon} />
            <span>您确定要删除以下 {this.props.store.tasks.length} 个文件吗？</span>
          </div>
        }
        visible={visible}
        onCancel={this.handleCancel}
        footer={[
          <Button
            key="submit"
            type="danger"
            loading={isModalLoading}
            onClick={this.handleDelete}
          >
            {okText}
          </Button>,
          <Button key="back" onClick={this.handleCancel}>取消</Button>
        ]}
      >
        {this.listView}
      </Modal>
    )
  }
}

export default observer(BatchDeleteModal)
