/**
 * @file component ModifyStorageTypeDrawer 修改文件存储类型
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { FieldState } from 'formstate-x'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Drawer, Icon, Form, Radio, Tooltip } from 'react-icecream/lib'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { bindRadioGroup } from 'portal-base/common/form'

import cardStyles from 'kodo/styles/card.m.less'

import { ConfigStore } from 'kodo/stores/config'

import {
  StorageType, storageTypeTextMap, storageTypeDescTextMap, storageTypeTransformSuccessTextMap
} from 'kodo/constants/statistics'

import HelpDocLink from 'kodo/components/common/HelpDocLink'
import FormTrigger from 'kodo/components/common/FormTrigger'
import Prompt from 'kodo/components/common/Prompt'

import { ResourceApis } from 'kodo/apis/bucket/resource'

import styles from './style.m.less'

export interface IProps {
  visible: boolean
  storageType: StorageType
  bucketName: string
  fileKey: string
  onCancel(): void
  onOk(): void
}

interface DiDeps {
  inject: InjectFunc
}

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 19 }
} as const

const loadingId = 'modify'

@observer
class InternalModifyStorageTypeDrawer extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    this.toasterStore = this.props.inject(Toaster)
    Toaster.bindTo(this, this.toasterStore)
  }

  toasterStore: Toaster
  configStore = this.props.inject(ConfigStore)
  resourceApis = this.props.inject(ResourceApis)

  storageTypeField = new FieldState<StorageType | undefined>(undefined)
  loadings = Loadings.collectFrom(this, loadingId)

  @autobind
  transformStorageType() {
    const req = this.resourceApis.transformStorageType(
      this.props.bucketName,
      { key: this.props.fileKey },
      this.storageTypeField.value!
    )
    req.then(() => {
      this.props.onOk()
    }).catch(() => { /**/ })
    this.toasterStore.promise(req, storageTypeTransformSuccessTextMap[this.storageTypeField.value!])
  }

  @computed
  get radioOptions() {
    return this.configStore.supportedStorageTypes.filter(value => value !== this.props.storageType)
  }

  @computed
  get helpDesc() {
    return this.storageTypeField.value && storageTypeDescTextMap[this.storageTypeField.value] || ''
  }

  render() {
    const { visible, onCancel } = this.props
    return (
      <Drawer
        visible={visible}
        onClose={onCancel}
        width={620}
        title={
          <span>
            修改存储类型
            <Tooltip title="文档">
              <HelpDocLink className={cardStyles.extraButton} doc="chtype">
                <Icon type="file-text" />
              </HelpDocLink>
            </Tooltip>
          </span>
        }
        onOk={this.transformStorageType}
        confirmLoading={this.loadings.isLoading(loadingId)}
      >
        <Prompt>
          低频存储、归档存储{this.configStore.supportedStorageTypes.includes(StorageType.DeepArchive) && '和深度归档存储'}类型，
          <HelpDocLink doc="category" anchor="#compare">Object 最小计量 64KB</HelpDocLink>。<br />
          归档存储{this.configStore.supportedStorageTypes.includes(StorageType.DeepArchive) && '和深度归档存储'}
          类型的文件需要先解冻为可读取状态，才能进行类型转换。<br />
          从低频类型转换为其他类型时，如果该 Object 保存时间少于 30 天，将按照 30 天来计费。<br />
          从归档存储类型转换为其他类型时，如果该 Object 保存时间少于 60 天，将按照 60 天来计费。<br />
          {this.configStore.supportedStorageTypes.includes(StorageType.DeepArchive)
            && '从深度归档存储类型转换为其他类型时，如果该 Object 保存时间少于 180 天，将按照 180 天来计费。'}
        </Prompt>
        <div className={styles.drawerBox}>
          <Form>
            <FormTrigger />
            <Form.Item
              label="存储类型"
              required
              {...formItemLayout}
              extra={this.helpDesc}
            >
              <Radio.Group {...bindRadioGroup(this.storageTypeField)}>
                {this.radioOptions.map(item => (
                  <Radio value={item} key={item}>{storageTypeTextMap[item]}</Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    )
  }
}

export default function ModifyStorageTypeDrawer(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalModifyStorageTypeDrawer {...props} inject={inject} />
    )} />
  )
}
