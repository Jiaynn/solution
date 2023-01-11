/**
 * @file card of version of bucket setting 版本控制
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
import { VerificationModalStore } from 'portal-base/user/verification'
import { Spin, Switch, Modal } from 'react-icecream/lib'

import { valuesOfEnum } from 'kodo/utils/ts'

import { BucketStore } from 'kodo/stores/bucket'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import Prompt from 'kodo/components/common/Prompt'

import { VersionApis } from 'kodo/apis/bucket/setting/version'

import SettingCard from '../Card'
import { injectMainBtnClickHookProps } from '../Card/sensors'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

enum Loading {
  GetVersion = 'getVersion',
  SetVersion = 'setVersion'
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalSettingVersion extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  bucketStore = this.props.inject(BucketStore)
  versionApis = this.props.inject(VersionApis)
  verificationModalStore = this.props.inject(VerificationModalStore)

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  @computed get versionEnabled() {
    const bucket = this.bucketStore.getDetailsByName(this.props.bucketName)
    return bucket && bucket.versioning
  }

  @Toaster.handle()
  @Loadings.handle(Loading.GetVersion)
  fetchVersionState() {
    return this.bucketStore.fetchDetailsByName(this.props.bucketName)
  }

  @Toaster.handle('设置成功')
  @Loadings.handle(Loading.SetVersion)
  enableVersion() {
    return this.versionApis.enableVersion(this.props.bucketName)
  }

  @autobind
  handleSwitch(_versionEnabled: boolean) {
    Modal.confirm({
      title: '版本控制',
      content: '确定对该空间开启版本控制吗？请注意一旦开启则不能关闭！',
      onOk: () => {
        this.verificationModalStore.verify()
          .then(() => (
            this.enableVersion().then(() => { this.fetchVersionState() })
          )).catch(() => null)
      }
    })
  }

  componentDidMount() {
    this.fetchVersionState()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  enableVersionPromptView = (
    <Prompt>
      确定对该空间开启版本控制吗？请注意一旦开启则不能关闭！
    </Prompt>
  )

  @computed
  get mainView() {
    if (this.versionEnabled == null) {
      return (<Spin />)
    }

    return (
      <div className={styles.main}>
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          disabled={this.versionEnabled}
          checked={this.versionEnabled}
          onChange={this.handleSwitch}
          loading={!this.loadings.isAllFinished()}
          {...injectMainBtnClickHookProps('版本控制')}
        />
      </div>
    )
  }

  render() {
    return (
      <SettingCard
        title="版本控制"
        tooltip="开启功能后，空间的文件将会记录版本号；暂不支持关闭。"
        doc="version"
        className={styles.cardWithEntry}
      >
        {this.mainView}
      </SettingCard>
    )
  }
}
export default function SettingVersion(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSettingVersion {...props} inject={inject} />
    )} />
  )
}
