/**
 * @file Component MediaStyle
 * @author zhangheng <zhangheng01@qiniu.com>
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import moment from 'moment'
import classNames from 'classnames'
import autobind from 'autobind-decorator'
import { Observer, observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'
import { computed, action, observable, makeObservable, reaction } from 'mobx'
import Disposable from 'qn-fe-core/disposable'
import { Provider, Provides, useInjection } from 'qn-fe-core/di'

import { Modal } from 'react-icecream'
import { FieldState } from 'formstate-x'
import { Button, Card, CardTitle, Dropdown, Menu, MenuItem, Table, TableType } from 'react-icecream-2'
import { DownThinIcon, EyeInvisibleThinIcon, EyeThinIcon } from 'react-icecream-2/icons'

import Role from 'portal-base/common/components/Role'
import { UserInfoStore } from 'portal-base/user/account'
import { ToasterStore } from 'portal-base/common/toaster'
import { LocalStorageStore } from 'portal-base/common/utils/storage'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import { KodoIamStore } from 'kodo/stores/iam'
import { ConfigStore } from 'kodo/stores/config'
import { BucketStore, Loading } from 'kodo/stores/bucket'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { PrivateType } from 'kodo/constants/bucket/setting/access'
import { BucketImageStyleRole } from 'kodo/constants/role'

import { Auth } from 'kodo/components/common/Auth'

import { ImageStyleApis, MediaStyle } from 'kodo/apis/bucket/image-style'

import { MediaStyleType } from './CreateStyle/common/constants'
import FullScreenPreviewModal from './CreateStyle/common/Preview/Fullscreen'
import { MediaStyleDrawer, Props as DrawerProps } from './CreateStyle/common/Drawer'

import { CopyStyleMenu } from './CopyStyle'
import { ImageCommand } from './CreateStyle/image'
import { VideoCoverCommand } from './CreateStyle/video/Cover'
import { WatermarkCommand } from './CreateStyle/video/Watermark'
import { TranscodeCommand } from './CreateStyle/video/Transcode'

import AccessSetting from './Access'

import styles from './style.m.less'

const MediaStyleTable: TableType<MediaStyle> = Table

export interface IProps {
  bucketName: string
}

interface DiDeps {
  iamStore: KodoIamStore
  configStore: ConfigStore
  bucketStore: BucketStore
  toasterStore: ToasterStore
  userInfoStore: UserInfoStore
  imageStyleApis: ImageStyleApis
  featureStore: FeatureConfigStore
}

interface GuideItem {
  title: string,
  paragraphs: React.ReactNode[]
}

interface FunctionGuideProps { }

function FunctionGuide(_props: FunctionGuideProps) {
  const storageKey = 'media-function-guide-expand'
  const localStorageStore = useInjection(LocalStorageStore)
  const [expand, setExpand] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (expand == null) return
    localStorageStore.setItem(storageKey, expand)
  }, [localStorageStore, expand])

  React.useEffect(() => {
    const value = localStorageStore.getItem(storageKey)
    setExpand(value == null ? true : value)
  }, [localStorageStore])

  const guideLits = React.useMemo<GuideItem[]>(() => ([{
    title: '点击“新建样式”，配置样式命令',
    paragraphs: [
      <>为 .jpg 格式的文件新建样式 small.jpg</>,
      <>处理参数为 <strong>$0.jpg?imageView2/0/w/240/h/180</strong></>
    ]
  }, {
    title: '访问“<链接>-<样式名>”，可以直接访问处理后的文件',
    paragraphs: [
      <>访问 <strong>http://domain/1-small.jpg</strong> 等价于访问 <strong>http://domain/1.jpg?imageView2/0/w/240/h/180</strong></>,
      <>&quot;-&quot;是默认的样式分隔符，点击“访问设置”可以进行修改</>
    ]
  }, {
    title: '为多种格式的文件创建样式，用于多媒体处理',
    paragraphs: [
      <>样式 small.png 配置处理命令 <strong>$0.png?imageView2/0/w/240/h/180</strong></>,
      <>访问 <strong>http://domain/1-small.png</strong> 等价于访问 <strong>http://domain/1.png?imageView2/0/w/240/h/180</strong></>
    ]
  }]), [])

  const guideItemRender = React.useCallback((index: number, data: GuideItem) => (
    <div className={styles.guideItem} key={data.title}>
      <span className={styles.guideItemIcon}>{index + 1}</span>
      <div className={styles.guideItemContent}>
        <h4>{data.title}</h4>
        {expand && <ul>
          {data.paragraphs.map((paragraph, pIndex) => (
            <li key={pIndex}>
              {paragraph}
            </li>
          ))}
        </ul>}
      </div>
    </div>
  ), [expand])

  const switchButtonView = React.useMemo(() => (
    <span onClick={() => setExpand(!expand)} className={styles.functionGuideToggleButton}>
      {expand ? <EyeInvisibleThinIcon /> : <EyeThinIcon />}
      <span>{expand ? '隐藏指引' : '显示指引'}</span>
    </span>
  ), [expand])

  return (
    <Card
      type="bordered"
      className={styles.functionGuideCard}
      title={<CardTitle title="使用指引" className={styles.functionGuideCardTitle} bordered={false} extra={switchButtonView} />}
    >
      <div className={classNames(styles.functionGuide, { [styles.expand]: expand })}>
        {guideLits.map((guide, index) => guideItemRender(index, guide))}
      </div>
    </Card>
  )
}

type StyleDrawerType = Omit<DrawerProps, 'bucketName' | 'onClose'>

@observer
class InternalMediaStyle extends React.Component<IDetailsBaseOptions & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, props.toasterStore)
  }

  disposable = new Disposable()

  @observable styleDrawerProps: StyleDrawerType = {
    visible: false,
    region: ''
  }

  tableSelection = new FieldState<string[]>([], 0)
  @observable.ref previewData?: MediaStyle  // 当前预览的数据，为空时不显示预览 modal
  @observable accessSettingVisible = false // 访问设置设置 drawer 的可见状态
  @observable guideVisible: boolean | null = null // 指引的显示隐藏状态

  @computed
  get isLoading() {
    const bucketStore = this.props.bucketStore
    return bucketStore.isLoading(Loading.MediaStyle)
  }

  @computed
  get bucketInfo() {
    const bucketStore = this.props.bucketStore
    return bucketStore.getDetailsByName(this.props.bucketName)
  }

  @computed
  get regionConfig() {
    return this.bucketInfo && this.props.configStore.getRegion({
      region: this.bucketInfo.region
    })
  }

  @computed
  get selectedTableData(): MediaStyle[] {
    if (this.tableSelection.value.length === 0) return []
    const nameSet = new Set(this.tableSelection.value)
    return this.mediaStyleList.filter(i => nameSet.has(i.name))
  }

  @computed
  get doraImageConfig() {
    if (this.bucketInfo == null) return null
    const regionConfig = this.props.configStore.getRegion({ region: this.bucketInfo.region })
    return regionConfig && regionConfig.dora.mediaStyle.image
  }

  @computed
  get mediaStyleList() {
    if (this.isLoading) return []
    return this.props.bucketStore.getMediaStyleListByName(this.props.bucketName) || []
  }

  @computed
  get isMediaStyleListVisible() {
    return !this.props.iamStore.isActionDeny({
      actionName: 'GetBucketStyle',
      resource: this.props.bucketName
    })
  }

  @computed
  get isOriginalProtectedVisible() {
    if (!this.regionConfig || !this.regionConfig.dora.mediaStyle.enable) {
      return false
    }

    // 检查 feature
    if (this.props.featureStore.isDisabled('KODO.KODO_MEDIA_STYLE')) {
      return false
    }

    return !this.props.userInfoStore.isIamUser
  }

  @computed
  get isVideoFeatureEnabled() {
    if (!this.regionConfig || !this.regionConfig.dora.mediaStyle.video.enable) {
      return false
    }

    return !this.props.featureStore.isDisabled('KODO.KODO_MEDIA_STYLE_VIDEO')
  }

  @computed
  get isAssessSettingEnabled() {
    return this.isOriginalProtectedVisible
      || !this.props.iamStore.isActionDeny({
        actionName: 'SetSeparator',
        resource: this.props.bucketName
      })
  }

  @action.bound
  updatePreviewDate(data?: MediaStyle) {
    this.previewData = data
  }

  @action.bound
  updateAccessSettingVisible(visible: boolean) {
    this.accessSettingVisible = visible
  }

  @action.bound
  updateGuideVisible(visible: boolean | null) {
    this.guideVisible = visible
  }

  @action.bound
  openStyleDrawer(options: Omit<StyleDrawerType, 'visible' | 'region'>) {
    if (this.bucketInfo == null) return
    this.styleDrawerProps = {
      ...options,
      visible: true,
      region: this.bucketInfo.region
    }
  }

  @action.bound
  closeStyleDrawer(success: boolean) {
    this.styleDrawerProps = {
      ...this.styleDrawerProps,
      visible: false
    }

    if (success) {
      this.refreshBucketStyle()
    }
  }

  @action.bound
  @ToasterStore.handle()
  async refreshBucketInfo() {
    await this.props.bucketStore.fetchDetailsByName(
      this.props.bucketName
    )
  }

  @autobind
  @ToasterStore.handle()
  async refreshBucketStyle() {
    if (!this.isMediaStyleListVisible) return
    await this.props.bucketStore.fetchMediaStyleList(this.props.bucketName)
    this.tableSelection.onChange([]) // 清空选项
  }

  @autobind
  handleDeleteStyle(data: MediaStyle[]) {
    const contentRender = () => {
      if (data.length === 1) {
        return `确定删除多媒体样式 ${data[0].name} 吗？`
      }

      return (
        <>
          确定删除以下多媒体样式吗
          <ul>
            {data.map(d => (<li key={d.name}>{d.name}</li>))}
          </ul>
        </>
      )
    }

    Modal.confirm({
      title: '删除多媒体样式',
      content: contentRender(),
      onOk: () => {
        const req = this.props.imageStyleApis.deleteMediaStyles(
          this.props.bucketName,
          data
        )

        req
          .then(() => this.refreshBucketStyle())
          .catch(() => { /**/ })

        this.props.toasterStore.promise(req)
      }
    })
  }

  @computed
  get headerView() {
    return (
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <Auth
            notProtectedUser
            render={this.renderCreateStyleButtonGroup}
            iamPermission={[
              { actionName: 'PutImageStyle', resource: this.props.bucketName },
              { actionName: 'GetBucketStyle', resource: this.props.bucketName }
            ]}
          />
          <Auth
            notProtectedUser
            render={this.renderBatchOperateButtonGroup}
            iamPermission={{ actionName: 'GetBucketStyle', resource: this.props.bucketName }}
          />
          <Auth
            notProtectedUser
            render={disabled => (
              <Button
                disabled={disabled || !this.isAssessSettingEnabled}
                onClick={() => this.updateAccessSettingVisible(true)}
              >
                访问设置
              </Button>
            )}
          />

        </div>
        <div className={styles.headRight}>
        </div>
      </div>
    )
  }

  @computed
  get previewModalView() {
    return (
      <FullScreenPreviewModal
        showPicker
        style={this.previewData}
        visible={!!this.previewData}
        bucketName={this.props.bucketName}
        onClose={() => this.updatePreviewDate()}
      />
    )
  }

  @computed
  get createMediaStyleDrawerView() {
    return (
      <MediaStyleDrawer
        {...this.styleDrawerProps}
        bucketName={this.props.bucketName}
        onClose={success => this.closeStyleDrawer(success)}
      />
    )
  }

  @computed
  get separatorEditDrawerView() {
    return (
      <AccessSetting
        onRefresh={this.refreshBucketInfo}
        bucketName={this.props.bucketName}
        visible={this.accessSettingVisible}
        onClose={() => this.updateAccessSettingVisible(false)}
      />
    )
  }

  @autobind
  renderCreateStyleButtonGroup(disabled: boolean) {
    const overlay = (
      <Menu>
        <MenuItem
          onClick={() => this.openStyleDrawer({ initType: MediaStyleType.Image })}
          rootHtmlProps={sensorsTagFlag('portalKodo@mediaStyle-image-styleCreate') as any}
        >
          图片处理
        </MenuItem>
        {this.isVideoFeatureEnabled && (
          <>
            <MenuItem
              onClick={() => this.openStyleDrawer({ initType: MediaStyleType.VideoCover })}
              rootHtmlProps={sensorsTagFlag('portalKodo@mediaStyle-videoCover-styleCreate') as any}
            >
              视频封面
            </MenuItem>
            {
              // <MenuItem onClick={() => this.openStyleDrawer({ initType: MediaStyleType.VideoWatermark })}>
              //   视频水印（服务端能力不支持，隐藏了）
              // </MenuItem>
            }
            {this.bucketInfo?.private !== PrivateType.Private && (
              <MenuItem
                onClick={() => this.openStyleDrawer({ initType: MediaStyleType.VideoTranscode })}
                rootHtmlProps={sensorsTagFlag('portalKodo@mediaStyle-videoTranscode-styleCreate') as any}
              >
                视频转码
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    )
    return (
      <Role name={BucketImageStyleRole.AddNewImageStyleEntry}>
        <Dropdown overlay={overlay}>
          <Button
            type="primary"
            disabled={disabled}
            endIcon={<DownThinIcon />}
            className={styles.buttonGap}
          >
            新建样式
          </Button>
        </Dropdown>
      </Role>
    )
  }

  @autobind
  renderBatchOperateButtonGroup() {
    return (
      <Observer render={() => {
        const overlay = (
          <Menu>
            <Auth
              iamPermission={[
                { actionName: 'DeleteImageStyle', resource: this.props.bucketName },
                { actionName: 'GetBucketStyle', resource: this.props.bucketName },
                { actionName: 'PutImageStyle', resource: this.props.bucketName }
              ]}
              render={disabled => (
                <MenuItem
                  disabled={disabled}
                  onClick={() => this.handleDeleteStyle(this.selectedTableData)}
                >
                  批量删除
                </MenuItem>
              )}
            />
            <CopyStyleMenu
              styles={this.selectedTableData}
              bucketName={this.props.bucketName}
            />
          </Menu>
        )

        return (
          <Role name={BucketImageStyleRole.StyleBatchOperateEntry}>
            <Dropdown overlay={overlay}>
              <Button
                endIcon={<DownThinIcon />}
                className={styles.buttonGap}
                disabled={this.tableSelection.value.length === 0}
              >
                批量操作
              </Button>
            </Dropdown>
          </Role>
        )
      }} />
    )
  }

  @autobind
  renderAction(_, value: MediaStyle) {
    const renderSettingBtn = (disabled: boolean) => {
      if (disabled) return (<></>)
      return (
        <Button
          type="link"
          onClick={() => this.openStyleDrawer({ initStyle: value, isEditMode: true })}
        >
          编辑
        </Button>
      )
    }

    const renderCopyBtn = (disabled: boolean) => {
      if (disabled) return (<></>)

      const handleClick = () => {
        const initStyle = {
          ...value,
          name: `请输入样式名-${value.name}`
        }

        this.openStyleDrawer({ initStyle, isEditMode: false })
      }

      return (
        <Button
          type="link"
          onClick={handleClick}
          {...sensorsTagFlag('portalKodo@mediaStyle-quickCreate')}
        >
          复制
        </Button>
      )
    }

    return (
      <div className={styles.actionsGroup}>
        <Auth
          notProtectedUser
          iamPermission={{ actionName: 'PutImageStyle', resource: this.props.bucketName }}
          render={disabled => <Observer render={() => renderSettingBtn(disabled)} />}
        />
        <Auth
          notProtectedUser
          iamPermission={{ actionName: 'PutImageStyle', resource: this.props.bucketName }}
          render={disabled => <Observer render={() => renderCopyBtn(disabled)} />}
        />
        <Button type="link" onClick={() => this.updatePreviewDate(value)}>预览</Button>
        <Auth
          iamPermission={[
            { actionName: 'PutImageStyle', resource: this.props.bucketName },
            { actionName: 'DeleteImageStyle', resource: this.props.bucketName }
          ]}
          render={disabled => {
            if (disabled) return (<></>)
            return (<Button type="link" onClick={() => this.handleDeleteStyle([value])}>删除</Button>)
          }}
        />
      </div>
    )
  }

  componentDidMount() {
    this.disposable.addDisposer(this.tableSelection.dispose)
    this.disposable.addDisposer(reaction(
      () => this.isMediaStyleListVisible,
      () => this.refreshBucketStyle(),
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    return (
      <div className={styles.imageStyle}>
        {this.separatorEditDrawerView}
        {this.createMediaStyleDrawerView}
        {this.previewModalView}
        <FunctionGuide />
        {this.headerView}
        <div className={styles.tableContainer}>
          <MediaStyleTable
            pagination={false}
            recordIdAccessor="name"
            loading={this.isLoading}
            records={this.mediaStyleList}
            selection={{
              type: 'multiple',
              selectedIds: this.tableSelection.value,
              onChange: v => this.tableSelection.onChange(v)
            }}
          >
            <MediaStyleTable.Column title="名称"
              accessor="name"
              render={name => (<span className={styles.columnText}>{name}</span>)}
            />
            <MediaStyleTable.Column title="处理接口"
              accessor="commands"
              render={commands => (<span className={styles.columnText}>{commands}</span>)}
            />
            <MediaStyleTable.Column title="更新时间"
              accessor="update_time"
              width="160px"
              render={updateTime => moment(updateTime).format('YYYY/MM/DD HH:mm:ss')}
            />
            <MediaStyleTable.Column title="操作" render={this.renderAction} width="160px" />
          </MediaStyleTable>
        </div>
      </div>
    )
  }
}

export default function MediaStyleManager(props: IProps) {
  const iamStore = useInjection(KodoIamStore)
  const configStore = useInjection(ConfigStore)
  const bucketStore = useInjection(BucketStore)
  const toasterStore = useInjection(ToasterStore)
  const userInfoStore = useInjection(UserInfoStore)
  const imageStyleApis = useInjection(ImageStyleApis)
  const featureStore = useInjection(FeatureConfigStore)
  const imageCommand = useLocalStore(ImageCommand)
  const videoCoverCommand = useLocalStore(VideoCoverCommand)
  const watermarkCommand = useLocalStore(WatermarkCommand)
  const transcodeCommand = useLocalStore(TranscodeCommand)

  const provides = React.useMemo<Provides>(() => [
    { identifier: ImageCommand, value: imageCommand },
    { identifier: VideoCoverCommand, value: videoCoverCommand },
    { identifier: WatermarkCommand, value: watermarkCommand },
    { identifier: TranscodeCommand, value: transcodeCommand }
  ], [imageCommand, watermarkCommand, videoCoverCommand, transcodeCommand])

  return (
    <Provider provides={provides}>
      <InternalMediaStyle
        {...props}
        iamStore={iamStore}
        configStore={configStore}
        bucketStore={bucketStore}
        toasterStore={toasterStore}
        featureStore={featureStore}
        userInfoStore={userInfoStore}
        imageStyleApis={imageStyleApis}
      />
    </Provider>
  )
}
