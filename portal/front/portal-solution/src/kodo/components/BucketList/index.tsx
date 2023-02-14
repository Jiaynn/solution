/**
 * @file bucket component
 * @description bucket 管理
 * @author yinxulai <me@yinxulai.com>
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { action, computed, observable, reaction, runInAction, when, makeObservable } from 'mobx'
import { Button, Modal, Tabs } from 'react-icecream/lib'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { RouterStore } from 'portal-base/common/router'
import Role from 'portal-base/common/components/Role'
import Disposable from 'qn-fe-core/disposable'
import { InjectFunc, Inject } from 'qn-fe-core/di'

import { BucketRole } from 'kodo/constants/role'
import { regionAll, RegionSymbolWithAll } from 'kodo/constants/region'
import { bucketListGuideName, bucketListGuideSteps } from 'kodo/constants/guide'

import { IBucketListItem } from 'kodo/apis/bucket/list'
import Prompt from 'kodo/components/common/Prompt'
import GuideGroup from 'kodo/components/common/Guide'
import HelpDocLink from 'kodo/components/common/HelpDocLink'
import { Description } from 'kodo/components/common/Description'

import { IListOptions, SearchType } from 'kodo/routes/bucket'
import { BucketListStore } from 'kodo/stores/bucket/list'
import { ConfigStore } from 'kodo/stores/config'
import { KodoIamStore } from 'kodo/stores/iam'
import { tagToString } from 'kodo/transforms/bucket/setting/tag'
import { isDomainAvailable } from 'kodo/transforms/domain'
import { debounce, updateQueryString } from 'kodo/utils/route'
import { validateURL } from 'kodo/utils/url'

import RetrieveDomainModal from '../common/RetrieveDomain'

import SearchForm, { createSearchFormState, SearchFormFields, SearchFormState } from './SearchForm'
import CreateBucketDrawer from './CreateBucketDrawer'
import List from './List'

import styles from './style.m.less'

const TabPane = Tabs.TabPane

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalBucketList extends React.Component<IListOptions & DiDeps> {
  static defaultProps = {
    searchTag: null,
    searchName: null, // 搜索条件
    searchType: 'name',
    region: regionAll.symbol, // 地区
    isShowCreateBucket: false, // 默认不显示
    retrieveDomain: null
  }

  disposable = new Disposable()

  @observable lastCreatedBucketName: string // 最新创建的空间

  @observable testDomainInfoModalVisible = false // 测试域名提示

  @observable.ref searchFormState: SearchFormState

  iamStore = this.props.inject(KodoIamStore)
  userInfoStore = this.props.inject(UserInfo)
  routerStore = this.props.inject(RouterStore)
  configStore = this.props.inject(ConfigStore)
  bucketListStore = this.props.inject(BucketListStore)
  featureConfig = this.props.inject(FeatureConfigStore)

  constructor(props: IListOptions & DiDeps) {
    super(props)

    makeObservable(this)
    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  @computed
  get tabRegions() {
    return [
      regionAll,
      ...this.configStore.getRegion({ allRegion: true })
    ]
  }

  @computed
  get isRetrieveDomainModalVisible() {
    const { retrieveDomain } = this.props

    /* 未输入域名。不弹窗 */
    if (!retrieveDomain) { return false }

    /* 参数包含协议头，不弹窗 */
    if (/^https?:\/\//i.test(retrieveDomain)) { return false }

    /* validateURL 返回 ValidationResponse，所以这里逻辑相反，即返回 null | undefined | false 时表示通过校验 */
    return !validateURL(retrieveDomain, {
      allowPort: false, // 这里找回域名未指定具体空间，所以无法获取配置，直接禁止端口
      allowHash: false,
      allowSearch: false,
      ignoreProtocol: true
    })
  }

  @computed
  get validRegion() {
    const { region } = this.props
    return region !== regionAll.symbol ? region : null
  }

  @computed
  get globalConfig() {
    return this.configStore.getFull()
  }

  @computed
  get isTableDataLoading() {
    return this.bucketListStore.isLoading()
  }

  @computed
  get isCreateButtonEnable() {
    if (this.userInfoStore.isBufferedUser) {
      return false
    }

    return !this.iamStore.isActionDeny({ actionName: 'Mkbucket' })
  }

  @computed
  get isCreateButtonVisible() {
    return !this.featureConfig.isDisabled('KODO.KODO_CREATE')
  }

  // 是否允许绑定域名
  @computed
  get isCreatedBucketDomainEnable() {
    if (this.lastCreatedBucketName == null) {
      return false
    }

    const bucketInfo = this.bucketListStore.getByName(
      this.lastCreatedBucketName
    )

    if (bucketInfo == null) {
      return false
    }

    return isDomainAvailable(
      this.props.inject,
      bucketInfo.region
    )
  }

  @autobind
  updateRouteQuery(params: IListOptions, isReplace = false) {
    updateQueryString(this.routerStore, params, isReplace)
  }

  /* 稳住！别抖 定义了就尽量都用这个 不然可能有冲突 */
  asyncUpdateRouteQuery = debounce(
    (params: IListOptions) => {
      this.updateRouteQuery(
        // 通过替换为 null、去除 query 上的冗余字段
        Object.assign({}, ...Object.keys(params).map(key => ({ [key]: params[key] || null })))
      )
    }
  )

  @autobind
  updateShouldCreateBucket(visible: boolean) {
    this.updateRouteQuery({
      shouldCreateBucket: visible || undefined
    })
  }

  @action.bound
  updateLastCreatedBucketName(bucketName: string) {
    this.lastCreatedBucketName = bucketName
  }

  @action.bound
  updateSearchFormState(formState: SearchFormState) {
    this.searchFormState = formState
  }

  @action.bound
  openTestDomainInfoModal(bucketName: string) {
    this.updateLastCreatedBucketName(bucketName)
    this.testDomainInfoModalVisible = true
  }

  @action.bound
  closeTestDomainInfoModal() {
    this.testDomainInfoModalVisible = false
  }

  @autobind
  handleSearchBucketSelected(name: string) {
    /* 当用户选中一个空间时帮用户切换到该空间所在区域的对应的区域标签 */
    const { region: currentRegion } = this.props
    const bucketInfo = this.bucketListStore.getByName(name)
    if (bucketInfo == null) return

    if (bucketInfo.region !== currentRegion && currentRegion !== regionAll.symbol) {
      this.updateRouteQuery({ region: bucketInfo.region })
    }
  }

  /**
   * 处理搜索结果均为同一区域的情况
   */
  @autobind
  @Toaster.handle()
  async handleSearchBucketHasSameRegion(searchType: SearchType, name?: string | null, tag?: string) {
    let sameRegion = ''
    let hasSameRegion = true
    let matchBucketList: IBucketListItem[] = []

    if (this.props.region !== regionAll.symbol) {
      // 只在全部 tab 下进行该操作
      return
    }

    if (searchType === 'name' && name) {
      matchBucketList = this.bucketListStore.list.filter(bucket => bucket.tbl.includes(name))
    }

    if (searchType === 'tag' && tag) {
      // 重新获取 NameList 防止刚创建 tag 时找不到
      await this.bucketListStore.fetchNameListByTag(tag)

      const matchTagBucketNames = this.bucketListStore.getNameListByTagKey(tag)

      if (matchTagBucketNames && matchTagBucketNames.size) {
        matchBucketList = this.bucketListStore.list.filter(bucket => matchTagBucketNames.has(bucket.tbl))
      }
    }

    for (const bucket of matchBucketList) {
      if (sameRegion === '') {
        sameRegion = bucket.region
      } else {
        hasSameRegion = hasSameRegion && (sameRegion === bucket.region)
      }
    }

    if (hasSameRegion && sameRegion !== '') {
      return sameRegion
    }
  }

  @autobind
  async handleSearchFormValueChange({ searchType, searchName, searchTagKey, searchTagVal }: SearchFormFields) {
    const { hasError } = await this.searchFormState.validate()

    if (!hasError) {
      const searchTag = tagToString({ Key: searchTagKey, Value: searchTagVal }) || undefined
      const sameRegion = await this.handleSearchBucketHasSameRegion(searchType, searchName, searchTag)

      this.asyncUpdateRouteQuery({
        region: sameRegion || this.props.region,
        searchTag,
        searchType,
        searchName: searchName || undefined
      })
    }
  }

  // 处理 tab 的切换与路由的绑定
  @autobind
  handleTabChange(region: RegionSymbolWithAll) {
    this.updateRouteQuery({ region })
  }

  @action.bound
  handleCreateBucketDrawerClose(newBucketName?: string, newBucketRegion?: string) {
    if (this.props.redirectAfterCreate) {
      // 为了提醒 kodo 站点错误使用
      // 以下代码是为了给开发者提供警告信息，禁止站内使用 `redirectAfterCreate`
      // 站内不支持，当前会刷新页面
      const rootPath = this.globalConfig.site.rootPath
      if (this.props.redirectAfterCreate.indexOf(rootPath) === 0) {
        throw new Error('非法的 redirectAfterCreate 使用姿势')
      }

      window.location.href = this.props.redirectAfterCreate
      return
    }

    if (newBucketName) {
      // FIXME: 这里之前改动有问题，导致现在创建完自动定位空间有问题
      runInAction(() => {
        this.searchFormState.$.searchType.set('name')
        this.searchFormState.$.searchName.set(newBucketName)
      })

      // 当启用自动生成测试域名时显示测试域名提示信息
      if (this.globalConfig.fusion.domain.autoGenerateTestDomain.enable) {
        this.openTestDomainInfoModal(newBucketName)
      }
      // 创建后 Tab 跳转到对应区域下
      if (newBucketRegion) {
        this.handleTabChange(newBucketRegion)
      }
    }

    this.updateShouldCreateBucket(false)
  }

  @computed
  get descriptionView() {
    if (!this.globalConfig.objectStorage.bucketList.description) {
      return null
    }

    return (
      <Prompt type="assist" className={styles.slaPrompt}>
        <Description dangerouslyText={
          this.globalConfig.objectStorage.bucketList.description
        } />
      </Prompt>
    )
  }

  // 创建按钮
  @computed
  get createButtonView() {
    return (
      <Role name={BucketRole.CreateBucketEntry}>
        <Button
          type="primary"
          icon="plus"
          className={styles.button}
          disabled={!this.isCreateButtonEnable}
          onClick={() => this.updateShouldCreateBucket(true)}
        >
          新建空间
        </Button>
      </Role>
    )
  }

  // 刷新按钮
  @computed
  get refreshButtonView() {
    return (
      <Button
        icon="reload"
        className={styles.button}
        loading={this.isTableDataLoading}
        onClick={() => this.bucketListStore.fetchList()}
      >
        刷新列表
      </Button>
    )
  }

  @computed
  get createBucketDrawerView() {
    const { shouldCreateBucket, privateType } = this.props
    return (
      <CreateBucketDrawer
        visible={!!shouldCreateBucket}
        data={{ region: this.validRegion!, privateType }}
        onClose={this.handleCreateBucketDrawerClose}
      />
    )
  }

  @computed
  get testDomainInfoModalView() {
    const modalOptions = {
      width: 520,
      title: '空间创建成功',
      visible: this.testDomainInfoModalVisible,

      ...(
        {
          okText: '好的，我知道了',
          onOk: this.closeTestDomainInfoModal,
          cancelButtonProps: { className: styles.hiddenButton }
        }
      )
    }

    return (
      <Modal {...modalOptions}>
        <section className={styles.testDomainInfoModal}>
          <p>
            系统已自动为空间配备测试域名，有效期 30天，仅限用于业务对接测试，不可用于正式生产环境，请绑定自定义域名为生产域名！
          </p>
          <ol>
            <li>
              测试域名每个自然日访问总流量限额
              <span className={styles.warnText}>&ensp;10GB，</span>
              自创建起
              <span className={styles.warnText}>&ensp;30&ensp;个自然日后自动回收。</span>
            </li>
            <li>
              测试域名不得作为生产域名，使用期间不在 SLA 保障范围内。
            </li>
            <li>
              不得使用测试域名存储、发布、传播违法违规内容，禁止下载应用程序(apk、ipa、exe、dmg 等)。
              当测试域名下有非法资源时，该域名将被直接冻结并不予解封。
            </li>
          </ol>
          <p>
            <HelpDocLink doc="testDomain" className={styles.link}>查阅测试域名使用规范</HelpDocLink>
          </p>
        </section>
      </Modal>
    )
  }

  componentDidMount() {
    const state = createSearchFormState(this.props)
    this.disposable.addDisposer(state.dispose)
    this.updateSearchFormState(state)

    this.disposable.addDisposer(reaction(
      () => this.searchFormState.value,
      this.handleSearchFormValueChange
    ))

    this.disposable.addDisposer(
      when(
        () => !this.isRetrieveDomainModalVisible,
        () => this.updateRouteQuery({ retrieveDomain: undefined }, true)
      )
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    return (
      <div className={styles.content}>
        {this.descriptionView}
        <GuideGroup name={bucketListGuideName} steps={bucketListGuideSteps}>
          <div className={styles.toolbar}>
            <div className={styles.left}>
              {
                this.isCreateButtonVisible && (
                  <>
                    {this.createButtonView}
                    {this.testDomainInfoModalView}
                    {this.createBucketDrawerView}
                  </>
                )
              }
              {this.refreshButtonView}
            </div>
            <SearchForm
              formState={this.searchFormState}
              dataSource={this.bucketListStore.nameList}
            />
          </div>
          <Tabs
            className={styles.tabs}
            activeKey={this.props.region}
            onChange={this.handleTabChange}
          >
            {this.tabRegions.filter(i => !i.invisible).map(region => (
              <TabPane
                tab={region.name}
                key={region.symbol}
                className={styles.tabPane}
              >
                <List
                  {...this.props}
                  region={region.symbol}
                  loading={this.isTableDataLoading}
                />
              </TabPane>
            ))}
          </Tabs>
        </GuideGroup>
        <RetrieveDomainModal
          domain={this.props.retrieveDomain!}
          visible={this.isRetrieveDomainModalVisible}
          onCancel={() => this.updateRouteQuery({ retrieveDomain: undefined }, true)}
        />
      </div>
    )
  }
}

export default function BucketList(props: IListOptions) {
  return (
    <Inject render={({ inject }) => (
      <InternalBucketList {...props} inject={inject} />
    )} />
  )
}
