/**
 * @file Component DeleteBucketModal
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Modal, Button, Icon } from 'react-icecream/lib'

import { UserInfoStore as UserInfo } from 'portal-base/user/account'

import { DomainStore } from 'kodo/stores/domain'

import { CDNDomainType } from 'kodo/constants/domain'

import styles from './style.m.less'

export interface IProps {
  allowDropNonEmpty: boolean
  onOk(): void
  onCancel(): void
  visible: boolean
  bucketName: string
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalDeleteBucketModal extends React.Component<IProps & DiDeps> {
  userInfoStore = this.props.inject(UserInfo)
  domainStore = this.props.inject(DomainStore)

  handleSubmit = () => {
    this.props.onOk()
  }

  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get deletePromptView() {
    const cdnDomains = this.domainStore.CDNDomainListGroupByBucketName.get(this.props.bucketName)
    const deleteDomains = cdnDomains && cdnDomains.filter(
      domain => [CDNDomainType.Test, CDNDomainType.Pan].includes(domain.type)
    )
    return (
      <>
        {
          this.userInfoStore.isIamUser && (
            <div className={styles.warning}>请确认空间是否已关联直播空间，删除可能会影响关联直播空间的正常使用！</div>
          )
        }
        <div>
          空间 <span className={classNames(styles.deleteBucket, styles.warning)}>「{this.props.bucketName}」</span>
          将会被删除，操作不可逆，确保您已知晓接下来的操作所带来的影响。
        </div>
        {this.props.allowDropNonEmpty && <div className={styles.warning}>若空间还有文件，将全部被删除，且不可恢复！</div>}
        {
          (deleteDomains && deleteDomains.length) && (
            <div className={styles.deleteDomainInfo}>
              <div>将会删除的测试及泛子域名：</div>
              <ul>
                {deleteDomains.map(domain => <li key={domain.name}>{domain.name}</li>)}
              </ul>
            </div>
          )
        }
      </>
    )
  }

  render() {
    return (
      <Modal
        title={
          <div className={styles.modalTitle}>
            <Icon type="exclamation-circle" className={styles.warningIcon} />
            <span>删除空间</span>
          </div>
        }
        onCancel={this.props.onCancel}
        visible={this.props.visible}
        footer={[
          <Button
            key="submit"
            type="danger"
            onClick={this.handleSubmit}
          >
            确定
          </Button>,
          <Button key="back" onClick={this.props.onCancel}>取消</Button>
        ]}
      >
        {this.deletePromptView}
      </Modal>
    )
  }
}

export default function DeleteBucketModal(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalDeleteBucketModal {...props} inject={inject} />
    )} />
  )
}
