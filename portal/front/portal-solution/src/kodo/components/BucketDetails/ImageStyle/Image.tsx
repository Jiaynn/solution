/**
 * @file Component ImageStyle
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, action, observable, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import { Observer, observer } from 'mobx-react'
import { Inject, InjectFunc, useInjection } from 'qn-fe-core/di'
import { Button, Table, Modal } from 'react-icecream/lib'
import Role from 'portal-base/common/components/Role'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import {
  getStyleOutputFormat, getStyleAbbreviationType,
  getStyleQuality, getImagePreviewUrl,
  isImageFormatBrowserSupported
} from 'kodo/transforms/image-style'

import { ConfigStore } from 'kodo/stores/config'
import { BucketStore } from 'kodo/stores/bucket'
import { KodoIamStore } from 'kodo/stores/iam'

import { getImageStyleSetPath } from 'kodo/routes/image-style'

import { BucketImageStyleRole } from 'kodo/constants/role'

import { Auth } from 'kodo/components/common/Auth'

import { ImageStyleApis, MediaStyle } from 'kodo/apis/bucket/image-style'

import Separator from './Separator'
import ImageStyleDrawer from './Drawer'

import styles from './style.m.less'

class MediaStyleTable extends Table<MediaStyle> { }
const TableColumn = Table.Column
class MediaStyleColumn extends TableColumn<MediaStyle> { }

export function useDoraImageConfig(bucketName: string) {
  const bucketStore = useInjection(BucketStore)
  const configStore = useInjection(ConfigStore)
  const bucketInfo = bucketStore.getDetailsByName(bucketName)

  return bucketInfo && configStore.getRegion({ region: bucketInfo.region }).dora.image
}

export interface IProps {
  bucketName: string
  drawerVisible:boolean
  onUpdate(): void
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalImageStyle extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  @observable viewState = false
  @observable isSeparatorVisible = false
  @observable.ref previewData: MediaStyle | undefined
  @observable drawerVisible = this.props.drawerVisible
  configStore = this.props.inject(ConfigStore)

  @computed
  get bucketInfo() {
    const bucketStore = this.props.inject(BucketStore)
    return bucketStore.getDetailsByName(this.props.bucketName)
  }

  @computed
  get doraImageConfig() {
    return this.bucketInfo && this.configStore.getRegion({ region: this.bucketInfo.region }).dora.image
  }

  @computed
  get styleList(): MediaStyle[] {
    if (!this.isImageStyleListVisible || !this.bucketInfo || !this.bucketInfo.styles) {
      return []
    }

    return Object.keys(this.bucketInfo.styles).map(key => ({
      name: key,
      commands: this.bucketInfo!.styles[key]
    }))
  }

  @computed
  get isImageStyleListVisible() {
    const iamStore = this.props.inject(KodoIamStore)

    return [
      iamStore.isActionDeny({ actionName: 'PutImageStyle', resource: this.props.bucketName }),
      iamStore.isActionDeny({ actionName: 'DeleteImageStyle', resource: this.props.bucketName })
    ].includes(false)
  }

  @autobind
  @Toaster.handle()
  deleteStyle(value: MediaStyle) {
    const imageStyleApis = this.props.inject(ImageStyleApis)
    const req = imageStyleApis.deleteImageStyle(this.props.bucketName, value.name)
    req.then(() => this.props.onUpdate()).catch(() => { /**/ })
    return req
  }

  @action.bound
  updateData(state: boolean, data?: MediaStyle) {
    this.viewState = state
    this.previewData = data
  }

  @action.bound
  updateSeparatorVisible(visible: boolean) {
    this.isSeparatorVisible = visible
  }

  @action.bound
  handleSeparatorOK() {
    this.updateSeparatorVisible(false)
    this.props.onUpdate()
  }

  @autobind
  handleDeleteStyle(data: MediaStyle) {
    Modal.confirm({
      title: '删除图片样式',
      content: `确定删除图片样式 ${data.name} 吗？`,
      onOk: () => this.deleteStyle(data)
    })
  }

  @action.bound
  openDrawer(data?: MediaStyle) {
    this.previewData = data
    this.drawerVisible = true
  }

  @action.bound
  closeDrawer() {
    this.props.onUpdate()
    this.drawerVisible = false
  }

  @autobind
  renderCreateStyle(disabled: boolean) {
    const openCreateImageStyle = () => window.open(`https://portal.qiniu.com/dora/fop/imageprocess?bucket=${this.props.bucketName}`, '_blank')
    return (
      <Role name={BucketImageStyleRole.AddNewImageStyleEntry}>
        <Button
          type="primary"
          icon="plus"
          disabled={disabled}
          onClick={openCreateImageStyle}
          {...sensorsTagFlag('portalKodo@imageStyle-image-styleCreate')}
        >
          新建图片样式
        </Button>
      </Role>
    )
  }

  @autobind
  renderAction(_, value: MediaStyle) {

    const openImageStyleConfig = () => window.open('https://portal.qiniu.com/' + getImageStyleSetPath(this.props.bucketName, value.name), '_blank')

    const renderSettingBtn = (disabled: boolean) => (
      <Button
        disabled={disabled}
        type="link"
        onClick={openImageStyleConfig}
      >
        设置
      </Button>)

    return (
      <div>
        <Auth
          notProtectedUser
          iamPermission={{ actionName: 'PutImageStyle', resource: this.props.bucketName }}
          render={disabled => <Observer render={() => renderSettingBtn(disabled)} />}
        />
        <Button type="link" onClick={() => this.updateData(true, value)}>预览</Button>
        <Auth
          iamPermission={{ actionName: 'DeleteImageStyle', resource: this.props.bucketName }}
          render={disabled => (
            <Button type="link" onClick={() => this.handleDeleteStyle(value)} disabled={disabled}>删除</Button>
          )}
        />
      </div>
    )
  }

  @computed
  get previewContent() {
    if (!this.previewData) {
      return null
    }

    const oldVersionPreviewUrl = 'https://dn-portal-files.qbox.me/sample1.jpg'

    const previewUrl = getImagePreviewUrl(
      this.doraImageConfig?.isOldVersion ? oldVersionPreviewUrl : this.doraImageConfig?.defaultImageUrl || '',
      this.previewData.commands
    )

    const outFormat = (getStyleOutputFormat(this.previewData.commands) || '').toLowerCase()
    let content: React.ReactElement

    if (outFormat && (outFormat === 'tiff' || outFormat === 'webp') && !isImageFormatBrowserSupported(outFormat)) {
      content = (<div>该浏览器无法预览 {outFormat} 格式的图片</div>)
    } else {
      content = (
        <img
          alt="预览图"
          className={styles.previewImage}
          src={previewUrl}
        />
      )
    }

    const scaleType = getStyleAbbreviationType(this.previewData.commands)
    const quality = getStyleQuality(this.previewData.commands)

    return (
      <div className={styles.modalContent}>
        <div className={styles.modalTitle}>图片样式预览</div>
        <div className={styles.imageDesc}>
          <div className={styles.gap}>图片名称：<span>{this.previewData.name}</span></div>
          {!!scaleType && <div className={styles.gap}>缩略方式：<span>{scaleType}</span></div>}
          {!!outFormat && <div className={styles.gap}>图片格式：<span>{outFormat}</span></div>}
          {!!quality && <div>图片质量：<span>{quality}</span></div>}
        </div>
        <div>{content}</div>
      </div>
    )
  }

  render() {
    return (
      <div className={styles.imageStyle}>
        <ImageStyleDrawer
          visible={this.drawerVisible}
          bucketName={this.props.bucketName}
          onClose={this.closeDrawer}
          onSave={this.closeDrawer}
          style={this.previewData}
        />
        <Modal
          className={styles.viewModal}
          onCancel={() => this.updateData(false)}
          footer={null}
          visible={this.viewState}
        >
          {this.previewContent}
        </Modal>
        <Separator
          bucketName={this.props.bucketName}
          visible={this.isSeparatorVisible}
          onOk={this.handleSeparatorOK}
          onCancel={() => this.updateSeparatorVisible(false)}
        />
        <div className={styles.head}>
          <Auth
            notProtectedUser
            iamPermission={{ actionName: 'PutImageStyle', resource: this.props.bucketName }}
            render={this.renderCreateStyle}
          />
          <Auth
            iamPermission={{ actionName: 'SetSeparator', resource: this.props.bucketName }}
            render={disabled => (
              <Button
                className={styles.separatorButton}
                onClick={() => this.updateSeparatorVisible(true)}
                disabled={disabled}
              >
                样式分隔符设置
              </Button>
            )}
          />
        </div>
        <div className={styles.tableContainer}>
          <MediaStyleTable dataSource={this.styleList} pagination={false} rowKey="name">
            <MediaStyleColumn title="名称" dataIndex="name" key="name" className={styles.tdBreak} />
            <MediaStyleColumn title="处理接口" dataIndex="commands" key="commands" width="60%" className={styles.tdBreak} />
            <MediaStyleColumn title="操作" render={this.renderAction} width="15%" />
          </MediaStyleTable>
        </div>
      </div>
    )
  }
}

export default function ImageStyle(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalImageStyle {...props} inject={inject} />
    )} />
  )
}
