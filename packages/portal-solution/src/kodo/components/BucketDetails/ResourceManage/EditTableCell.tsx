/**
 * @file component EditableCell of FileList
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import sensors from 'sa-sdk-javascript'
import { Icon, Input, Tooltip } from 'react-icecream/lib'
import { action, computed, observable, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import { getInterceptionValue } from 'kodo/transforms/bucket/resource'

import { ArchiveStatus } from 'kodo/constants/bucket/resource'
import { StorageType, storageTypeTextMap } from 'kodo/constants/statistics'

import { Auth } from 'kodo/components/common/Auth'

import { ResourceApis } from 'kodo/apis/bucket/resource'

import styles from './style.m.less'

export interface IProps {
  title: string
  target: string
  originValue: string
  fname: string
  ftype: StorageType
  bucketName: string
  version?: string
  isNewFile: boolean
  onChange(value: string): Promise<void>
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalEditableCell extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    this.toasterStore = this.props.inject(Toaster)
    Toaster.bindTo(this, this.toasterStore)
  }

  toasterStore: Toaster
  resourceApis = this.props.inject(ResourceApis)
  @observable isEditing = false

  @computed
  get inputField() {
    return new FieldState(this.props.originValue).validators(val => {
      if (val === this.props.originValue) {
        return '不能与原值一样'
      }

      return val === '' && '输入不能为空'
    })
  }

  @autobind
  @Toaster.handle()
  checkFileState() {
    return this.resourceApis.getFileState(this.props.bucketName, {
      key: this.props.fname,
      version: this.props.version
    })
  }

  @action.bound
  startEdit(event: React.SyntheticEvent) {
    // 如果是 归档存储 或 深度归档存储 类型，需要查一下文件状态
    if ([StorageType.Archive, StorageType.DeepArchive].includes(this.props.ftype)) {
      this.checkFileState().then(result => {
        if (result.restoreStatus !== ArchiveStatus.Normal) {
          this.toasterStore.warning(`${storageTypeTextMap[this.props.ftype]}文件，需要解冻完成才能更改${this.props.title}`)
        } else {
          this.doEditting()
        }
      })
    } else {
      this.doEditting()
    }

    // sensors 手动上报
    sensors.quick('trackAllHeatMap', event.currentTarget)
  }

  @action.bound
  doEditting() {
    this.isEditing = true
  }

  @action.bound
  endEdit() {
    this.isEditing = false
  }

  @action.bound
  handleClose() {
    this.inputField.reset(this.props.originValue)
    this.endEdit()
  }

  @action.bound
  updateCellInfo() {
    if (this.inputField.error || this.inputField.value === this.props.originValue) {
      this.handleClose()
      return
    }

    this.props.onChange(this.inputField.value)
      .then(() => this.endEdit())
      .catch(() => this.handleClose())
  }

  render() {
    const assistIcon = (
      <span className={styles.assistIcon}>
        <Icon type="check" onClick={this.updateCellInfo} />
        <Icon type="close" onClick={this.handleClose} />
      </span>
    )

    if (this.isEditing) {
      return (
        <Input
          value={this.inputField.value}
          onChange={e => this.inputField.onChange(e.target.value)}
          onPressEnter={this.updateCellInfo}
          suffix={assistIcon}
          className={styles.editInput}
        />
      )
    }

    return (
      <div className={styles.editCell}>
        <Tooltip title={this.inputField.value} placement="top">
          <div className={styles.content}>
            <div className={styles.formatted}>
              {getInterceptionValue(this.inputField.value)}
            </div>
            <Auth iamPermission={{ actionName: 'Chgm', resource: this.props.bucketName }}>
              <div
                {...sensorsTagFlag(this.props.target, 'edit', this.props.isNewFile ? 'new-file' : 'old-file')}
                className={styles.editIcon}
                onClick={this.startEdit}
              >
                <Icon type="edit" />
              </div>
            </Auth>
          </div>
        </Tooltip>
      </div>
    )
  }
}

export default function EditableCell(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalEditableCell {...props} inject={inject} />
    )} />
  )
}
