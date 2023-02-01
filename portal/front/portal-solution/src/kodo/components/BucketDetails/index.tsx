/**
 * @file bucket details
 * @description bucket 详情
 * @author yinxulai <me@yinxulai.com>
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import React from 'react'
import { action, computed, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { Tabs } from 'react-icecream/lib'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Link, Route, Switch, RouterStore } from 'portal-base/common/router'
import Role from 'portal-base/common/components/Role'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import { getBooleanQuery } from 'kodo/utils/route'
import { getFirstQuery } from 'kodo/utils/url'

import { isDomainAvailable } from 'kodo/transforms/domain'

import { BucketStore } from 'kodo/stores/bucket'
import { ConfigStore } from 'kodo/stores/config'
import { KodoIamStore } from 'kodo/stores/iam'

import { getDetailRootPath, getDetailsPath, getListPath, IDetailsBaseOptions } from 'kodo/routes/bucket'

import { BucketDetailPageRole } from 'kodo/constants/role'
import { BucketPage, bucketPageNameMap } from 'kodo/constants/bucket'

import NoPermission from 'kodo/components/common/NoPermission'
import { NotFoundRedirect } from 'kodo/components/common/NotFoundRedirect'
import SwapIcon from 'kodo/components/common/Icons/swap'
import MagicVarsProvider from 'kodo/components/common/MagicVarsProvider'

import Domain from './Domain'
import Setting from './Setting'
import Overview from './Overview'
import { ObjectManage } from './ObjectManage'
import ResourceManage from './ResourceManage'
import TranscodeStyle from './TranscodeStyle'
import ImageStyle from './ImageStyle'
import MediaStyleManager from './MediaStyle'
import { MediaStyleDrawer } from './MediaStyle/CreateStyle/common/Drawer'
import { MediaStyleDrawerStore } from './MediaStyle/CreateStyle/common/Drawer/store'
import MediaStyleDrawerProvider from './MediaStyle/CreateStyle/common/Drawer/Provider'
import BucketInfo from './BucketInfo'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

type ResourceVersion = 'v1' | 'v2'

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalDetails extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  iamStore = this.props.inject(KodoIamStore)
  configStore = this.props.inject(ConfigStore)
  routerStore = this.props.inject(RouterStore)
  bucketStore = this.props.inject(BucketStore)
  featureStore = this.props.inject(FeatureConfigStore)
  mediaStyleStore = this.props.inject(MediaStyleDrawerStore)

  disposable = new Disposable()

  @observable.ref curResourceVersion: ResourceVersion = 'v2' // 新版 / 旧版

  @action.bound
  updateCurResourceVersion(version: ResourceVersion) {
    this.curResourceVersion = version
  }

  @Toaster.handle()
  async fetchBucketStorageInfo(bucketName: string) {
    const bucket = await this.bucketStore.fetchDetailsByName(bucketName)
    // 获取存储信息
    const storageInfoOptions = { bucket: bucketName, region: bucket.region }
    const globalConfig = this.configStore.getFull()
    const promiseList: Array<Promise<any>> = []

    promiseList.push(this.bucketStore.fetchStandardStorageInfo(storageInfoOptions))

    if (globalConfig.objectStorage.storageType.archive.enable) {
      promiseList.push(this.bucketStore.fetchArchiveStorageInfo(storageInfoOptions))
    }

    if (globalConfig.objectStorage.storageType.lowFrequency.enable) {
      promiseList.push(this.bucketStore.fetchLineStorageInfo(storageInfoOptions))
    }

    if (globalConfig.objectStorage.storageType.deepArchive.enable) {
      promiseList.push(this.bucketStore.fetchDeepArchiveStorageInfo(storageInfoOptions))
    }

    return Promise.all(promiseList)
  }

  componentDidMount() {
    const { bucketName } = this.props
    this.fetchBucketStorageInfo(bucketName)

    this.disposable.addDisposer(
      reaction(
        () => this.routerStore.location && this.routerStore.location.pathname,
        _ => {
          const v1Path = `${getDetailRootPath(this.props.inject)}/${BucketPage.Resource}`
          const v2Path = `${getDetailRootPath(this.props.inject)}/${BucketPage.ResourceV2}`
          if (this.routerStore.matchPath({ path: v1Path })) {
            this.updateCurResourceVersion('v1')
          } else if (this.routerStore.matchPath({ path: v2Path })) {
            this.updateCurResourceVersion('v2')
          }
        },
        {
          fireImmediately: true
        }
      )
    )

    // TODO: 这种东西抽到外面统一处理
    // 空间详情里也需要加 IAM actions 请求，以防止在空间详情页面原地刷新后获取不到 IAM 权限的情况
    if (this.iamStore.isIamUser) {
      this.iamStore.fetchIamActionsByResource(bucketName)
    }
  }

  componentWillUnmount() {
    this.disposable.dispose()
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
  get globalConfig() {
    return this.configStore.getFull()
  }

  @computed
  get bucketDetails() {
    const { bucketName } = this.props
    return this.bucketStore.getDetailsByName(bucketName)
  }

  @computed
  get bucketStorageInfo() {
    const { bucketName } = this.props
    return this.bucketStore.getStorageInfoByName(bucketName) || {}
  }

  @computed
  get isSharedBucket() {
    return this.bucketStore.isShared(this.props.bucketName)
  }

  @computed
  get bucketNameView() {
    return (
      <div className={styles.bucketName}>
        <span className={styles.block} />
        {this.props.bucketName}
      </div>
    )
  }

  // 处理 tab 切换
  @autobind
  getTabRoute(page: BucketPage) {
    const { bucketName } = this.props
    return getDetailsPath(
      this.props.inject,
      { page, bucketName }
    )
  }

  @autobind
  @Toaster.handle('删除成功')
  deleteBucket() {
    // 删除 bucket
    return this.bucketStore.delete(this.props.bucketName).then(
      // 跳回列表页
      () => this.routerStore.push(getListPath(this.props.inject))
    )
  }

  bindTabPanel(page: BucketPage, disabled?: boolean) {
    return {
      key: page,
      disabled,
      tab: (
        <Link to={this.getTabRoute(page)} className={styles.tabLink} disabled={!!disabled}>
          {bucketPageNameMap[page]}
        </Link>
      )
    }
  }

  @action.bound
  switchResourceVersion() {
    const [page, version] = this.curResourceVersion === 'v1'
      ? [BucketPage.ResourceV2, 'v2'] as const
      : [BucketPage.Resource, 'v1'] as const
    this.routerStore.push(this.getTabRoute(page))
    this.updateCurResourceVersion(version)
  }

  // 功能状态的封装，功能的状态分两个层面
  // 1、功能本身被关闭，对应功能模块不显示（ConfigStore、Feature）称为 Visible
  // 2、业务条件导致的禁用，对应功能模块显示禁用的状态（isIamUser、isShared）称为 !Enabled

  // 概览是否可见
  @computed
  get isOverviewVisible(): boolean {
    // IAM 权限控制、如果不是 IAM 会固定返回 true
    if (this.iamStore.isActionDeny({
      actionName: 'Statistics',
      resource: this.props.bucketName
    })) {
      return false
    }

    return true
  }

  @computed
  get isOverviewEnabled(): boolean {
    return !this.isSharedBucket
  }

  // 老版资源管理是否可见
  @computed
  get isResourceVisible(): boolean {
    return this.isResourceEnabled && this.curResourceVersion === 'v1'
  }

  // 新版资源管理是否可见
  @computed
  get isResourceV2Visible(): boolean {
    return this.curResourceVersion === 'v2'
  }

  // 旧版资源管理是否启用
  @computed
  get isResourceEnabled(): boolean {
    return this.configStore.getFull().objectStorage.resourceManage.enable
  }

  @computed
  get isResourceSwitchVisible(): boolean {
    return !this.featureStore.isDisabled('KODO.KODO_RESOURCE_MANAGE_SWITCH') && this.isResourceEnabled
  }

  // 域名是否可见
  @computed
  get isDomainVisible(): boolean {
    if (this.bucketDetails == null) {
      return false
    }

    if (!isDomainAvailable(this.props.inject, this.bucketDetails.region)) {
      return false
    }

    return true
  }

  @computed
  get isDomainEnabled(): boolean {
    return !this.isSharedBucket
  }

  @computed
  get isImageStyleVisible(): boolean {
    if (!this.regionConfig || !this.regionConfig.dora.image.enable) {
      return false
    }

    // 检查 feature
    if (this.featureStore.isDisabled('KODO.KODO_IMAGE_PROCESS')) {
      return false
    }

    return true
  }

  @computed
  get isImageStyleEnabled(): boolean {
    // 检查 iam 权限
    if (
      this.iamStore.isActionDeny({ actionName: 'GetBucketStyle', resource: this.props.bucketName })
      && this.iamStore.isActionDeny({ actionName: 'SetSeparator', resource: this.props.bucketName })
      && this.iamStore.isActionDeny({ actionName: 'PutImageStyle', resource: this.props.bucketName })
      && this.iamStore.isActionDeny({ actionName: 'DeleteImageStyle', resource: this.props.bucketName })
    ) return false

    return !this.isSharedBucket
  }

  // 多媒体样式是否启用
  @computed
  get isMediaStyleVisible(): boolean {
    if (!this.regionConfig || !this.regionConfig.dora.mediaStyle.enable) {
      return false
    }

    // 检查 feature
    if (this.featureStore.isDisabled('KODO.KODO_MEDIA_STYLE')) {
      return false
    }

    return true
  }

  @computed
  get isMediaStyleEnabled(): boolean {
    // 检查 iam 权限
    if (
      this.iamStore.isActionDeny({ actionName: 'GetBucketStyle', resource: this.props.bucketName })
      && this.iamStore.isActionDeny({ actionName: 'SetSeparator', resource: this.props.bucketName })
      && this.iamStore.isActionDeny({ actionName: 'PutImageStyle', resource: this.props.bucketName })
      && this.iamStore.isActionDeny({ actionName: 'DeleteImageStyle', resource: this.props.bucketName })
    ) return false

    return !this.isSharedBucket
  }

  // 转码是否可见
  @computed
  get isTranscodeStyleVisible(): boolean {
    if (!this.regionConfig || !this.regionConfig.dora.transcode.enable) {
      return false
    }

    if (this.iamStore.isIamUser) {
      return false
    }

    return true
  }

  @computed
  get isTranscodeStyleEnabled(): boolean {
    return !this.isSharedBucket
  }

  // 设置是否可见
  @computed
  get isSettingVisible(): boolean {
    return !this.featureStore.isDisabled('KODO.KODO_BUCKET_SETTING')
  }

  @computed
  get isSettingEnabled(): boolean {
    return !this.isSharedBucket
  }

  @computed
  get routesView() {
    return (
      <Switch>
        <Route relative title="空间概览" path={BucketPage.Overview}>
          {
            this.isOverviewVisible && this.isOverviewEnabled
              ? <Overview {...this.props} />
              : <NoPermission />
          }
        </Route>
        <Route relative title="文件管理" path={BucketPage.Resource}>
          {
            this.isResourceVisible && this.isResourceEnabled
              ? <ResourceManage {...this.props} />
              : <NoPermission />
          }
        </Route>
        <Route
          relative
          title="文件管理"
          path={BucketPage.ResourceV2}
          component={({ query }) => (
            <ObjectManage
              {...this.props}
              isUploadModalOpen={getBooleanQuery(getFirstQuery(query.isUploadModalOpen))}
            />
          )}
        />
        <Route relative title="域名管理" path={BucketPage.Domain}>
          {
            this.isDomainVisible && this.isDomainEnabled
              ? <Domain {...this.props} />
              : <NoPermission />
          }
        </Route>
        <Route relative title="图片样式" path={BucketPage.ImageStyle}>
          {
            this.isImageStyleVisible && this.isImageStyleEnabled
              ? <ImageStyle {...this.props} />
              : <NoPermission />
          }
        </Route>
        <Route relative title="多媒体样式" path={BucketPage.MediaStyle}>
          {
            this.isMediaStyleVisible && this.isMediaStyleEnabled
              ? <MediaStyleManager {...this.props} />
              : <NoPermission />
          }
        </Route>
        <Route
          relative
          title="转码样式"
          path={BucketPage.TranscodeStyle}
          component={({ query: { isCreateDrawerOpen } }) => (
            this.isTranscodeStyleVisible && this.isTranscodeStyleEnabled
              ? (
                <TranscodeStyle {...this.props}
                  isCreateDrawerOpen={
                    getBooleanQuery(getFirstQuery(isCreateDrawerOpen))
                  } />
              )
              : <NoPermission />
          )}
        />
        <Route relative title="空间设置" path={BucketPage.Setting}>
          {/* TODO: 刚进来有个大大的 “没有权限” … */}
          {
            this.isSettingVisible && this.isSettingEnabled
              ? <Setting {...this.props} />
              : <NoPermission />
          }
        </Route>
        <Route relative path="*">
          <NotFoundRedirect />
        </Route>
      </Switch>
    )
  }

  @computed
  get tabPanesView() {
    // 发现原先的写法当有多个 tab 被隐藏时，因为 tab 组件会检查子组件，导致控制台报错，界面显示也不正确，这里提取下并过滤掉不显示的
    // TODO: Role 组件需支持 Tabs.TabPane 的正常工作
    return (
      [
        this.isOverviewVisible && (
          <Tabs.TabPane {...this.bindTabPanel(BucketPage.Overview, !this.isOverviewEnabled)} />
        ),

        this.isResourceVisible && (
          <Tabs.TabPane
            {...this.bindTabPanel(BucketPage.Resource)}
          />
        ),

        this.isResourceV2Visible && (
          <Tabs.TabPane
            {...this.bindTabPanel(BucketPage.ResourceV2)}
          />
        ),

        this.isDomainVisible && (
          <Tabs.TabPane {...this.bindTabPanel(BucketPage.Domain, !this.isDomainEnabled)} />
        ),

        this.isMediaStyleVisible && (
          <Tabs.TabPane {...this.bindTabPanel(BucketPage.MediaStyle, !this.isMediaStyleEnabled)} />
        ),

        this.isImageStyleVisible && (
          <Tabs.TabPane {...this.bindTabPanel(BucketPage.ImageStyle, !this.isImageStyleEnabled)} />
        ),

        this.isTranscodeStyleVisible && (
          <Tabs.TabPane {...this.bindTabPanel(BucketPage.TranscodeStyle, !this.isTranscodeStyleEnabled)} />
        ),

        this.isSettingVisible && (
          <Tabs.TabPane {...this.bindTabPanel(BucketPage.Setting, !this.isSettingEnabled)} />
        )
      ]
    ).filter(Boolean)
  }

  resourceVersionSwitchRender(page: string) {
    if (page !== BucketPage.Resource && page !== BucketPage.ResourceV2) {
      return
    }

    if (this.isResourceSwitchVisible) {
      return (
        <div
          className={styles.switch}
          onClick={this.switchResourceVersion}
          {...sensorsTagFlag('resource-manage', this.curResourceVersion === 'v1' ? 'switch-to-new' : 'switch-to-old')}
        >
          <SwapIcon />
          <span className={styles.switchTxt}>{this.curResourceVersion === 'v1' ? '体验新版' : '返回旧版'}</span>
        </div>
      )
    }
  }

  render() {
    return (
      <div className={styles.content}>
        <MediaStyleDrawer
          {...this.mediaStyleStore}
          bucketName={this.props.bucketName}
          region={this.bucketDetails?.region ?? ''}
          onClose={this.mediaStyleStore.handleClose}
        />
        <div className={styles.topBar}>
          {this.bucketNameView}
          <BucketInfo bucketName={this.props.bucketName} />
        </div>
        <Route
          relative
          path="/:page"
          // TODO: 标注 page 的类型的方法
          component={({ match }) => {
            const page = match!.params.page
            return (
              <Role name={BucketDetailPageRole.TabNav}>
                <Tabs
                  activeKey={page}
                  className={styles.tabs}
                  tabBarExtraContent={this.resourceVersionSwitchRender(page)}
                >
                  {this.tabPanesView}
                </Tabs>
              </Role>
            )
          }} />
        {this.routesView}
      </div>
    )
  }
}

export default function Details(props: IProps) {
  return (
    <MagicVarsProvider vars={{ bucketName: props.bucketName }}>
      <MediaStyleDrawerProvider>
        <Inject render={({ inject }) => (
          <InternalDetails {...props} inject={inject} />
        )} />
      </MediaStyleDrawerProvider>
    </MagicVarsProvider>
  )
}
