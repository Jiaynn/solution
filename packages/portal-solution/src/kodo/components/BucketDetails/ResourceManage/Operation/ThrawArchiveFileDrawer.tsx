/**
 * @file component ThrawArchiveDrawer 解冻归档存储文件
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Drawer, Form, InputNumber } from 'react-icecream/lib'
import { FieldState } from 'formstate-x'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Loadings } from 'portal-base/common/loading'
import { bindInputNumber, bindFormItem } from 'portal-base/common/form'
import { makeCancelled } from 'qn-fe-core/exception'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { storageTypeTextMap, StorageType } from 'kodo/constants/statistics'

import Prompt from 'kodo/components/common/Prompt'
import FormTrigger from 'kodo/components/common/FormTrigger'

import { ResourceApis } from 'kodo/apis/bucket/resource'
import styles from './style.m.less'

export interface IProps {
  visible: boolean
  bucketName: string
  fileKey: string
  onClose(): void
  storageType: StorageType
}

interface DiDeps {
  inject: InjectFunc
}

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 17 }
} as const

const loadingId = 'thraw'

@observer
class InternalThrawArchiveDrawer extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  resourceApis = this.props.inject(ResourceApis)
  loadings = Loadings.collectFrom(this, loadingId)
  effectiveDays = new FieldState<number>(1).validators(value => {
    if (!/^[1-7]$/.test(String(value))) {
      return '请输入 1 ～ 7 之间的整数'
    }
  })

  @autobind
  @Toaster.handle()
  async handleSubmit() {
    const result = await this.effectiveDays.validate()
    if (result.hasError) {
      throw makeCancelled()
    }

    const { bucketName, fileKey, onClose } = this.props
    const req = this.resourceApis.thrawArchiveFile({
      bucket: bucketName,
      fileName: fileKey,
      freezeAfterDays: this.effectiveDays.value
    })

    req.then(onClose).catch(() => { /**/ })
    return req
  }

  render() {
    const { visible, onClose } = this.props
    return (
      <Drawer
        visible={visible}
        onClose={onClose}
        width={620}
        title={`解冻${storageTypeTextMap[this.props.storageType]}文件`}
        onOk={this.handleSubmit}
        confirmLoading={this.loadings.isLoading(loadingId)}
      >
        <Prompt>
          {this.props.storageType === StorageType.Archive
            && '归档文件默认解冻 1 天，可以设置解冻有效期最多 7 天，解冻操作耗时约 5 分钟。'}
          {this.props.storageType === StorageType.DeepArchive
            && '深度归档文件默认解冻 1 天，可以设置解冻有效期最多 7 天，解冻操作耗时约 12 小时。'}
        </Prompt>
        <div className={styles.drawerBox}>
          <Form>
            <FormTrigger />
            <Form.Item
              label="有效期"
              required
              {...formItemLayout}
              {...bindFormItem(this.effectiveDays)}
            >
              <InputNumber {...bindInputNumber(this.effectiveDays)} min={1} max={7} /> 天
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    )
  }
}

export default function ThrawArchiveDrawer(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalThrawArchiveDrawer {...props} inject={inject} />
    )} />
  )
}
