/**
 * @file card of encryption of bucket setting 服务端加密
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'

import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Spin, Switch } from 'react-icecream/lib'

import { valuesOfEnum } from 'kodo/utils/ts'

// import { bindSwitchField } from 'kodo/utils/formstate/bind'
import { BucketStore } from 'kodo/stores/bucket'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { Auth } from 'kodo/components/common/Auth'

import { EncryptionApis } from 'kodo/apis/bucket/setting/encryption'

import SettingCard from '../Card'
import { injectMainBtnClickHookProps } from '../Card/sensors'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  GetEncryption = 'getEncryption',
  SetEncryption = 'setEncryption'
}

@observer
class InternalSettingEncryption extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  bucketStore = this.props.inject(BucketStore)
  encryptionApis = this.props.inject(EncryptionApis)

  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))
  disposable = new Disposable()

  @computed get encryptionEnabled() {
    const bucket = this.bucketStore.getDetailsByName(this.props.bucketName)
    return bucket && bucket.encryption_enabled
  }

  @Toaster.handle()
  @Loadings.handle(Loading.GetEncryption)
  fetchEncryptionState() {
    return this.bucketStore.fetchDetailsByName(this.props.bucketName)
  }

  @Toaster.handle('设置成功')
  @Loadings.handle(Loading.SetEncryption)
  setRemoteEncryption(encryptionEnabled: boolean) {
    return this.encryptionApis.setEncryption(this.props.bucketName, encryptionEnabled)
  }

  @autobind
  handleSwitch(encryptionEnabled: boolean) {
    this.setRemoteEncryption(encryptionEnabled).then(() => { this.fetchEncryptionState() })
  }

  componentDidMount() {
    this.fetchEncryptionState()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @computed
  get mainView() {
    if (this.encryptionEnabled == null) {
      return (<Spin />)
    }

    return (
      <div className={styles.main}>
        <Auth
          notProtectedUser
          render={disabled => (
            <Switch
              checkedChildren="开启"
              unCheckedChildren="关闭"
              disabled={disabled}
              checked={this.encryptionEnabled}
              onChange={this.handleSwitch}
              loading={!this.loadings.isAllFinished()}
              {...injectMainBtnClickHookProps('服务端加密')}
            />
          )}
        />
      </div>
    )
  }

  render() {
    return (
      <SettingCard
        title="服务端加密"
        tooltip="开启后，存储落盘时加密，正常数据访问不受影响。"
        doc="dataProtectionSSEncryption"
        className={styles.cardWithEntry}
      >
        {this.mainView}
      </SettingCard>
    )
  }
}

export default function SettingEncryption(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSettingEncryption {...props} inject={inject} />
    )} />
  )
}
