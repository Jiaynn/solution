/**
 * @file 删除空间
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { observer } from 'mobx-react'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { action, observable, computed, runInAction, makeObservable } from 'mobx'
import { Button, Modal } from 'react-icecream/lib'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { RouterStore } from 'portal-base/common/router'
import { Loadings } from 'portal-base/common/loading'

import { VerificationModalStore } from 'portal-base/user/verification'

import { BucketStore } from 'kodo/stores/bucket'

import { IDetailsBaseOptions, getListPath } from 'kodo/routes/bucket'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { Auth } from 'kodo/components/common/Auth'

import { BucketApis } from 'kodo/apis/bucket'

import SettingCard from '../Card'
import DeleteBucketModal from './DeleteBucketModal'
import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

const loadingId = 'deleteBucketPreCheck'

@observer
class InternalDeleteBucket extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  bucketApis = this.props.inject(BucketApis)
  routerStore = this.props.inject(RouterStore)
  bucketStore = this.props.inject(BucketStore)
  verificationModalStore = this.props.inject(VerificationModalStore)

  @observable deleteBucketModalVisible = false
  @observable allowDropNonEmpty = false
  loadings = Loadings.collectFrom(this, loadingId)

  @autobind
  @Toaster.handle()
  verifyAuthentication() {
    return this.verificationModalStore.verify()
  }

  @action.bound
  updateDeleteBucketModalVisible(visible: boolean) {
    this.deleteBucketModalVisible = visible
  }

  @action.bound
  updateAllowDropNonEmpty(status: boolean) {
    this.allowDropNonEmpty = status
  }

  @autobind
  @Toaster.handle('删除成功')
  deleteBucket() {
    // 删除 bucket
    const req = this.bucketStore.delete(this.props.bucketName).then(
      // 跳回列表页
      () => this.routerStore.push(getListPath(this.props.inject))
    )
    return req
  }

  @action.bound
  handleAuthenticationVerified() {
    this.updateDeleteBucketModalVisible(false)
    this.verifyAuthentication().then(this.deleteBucket)
  }

  @action.bound
  @Toaster.handle()
  @Loadings.handle(loadingId)
  async openDeleteBucketDrawerWithPreCheck() {
    const { bucketName } = this.props
    const result = await this.bucketApis.canDropBucket(bucketName)

    if (result.result === true) {
      runInAction(() => {
        this.updateAllowDropNonEmpty(!!result.allowDropNonEmpty)
        this.updateDeleteBucketModalVisible(true)
      })
      return
    }

    if (result.source === 'fusion' && result.domains && result.domains.length) {
      Modal.warning({
        title: '无法删除空间',
        content: (<>
          <div>
            空间「{bucketName}」绑定了自定义域名，禁止删除。请删除该空间已绑定的 CDN 自定义域名或修改 CDN 自定义域名的源站设置，域名列表如下：
          </div>
          <ul>
            {result.domains.map(domain => <li key={domain}>{domain}</li>)}
          </ul>
        </>)
      })
      return
    }

    if (result.source === 'pili' && result.hubs && result.hubs.length) {
      Modal.warning({
        title: '无法删除空间',
        content: (<>
          <div>
            空间「{bucketName}」已被直播设置关联，无法删除，请先取消关联，相关直播项如下：
          </div>
          <ul>
            {result.hubs.map(hub => <li key={hub}>{hub}</li>)}
          </ul>
        </>)
      })
      return
    }

    if (result.source === 'bucket') {
      Modal.warning({
        title: '无法删除空间',
        content: `空间「${bucketName}」不为空，禁止删除，请检查是否有未删除的文件。`
      })
    }
  }

  @computed
  get deleteBucketModalView() {
    return (
      <DeleteBucketModal
        bucketName={this.props.bucketName}
        visible={this.deleteBucketModalVisible}
        onOk={this.handleAuthenticationVerified}
        allowDropNonEmpty={this.allowDropNonEmpty}
        onCancel={() => this.updateDeleteBucketModalVisible(false)}
      />
    )
  }

  render() {
    return (
      <SettingCard
        title="删除空间"
        className={styles.cardWithEntry}
        tooltip="空间删除后将不可恢复，请谨慎操作！非空空间不允许删除。"
      >
        <Auth
          iamPermission={{ actionName: 'Drop', resource: this.props.bucketName }}
          bucketShare={{
            enableTypes: [ShareType.Own],
            bucketName: this.props.bucketName
          }}
          render={disabled => (
            <Button
              icon="delete"
              type="danger"
              disabled={disabled}
              onClick={this.openDeleteBucketDrawerWithPreCheck}
              loading={this.loadings.isLoading(loadingId)}
            >
              删除空间
            </Button>
          )}
        />
        {this.deleteBucketModalView}
      </SettingCard>
    )
  }
}

export default function DeleteBucket(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalDeleteBucket {...props} inject={inject} />
    )} />
  )
}
