/**
 * @file component Setting 上传页面的设置管理
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Icon, Input, Switch, Tooltip, Select } from 'react-icecream/lib'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Link } from 'portal-base/common/router'
import Role from 'portal-base/common/components/Role'

import { bindTextInputField, bindSwitchField } from 'kodo/utils/formstate'

import { ConfigStore } from 'kodo/stores/config'
import { BucketStore } from 'kodo/stores/bucket'

import { getTranscodeStylePath } from 'kodo/routes/bucket'

import { BucketFileUploadRole } from 'kodo/constants/role'
import { StorageType, storageTypeTextMap } from 'kodo/constants/statistics'

import { Description } from 'kodo/components/common/Description'
import { Auth } from 'kodo/components/common/Auth'

import { IBucket, ITranscodeStyle, ITranscodeStyleInfo } from 'kodo/apis/bucket'

import styles from './style.m.less'

export interface IProps {
  ftypeField: FieldState<StorageType>
  isCovered: FieldState<boolean>
  prefix: FieldState<string>
  updatePutPolicy(transcodeList: ITranscodeStyleInfo[]): void
  bucketName: string
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalSetting extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  configStore = this.props.inject(ConfigStore)
  bucketStore = this.props.inject(BucketStore)
  @observable.ref transcodeStyleList: ITranscodeStyle = {}
  @observable.ref selectedTranscodeStyle: string[] = []

  @action.bound
  handleAddTranscodeStyle(values: string[]) {
    this.selectedTranscodeStyle = values
    this.props.updatePutPolicy(values.map(key => this.transcodeStyleList[key]))
  }

  @action.bound
  handleStorageTypeChange(type: StorageType) {
    if ([StorageType.Archive, StorageType.DeepArchive].includes(type)) {
      this.selectedTranscodeStyle = []
      this.props.updatePutPolicy([])
    }
    this.props.ftypeField.onChange(type)
  }

  @computed
  get isShared() {
    const isShared = this.bucketStore.isShared(this.props.bucketName)
    return isShared !== null ? isShared : true // 权限从严
  }

  @computed
  get regionConfig() {
    const bucketInfo = this.bucketStore.getDetailsByName(this.props.bucketName)
    if (bucketInfo == null) {
      return null
    }

    return this.configStore.getRegion({ region: bucketInfo.region })
  }

  @action.bound
  updateTranscodeStyleList(data: IBucket) {
    this.transcodeStyleList = data.transcode_styles || {}
  }

  @autobind
  @Toaster.handle()
  fetchTranscodeList() {
    const req = this.bucketStore.fetchDetailsByName(this.props.bucketName)
    req.then(this.updateTranscodeStyleList).catch(() => { /**/ })
    return req
  }

  componentDidMount() {
    this.fetchTranscodeList()
  }

  @computed
  get storageTypeRadioView() {
    return (
      <div>
        <p>选择上传文件存储类型</p>
        <Select
          value={this.props.ftypeField.value}
          onChange={this.handleStorageTypeChange}
          placeholder="请选择存储类型"
          style={{ width: '100%' }}
        >
          {this.configStore.supportedStorageTypes.map(type => (
            <Select.Option key={type} value={type}>
              {storageTypeTextMap[type]}
            </Select.Option>
          ))}
        </Select>
      </div>
    )
  }

  @computed
  get prefixSettingView() {
    return (
      <Role name={BucketFileUploadRole.PrefixInput}>
        <div className={styles.prefixSetting}>
          <p className={styles.textLabel}>设置路径前缀：</p>
          <Input
            placeholder="示例：image/**"
            {...bindTextInputField(this.props.prefix)}
          // to avoid input lose focus, set an empty <span /> element to keep the dom structure
          />
        </div>
      </Role>
    )
  }

  @computed
  get transcodeStyleSettingView() {
    if (!this.regionConfig) return null
    if (!this.regionConfig.dora.transcode.enable) return null

    return (
      <Role name={BucketFileUploadRole.TranscodeStyleInput}>
        <div className={styles.transcodeStyle}>
          <p>转码样式：</p>
          <Select
            mode="multiple"
            placeholder="请选择转码样式"
            className={styles.transcodeSelect}
            value={this.selectedTranscodeStyle}
            onChange={this.handleAddTranscodeStyle}
            disabled={[StorageType.Archive, StorageType.DeepArchive].includes(this.props.ftypeField.value)}
          >
            {
              Object.keys(this.transcodeStyleList).map(key => (
                <Select.Option key={key} value={key}>{key}</Select.Option>
              ))
            }
          </Select>
          <Auth notIamUser notProtectedUser>
            <div className={styles.transcodeWarning}>
              {/* TODO: route */}
              {
                !this.isShared && (
                  <Link to={getTranscodeStylePath(this.props.inject, { bucketName: this.props.bucketName })}>
                    新增转码样式
                  </Link>
                )
              }
            </div>
          </Auth>
        </div>
      </Role>
    )
  }

  @computed
  get coveredSettingView() {
    return (
      <Role name={BucketFileUploadRole.CoveredCtrl}>
        <div>
          <Tooltip title="开启上传覆盖后，允许上传同名文件，关闭上传覆盖将无法上传同名文件">
            <Icon type="question-circle" />
          </Tooltip>
          <span className={styles.textLabel}>上传覆盖：</span>
          <Switch
            className={styles.switch}
            checkedChildren="开启"
            unCheckedChildren="关闭"
            {...bindSwitchField(this.props.isCovered)}
          />
        </div>
      </Role>
    )
  }

  @computed
  get descriptionView() {
    const config = this.configStore.getFull()
    if (!config.objectStorage.resourceManage.upload.description) {
      return null
    }

    return (
      <div className={styles.textWarning}>
        <span><Icon type="warning" />上传须知</span>
        <Description tag="p"
          dangerouslyText={
            config.objectStorage.resourceManage.upload.description
          } />
      </div>
    )
  }

  render() {
    return (
      <div className={styles.assistArea}>
        {this.storageTypeRadioView}
        {this.prefixSettingView}
        {this.transcodeStyleSettingView}
        {this.coveredSettingView}
        {this.descriptionView}
      </div>
    )
  }
}

export default function Setting(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSetting {...props} inject={inject} />
    )} />
  )
}
