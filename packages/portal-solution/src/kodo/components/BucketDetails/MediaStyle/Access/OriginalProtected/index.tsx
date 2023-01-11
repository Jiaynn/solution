/**
 * @file original protected of bucket setting 原始资源保护
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import Disposable from 'qn-fe-core/disposable'
import { action, computed, makeObservable, observable, reaction } from 'mobx'

import { InjectFunc, Inject } from 'qn-fe-core/di'
import { Loadings } from 'portal-base/common/loading'
import { UserInfoStore } from 'portal-base/user/account'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Alert, Switch, FormItem } from 'react-icecream-2'

import { valuesOfEnum } from 'kodo/utils/ts'

import { ConfigStore } from 'kodo/stores/config'
import { BucketStore } from 'kodo/stores/bucket'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { ProtectedMode } from 'kodo/constants/bucket/setting/original-protected'

import { Description } from 'kodo/components/common/Description'
import HelpDocLink from 'kodo/components/common/HelpDocLink'
import { Auth } from 'kodo/components/common/Auth'

import { OriginalProtectedApis } from 'kodo/apis/bucket/setting/original-protected'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions {
  onChanged(value: boolean): void
  onSubmitChange(submit: () => Promise<void>): void
}

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  GetProtected = 'getProtected',
  SetProtected = 'setProtected'
}

@observer
class InternalOriginalProtectedSetting extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  disposable = new Disposable()
  bucketStore = this.props.inject(BucketStore)
  configStore = this.props.inject(ConfigStore)
  userInfoStore = this.props.inject(UserInfoStore)
  featureStore = this.props.inject(FeatureConfigStore)
  originalProtectedApis = this.props.inject(OriginalProtectedApis)
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))
  @observable protectedMode: ProtectedMode | null = null

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
  get originalProtectedVisible() {
    if (!this.regionConfig || !this.regionConfig.dora.mediaStyle.enable) {
      return false
    }

    // 检查 feature
    if (this.featureStore.isDisabled('KODO.KODO_MEDIA_STYLE')) {
      return false
    }

    return !this.userInfoStore.isIamUser
  }

  componentDidMount() {
    this.props.onSubmitChange(this.setRemoteProtectedMode)

    this.disposable.addDisposer(reaction(
      () => [this.protectedMode, this.bucketDetails],
      () => {
        if (this.protectedMode == null && this.bucketDetails?.protected != null) {
          this.protectedMode = this.bucketDetails?.protected
        }

        this.props.onChanged(
          this.protectedMode !== this.bucketDetails?.protected
        )
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @action.bound
  updateProtectedMode(mode: ProtectedMode) {
    this.protectedMode = mode
  }

  @autobind
  @Loadings.handle(Loading.SetProtected)
  async setRemoteProtectedMode() {
    const oldProtected = this.bucketDetails && this.bucketDetails.protected
    // 如果模式没有发生改变，不进行任何操作
    if (this.protectedMode == null || this.protectedMode === oldProtected) return

    return this.originalProtectedApis.setProtectedMode(
      this.props.bucketName,
      this.protectedMode
    )
  }

  @autobind
  handleSwitchChange(state: boolean) {
    this.updateProtectedMode(state ? ProtectedMode.Enable : ProtectedMode.Disable)
  }

  @computed
  get mainView() {
    return (
      <Auth
        notProtectedUser
        render={disabled => (
          <FormItem
            label="原始资源保护"
            layout="horizontal"
            className={styles.form}
            labelVerticalAlign="text"
          >
            <Switch
              disabled={disabled}
              checkedChildren="开启"
              unCheckedChildren="关闭"
              onChange={this.handleSwitchChange}
              loading={!this.loadings.isAllFinished()}
              checked={this.protectedMode === ProtectedMode.Enable}
            />
          </FormItem>
        )}
      />
    )
  }

  render() {
    if (!this.originalProtectedVisible) return null
    const originalProtected = this.regionConfig?.dora.mediaStyle.originalProtected

    return (
      <div>
        <div className={styles.header}>
          <h4>原始资源保护</h4>
          <HelpDocLink doc="originalResourceProtection">了解原始资源保护</HelpDocLink>
        </div>
        {originalProtected && originalProtected.description && (
          <Alert message={(
            <Description
              tag="span"
              dangerouslyText={originalProtected.description} />
          )} />
        )}
        {this.mainView}
      </div>
    )
  }
}

export default function OriginalProtectedSetting(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalOriginalProtectedSetting {...props} inject={inject} />
    )} />
  )
}
