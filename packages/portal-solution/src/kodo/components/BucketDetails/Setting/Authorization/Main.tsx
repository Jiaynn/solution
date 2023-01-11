/**
 * @file 空间授权
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'
import { computed, action, observable, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'

import { Button, Table, Icon, Modal, Spin } from 'react-icecream/lib'
import Disposable from 'qn-fe-core/disposable'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { KodoCommonApiException } from 'portal-base/kodo/apis/common'
import Role from 'portal-base/common/components/Role'

import { valuesOfEnum } from 'kodo/utils/ts'

import { BucketStore } from 'kodo/stores/bucket'

import { IDetailsBaseOptions, getSettingPath } from 'kodo/routes/bucket'

import { ShareType, shareNameMap, IShareUser } from 'kodo/constants/bucket/setting/authorization'
import { BucketSettingAuthorizationRole } from 'kodo/constants/role'

import BackButton from 'kodo/components/common/BackButton'
import { Auth } from 'kodo/components/common/Auth'

import { AuthorizationApis, IShareBucketOptions } from 'kodo/apis/bucket/setting/authorization'

import AuthorizationForm, { IValue as ISubmitData } from './Form'
import styles from './style.m.less'

// FIXME: 修改权限功能升级成 editable table cell ？

class TableColumn extends Table.Column<IShareUser> { }

enum Loading {
  GetShareUsers = 'getShareUsers',
  SetShareUsers = 'setShareUsers'
}

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalAuthorizationMain extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  userInfoStore = this.props.inject(UserInfo)
  bucketStore = this.props.inject(BucketStore)
  authorizationApis = this.props.inject(AuthorizationApis)

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  editingIndex: number | null = null
  @observable isAuthorizationFormVisible = false

  @computed
  get isModifying() {
    return !!(this.isAuthorizationFormVisible && this.editingIndex != null)
  }

  @computed
  get isAdding() {
    return !!(this.isAuthorizationFormVisible && this.editingIndex == null)
  }

  @computed
  get ownerEmail() {
    const bucket = this.bucketStore.getDetailsByName(this.props.bucketName)
    return bucket && bucket.oemail
  }

  @computed
  get isShared() {
    return this.bucketStore.isShared(this.props.bucketName)
  }

  @computed
  get shareUsers() {
    const bucket = this.bucketStore.getDetailsByName(this.props.bucketName)
    return bucket && bucket.share_users || []
  }

  @autobind
  isRenamed(targetBucketName: string) {
    return !!(targetBucketName && targetBucketName !== this.props.bucketName)
  }

  @computed
  get settingPagePath() {
    return getSettingPath(
      this.props.inject,
      { bucketName: this.props.bucketName }
    )
  }

  @autobind
  getShareBucketBaseOptionsByIndex(index: number): Omit<IShareBucketOptions, 'shareType'> {
    const shareUser = this.shareUsers[index]
    return {
      sourceBucketName: this.props.bucketName,
      targetBucketName: shareUser.tbl,
      targetEmail: shareUser.email
    }
  }

  @computed
  get formCommonProps() {
    return {
      visible: this.isAuthorizationFormVisible,
      isShared: this.isShared,
      ownerEmail: this.ownerEmail,
      bucketName: this.props.bucketName,
      shareUsers: this.shareUsers,
      onCancel: () => this.updateAuthorizationFormVisibleState(false)
    }
  }

  @action
  updateAuthorizationFormVisibleState(visible: boolean) {
    this.isAuthorizationFormVisible = visible
  }

  @action.bound
  initForm(index: number | null = null) {
    this.editingIndex = index
    this.updateAuthorizationFormVisibleState(true)
  }

  @autobind
  async handleAdd(data: ISubmitData) {
    const options = {
      sourceBucketName: this.props.bucketName,
      targetBucketName: data.tbl,
      targetEmail: data.email,
      shareType: data.perm
    }
    try {
      await this.updateRemoteShareUsers(options)
    } catch (error) {
      if ((error instanceof KodoCommonApiException) && error.code === 50031) {
        return { isBucketNameConflict: true }
      }
      throw error
    }

    this.updateAuthorizationFormVisibleState(false)
  }

  @autobind
  async handleModify({ perm }: ISubmitData) {
    const { sourceBucketName, targetEmail } = this.getShareBucketBaseOptionsByIndex(this.editingIndex!)

    try {
      await this.updateRemoteShareUsers({
        targetEmail,
        sourceBucketName,
        shareType: perm
      })
    } catch (error) {
      if ((error instanceof KodoCommonApiException) && error.code === 50031) {
        return { isBucketNameConflict: true }
      }
      throw error
    }

    this.updateAuthorizationFormVisibleState(false)
  }

  @autobind
  @Toaster.handle('取消授权成功')
  async resetRemoteShareType(index: number) {
    const { sourceBucketName, targetEmail } = this.getShareBucketBaseOptionsByIndex(index)
    return this.updateRemoteShareUsers({
      targetEmail,
      sourceBucketName,
      shareType: ShareType.None
    })
  }

  @autobind
  handleDelete(index: number) {
    const shareUser = this.shareUsers[index]
    Modal.confirm({
      title: '确定要取消授权？',
      content: `${shareUser.email}: ${shareUser.tbl}`,
      // TODO: FIXME @huangbinjie onOk 的 cancel 会导致 promise reject 到 window 上
      onOk: () => this.resetRemoteShareType(index)
    })
  }

  @Toaster.handle()
  @Loadings.handle(Loading.GetShareUsers)
  fetchShareUsers() {
    return this.bucketStore.fetchDetailsByName(this.props.bucketName)
  }

  @Loadings.handle(Loading.SetShareUsers)
  async updateRemoteShareUsers(options: IShareBucketOptions) {
    await this.authorizationApis.shareBucket(options)
    this.fetchShareUsers()
  }

  componentDidMount() {
    this.fetchShareUsers()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @computed
  get tableView() {
    return (
      <div className={styles.tableWrapper}>
        <Table
          rowKey={shareUser => `${shareUser.email}-${shareUser.perm}`}
          dataSource={this.shareUsers}
          loading={this.loadings.isLoading(Loading.GetShareUsers)}
          pagination={false}
        // scroll={{ x: false, y: this.tableHeight }} // FIXME: 翻页
        >
          <TableColumn
            key="email"
            title="授权用户"
            render={(_, { email }) => email}
          />
          <TableColumn
            key="tbl"
            title="空间别名"
            render={(_, { tbl }) => (this.isRenamed(tbl) ? tbl : '')}
          />
          <TableColumn
            key="perm"
            title="授予权限"
            render={(_, { perm }, index) => (<>
              <span>{shareNameMap[perm]}</span>
              {!this.userInfoStore.isBufferedUser && (
                <Role name={BucketSettingAuthorizationRole.ListItemEditEntry}>
                  <Icon type="form" className={styles.modifyIconBtn} onClick={() => this.initForm(index)} />
                </Role>
              )}
            </>)}
          />
          <TableColumn
            key="op"
            title="操作"
            render={(_, _shareUser, index) => (
              <Role name={BucketSettingAuthorizationRole.ListItemDeleteEntry}>
                <Button
                  type="link"
                  loading={this.loadings.isLoading(Loading.SetShareUsers)} // FIXME: 不够精确
                  onClick={() => this.handleDelete(index)}
                >
                  取消授权
                </Button>
              </Role>
            )}
          />
        </Table>
      </div>
    )
  }

  render() {
    if (this.isShared == null) {
      return (<Spin />)
    }

    if (this.isShared) {
      return (<span>只有{shareNameMap[ShareType.Own]}空间能够被授权</span>)
    }

    return (
      <div>
        <div className={styles.headerPanel}>
          <BackButton path={this.settingPagePath} />
          <Auth
            notProtectedUser
            render={disabled => (
              <Role name={BucketSettingAuthorizationRole.CreateEntry}>
                <Button
                  type="primary"
                  icon="plus"
                  disabled={disabled}
                  className={styles.button}
                  onClick={() => this.initForm()}
                >
                  新增授权
                </Button>
              </Role>
            )}
          />
        </div>
        <Role name={BucketSettingAuthorizationRole.AuthorizationList}>
          {this.tableView}
        </Role>
        {this.isAdding && (
          <AuthorizationForm
            {...this.formCommonProps}
            title="新增授权"
            onSubmit={this.handleAdd}
          />
        )}
        {this.isModifying && (
          <AuthorizationForm
            {...this.formCommonProps}
            title="修改授予权限"
            data={this.shareUsers[this.editingIndex!]}
            onSubmit={this.handleModify}
          />
        )}
      </div>
    )
  }
}

export default function AuthorizationMain(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalAuthorizationMain {...props} inject={inject} />
    )} />
  )
}
