/**
 * @file original protected of bucket setting 原图保护
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'

import { InjectFunc, Inject } from 'qn-fe-core/di'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Spin, Switch } from 'react-icecream/lib'

import { valuesOfEnum } from 'kodo/utils/ts'

import { ConfigStore } from 'kodo/stores/config'
import { BucketStore } from 'kodo/stores/bucket'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { ProtectedMode } from 'kodo/constants/bucket/setting/original-protected'

import { Description } from 'kodo/components/common/Description'
import Prompt from 'kodo/components/common/Prompt'
import { Auth } from 'kodo/components/common/Auth'

import { OriginalProtectedApis } from 'kodo/apis/bucket/setting/original-protected'

import SettingCard from '../Card'
import { injectMainBtnClickHookProps } from '../Card/sensors'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  GetProtected = 'getProtected',
  SetProtected = 'setProtected'
}

@observer
class InternalSettingProtected extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  bucketStore = this.props.inject(BucketStore)
  configStore = this.props.inject(ConfigStore)
  originalProtectedApis = this.props.inject(OriginalProtectedApis)
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  componentDidMount() {
    this.fetchProtectedMode()
  }

  @computed
  get bucketDetails() {
    return this.bucketStore.getDetailsByName(this.props.bucketName)
  }

  @computed
  get regionConfig() {
    if (this.bucketDetails == null) {
      return null
    }

    return this.configStore.getRegion({
      region: this.bucketDetails.region
    })
  }

  @computed
  get protectedMode() {
    const bucket = this.bucketStore.getDetailsByName(this.props.bucketName)
    return bucket && bucket.protected
  }

  @Toaster.handle()
  @Loadings.handle(Loading.GetProtected)
  fetchProtectedMode() {
    return this.bucketStore.fetchDetailsByName(this.props.bucketName)
  }

  @Toaster.handle('设置成功')
  @Loadings.handle(Loading.SetProtected)
  setRemoteProtectedMode(mode: ProtectedMode) {
    return this.originalProtectedApis.setProtectedMode(this.props.bucketName, mode)
  }

  @autobind
  handleSwitch(state: boolean) {
    this.setRemoteProtectedMode(state ? ProtectedMode.Enable : ProtectedMode.Disable)
      .then(() => this.fetchProtectedMode())
      .catch(() => null)
  }

  @computed
  get mainView() {
    if (this.protectedMode == null) {
      return (<Spin />)
    }

    return (
      <div>
        <Auth
          notProtectedUser
          render={disabled => (
            <Switch
              checkedChildren="开启"
              unCheckedChildren="关闭"
              disabled={disabled}
              onChange={this.handleSwitch}
              loading={!this.loadings.isAllFinished()}
              checked={this.protectedMode === ProtectedMode.Enable}
              {...injectMainBtnClickHookProps('原图保护')}
            />
          )}
        />
      </div>
    )
  }

  render() {
    const originalProtected = this.regionConfig?.dora.image.originalProtected

    return (
      <SettingCard
        className={styles.card}
        title="原图保护"
        tooltip="原图保护是云存储针对媒体类源文件的保护措施。"
        doc="originalProtection"
      >
        {originalProtected && originalProtected.description && (
          <Prompt className={styles.prompt}>
            <Description tag="span" dangerouslyText={originalProtected.description} />
          </Prompt>
        )}
        {this.mainView}
      </SettingCard>
    )
  }
}

export default function SettingProtected(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSettingProtected {...props} inject={inject} />
    )} />
  )
}
