/**
 * @file card of access controll of bucket setting 访问控制 公有 / 私有 空间
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, action, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { VerificationModalStore } from 'portal-base/user/verification'

import { Spin, Button, Modal } from 'react-icecream/lib'

import { valuesOfEnum } from 'kodo/utils/ts'

import { BucketStore } from 'kodo/stores/bucket'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { PrivateType, privateNameMap } from 'kodo/constants/bucket/setting/access'

import { Auth } from 'kodo/components/common/Auth'

import { AccessApis } from 'kodo/apis/bucket/setting/access'
import { ResourceApis } from 'kodo/apis/bucket/resource'

import SettingCard from '../Card'
import { injectMainBtnClickHookProps } from '../Card/sensors'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  GetPrivate = 'getPrivate',
  SetPrivate = 'setPrivate'
}

/* tslint:disable: max-line-length */
const tipMap = {
  [PrivateType.Public]: `当前访问的空间为${privateNameMap[PrivateType.Public]}空间，${privateNameMap[PrivateType.Private]}空间需要拥有者的授权链接才可访问，改变访问控制可能使当前正在运行的程序和该空间的域名无法正常使用。切换空间属性后需 10 分钟生效。`,
  [PrivateType.Private]: `当前访问的空间为${privateNameMap[PrivateType.Private]}空间，${privateNameMap[PrivateType.Public]}空间的文件可通过外链地址直接访问，改变访问控制可能使当前正在运行的程序和该空间的域名无法正常使用。切换空间属性后需 10 分钟生效。`
}

/* tslint:enable: max-line-length */

@observer
class InternalSettingAccess extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  bucketStore = this.props.inject(BucketStore)
  accessApis = this.props.inject(AccessApis)
  resourceApis = this.props.inject(ResourceApis)
  verificationModalStore = this.props.inject(VerificationModalStore)

  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  @computed get privateType() {
    const bucket = this.bucketStore.getDetailsByName(this.props.bucketName)
    return bucket && bucket.private
  }

  @computed get isPrivate() {
    return this.privateType == null
      ? null
      : this.privateType === PrivateType.Private
  }

  @Toaster.handle()
  @Loadings.handle(Loading.GetPrivate)
  fetchPrivateType() {
    return this.bucketStore.fetchDetailsByName(this.props.bucketName)
  }

  @Toaster.handle('设置成功')
  @Loadings.handle(Loading.SetPrivate)
  setRemotePrivateType(privateType: PrivateType) {
    return this.accessApis.setPrivate(this.props.bucketName, privateType)
  }

  @autobind
  @Toaster.handle()
  async handleAuthenticationVerified(privateType: PrivateType) {
    await this.verificationModalStore.verify()
    await this.setRemotePrivateType(privateType)
    this.fetchPrivateType()
  }

  @action.bound
  async handlePrivateTypeChange(privateType: PrivateType) {
    const { bucketName } = this.props

    // 从公有改为私有要检查
    const isUsed = privateType === PrivateType.Private && (await this.resourceApis.isPiliUsed(bucketName))

    if (isUsed) {
      Modal.warning({
        title: '无法修改',
        content: `空间「${bucketName}」已被直播空间关联，无法设置为私有，请先取消关联。`
      })
      return
    }

    const warning = privateType === PrivateType.Public
      ? '公开空间允许不通过身份验证直接读取 Bucket 中的数据，存在一定的安全风险。请对此操作进行确认。'
      : '改变访问控制可能使当前正在运行的程序和该空间的域名无法正常使用，请对此操作进行确认。'

    Modal.confirm({
      title: '切换访问控制',
      content: `确定切换成${privateNameMap[privateType]}空间？` + warning,
      onOk: () => {
        this.handleAuthenticationVerified(privateType)
      }
    })
  }

  componentDidMount() {
    this.fetchPrivateType()
  }

  @computed
  get mainView() {
    if (this.privateType == null) {
      return (<Spin />)
    }

    const btnView = (
      <Auth
        notProtectedUser
        render={disabled => (
          this.isPrivate
            ? (
              <Button
                disabled={disabled}
                loading={!this.loadings.isAllFinished()}
                onClick={() => this.handlePrivateTypeChange(PrivateType.Public)}
                {...injectMainBtnClickHookProps('访问控制')}
              >
                修改为{privateNameMap[PrivateType.Public]}空间
              </Button>
            )
            : (
              <Button
                disabled={disabled}
                loading={!this.loadings.isAllFinished()}
                onClick={() => this.handlePrivateTypeChange(PrivateType.Private)}
                {...injectMainBtnClickHookProps('访问控制')}
              >
                修改为{privateNameMap[PrivateType.Private]}空间
              </Button>
            )
        )}
      />
    )

    return (
      <div className={styles.main}>
        {btnView}
      </div>
    )
  }

  render() {
    return (
      <>
        <SettingCard
          title="访问控制"
          doc="access"
          className={styles.cardWithEntry}
          tooltip={this.privateType != null ? tipMap[this.privateType] : ''}
        >
          {this.mainView}
        </SettingCard>
      </>
    )
  }
}

export default function SettingAccess(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSettingAccess {...props} inject={inject} />
    )} />
  )
}
