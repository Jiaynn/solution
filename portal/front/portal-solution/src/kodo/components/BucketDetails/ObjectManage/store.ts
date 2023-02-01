/**
 * @description local store of object manage
 * @author zhangheng01 <zhangheng01@qiniu.com>
 * @author duli <duli@qiniu.com>
 */

import { action, computed, observable, runInAction, when, makeObservable, reaction } from 'mobx'
import autobind from 'autobind-decorator'
import Store from 'qn-fe-core/store'
import { injectable, InjectFunc } from 'qn-fe-core/di'
import { injectProps } from 'qn-fe-core/local-store'

import { Loadings } from 'portal-base/common/loading'
import { ToasterStore } from 'portal-base/common/toaster'
import { UserInfoStore } from 'portal-base/user/account'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { ObjectManagerProps } from 'kodo-base/lib/components/ObjectManager/types'
import { ExternalUrlModalStore } from 'kodo-base/lib/components/common/ExternalUrlModal/store'
import { FileStatus, StorageType } from 'kodo-base/lib/constants'

import { getResourceProxyUrl, IEncodedEntryURIOptions } from 'kodo/transforms/bucket/resource'

import { KodoIamStore } from 'kodo/stores/iam'

import { ConfigStore } from 'kodo/stores/config'

import { DomainStore, IDomainInfo } from 'kodo/stores/domain'

import { BucketStore, Loading as BucketStoreLoading } from 'kodo/stores/bucket'

import { ProtectedMode } from 'kodo/constants/bucket/setting/original-protected'
import { ShareType } from 'kodo/constants/bucket/setting/authorization'
import { separatorTextMap } from 'kodo/constants/image-style'

import { ResourceApis, IMeta, IFileBase } from 'kodo/apis/bucket/resource'
import { ImageStyleApis, MediaStyle } from 'kodo/apis/bucket/image-style'

import { getSourceFormat, getCommandsWithoutSourceFormat } from '../MediaStyle/CreateStyle/common/command'
import { allowPickAccept as imageAllowPickAccept } from '../MediaStyle/CreateStyle/image/constants'
import { allowPickAccept as videoCoverAllowPickAccept } from '../MediaStyle/CreateStyle/video/utils'
import { allowPickAccept as waterMarkAllowPickAccept } from '../MediaStyle/CreateStyle/video/Watermark/constants'
import { allowPickAccept as transcodeAllowPickAccept } from '../MediaStyle/CreateStyle/video/Transcode/constants'

export enum LoadingId {
  Refresh = 'refresh',
  List = 'List',
  Domain = 'domain'
}

@injectable()
export default class StateStore extends Store {
  constructor(
    private userInfoStore: UserInfoStore,
    private resourceApis: ResourceApis,
    private bucketStore: BucketStore,
    private configStore: ConfigStore,
    private featureStore: FeatureConfigStore,
    private domainStore: DomainStore,
    private toasterStore: ToasterStore,
    private iamStore: KodoIamStore,
    private imageStyleApis: ImageStyleApis,
    private externalUrlModalStore: ExternalUrlModalStore,
    @injectProps() private props: {
      bucketName: string,
      inject: InjectFunc
    }
  ) {
    super()
    makeObservable(this)
    this.currentBucket = props.bucketName
    ToasterStore.bindTo(this, this.toasterStore)
  }

  @observable.ref hasSensitive = false
  @observable.ref hasInitDomain = false
  @observable.ref selectedDomainInfo: IDomainInfo
  @observable.ref currentBucket: string
  mediaStyleList: MediaStyle[] | undefined

  // 是否保存默认域名失败
  @observable.ref saveDefaultDomainFailed = false

  loadings = Loadings.collectFrom(this, LoadingId)

  @action.bound
  updateHasSensitive(sensitive: boolean) {
    this.hasSensitive = sensitive
  }

  @autobind
  updateMediaStyleList(list: MediaStyle[]) {
    this.mediaStyleList = list
  }

  @computed
  get isFetchingBucketInfo() {
    return this.bucketStore.isLoading(BucketStoreLoading.Details)
  }

  // 关于以下这种写法，是因为没有值不代表就是 false，如果界面强依赖该值的时候，应该先判断该值再去做下一步处理
  // 但是当界面弱依赖，或者只是部分接口依赖的时候，怎么处理是个难题，因为拿不到值导致的界面报错或者因为拿不到值
  // 导致无法发请求都是有问题的，不过我个人感觉界面报错可能更能接受，因为如果不去做下一步操作可能会导致整个应用不可预知的状态发生，
  // 比如本来一个显示应该报错处理，但是却显示了其他值，这可能会导致用户认为这本就是这样，这样是有风险的
  @computed
  get isPrivateBucket() {
    return this.bucketInfo ? !!this.bucketInfo.private : false
  }

  @computed
  get isReadonlyShareBucket() {
    return this.bucketInfo ? ShareType.ReadOnly === this.bucketInfo.perm : true
  }

  @computed
  get isShareBucket() {
    return this.bucketStore.isShared(this.props.bucketName)
  }

  @computed
  get bucketVersioning() {
    return this.bucketInfo ? this.bucketInfo.versioning : false
  }

  @computed
  get bucketProtected() {
    return this.bucketInfo ? this.bucketInfo.protected === ProtectedMode.Enable : false
  }

  @computed
  get bucketInfo() {
    return this.bucketStore.getDetailsByName(this.currentBucket)
  }

  @computed
  get regionConfig() {
    if (this.bucketInfo == null) {
      return null
    }

    return this.configStore.getRegion({ region: this.bucketInfo.region })
  }

  @computed
  get baseUrl() {
    if (!this.hasInitDomain) return null

    const baseUrl = this.domainStore.getResourceBaseUrl(
      this.currentBucket,
      this.selectedDomainInfo
    )

    return baseUrl
  }

  @computed
  get shouldShowCopyLinkMenu() {
    return !this.iamStore.isActionDeny({ actionName: 'Stat', resource: this.currentBucket })
      && !this.iamStore.isActionDeny({ actionName: 'Get', resource: this.currentBucket })
      && this.bucketInfo != null // 初始化过
      && (this.isPrivateBucket || !this.bucketInfo.protected) // 公开空间且原图保护不显示
      && this.baseUrl // 有可用域名、或者 getfile 开启
  }

  @computed
  private get shouldShowDownloadMenu() {
    return !this.iamStore.isActionDeny({ actionName: 'Get', resource: this.currentBucket }) && this.baseUrl
  }

  @action.bound
  updateSelectedDomainData(domainInfo: IDomainInfo) {
    this.selectedDomainInfo = domainInfo
    this.externalUrlModalStore.updateDomain(
      this.domainStore.getResourceBaseUrl(this.props.bucketName, domainInfo)!
    )
  }

  @computed
  get singleDownloadConfig(): ObjectManagerProps['downloadObject'] {
    if (!this.shouldShowDownloadMenu || !this.baseUrl) {
      return { availability: 'Invisible' }
    }
    return { availability: 'Normal', modifyBeforeDownload: this.urlModifyBeforeDownload }
  }

  @computed
  get batchDownloadConfig(): ObjectManagerProps['batchDownloadObject'] {
    if (!this.shouldShowDownloadMenu || !this.baseUrl) {
      return { availability: 'Invisible' }
    }

    const docUrl = this.configStore.getFull().documentUrls
      && this.configStore.getFull().documentUrls.batchDownload || undefined

    return { availability: 'Normal', docUrl, modifyBeforeDownload: this.urlModifyBeforeDownload }
  }

  get copyPublicUrlConfig(): ObjectManagerProps['copyObjectPublicUrl'] {
    if (!this.shouldShowCopyLinkMenu) {
      return { availability: 'Invisible' }
    }

    return {
      availability: 'Normal',
      isPrivateBucket: this.isPrivateBucket
    }
  }

  @computed
  get batchExportObjectPublicUrl(): ObjectManagerProps['batchExportObjectPublicUrl'] {
    if (!this.shouldShowCopyLinkMenu) {
      return { availability: 'Invisible' }
    }

    return {
      availability: 'Normal',
      isPrivateBucket: this.isPrivateBucket
    }
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

    // 检查 iam 权限
    if (this.iamStore.isActionDeny({ actionName: 'GetBucketStyle', resource: this.props.bucketName })) {
      return false
    }

    return true
  }

  @computed
  get isMediaStyleVideoVisible(): boolean {
    if (!this.isMediaStyleVisible) return false
    if (!this.regionConfig || !this.regionConfig.dora.mediaStyle.video.enable) return false
    if (this.featureStore.isDisabled('KODO.KODO_MEDIA_STYLE_VIDEO')) return false

    return true
  }

  @computed
  get mediaStyleConfig() {
    if (!this.isMediaStyleVisible || this.isShareBucket) {
      return
    }

    const accepts = [
      imageAllowPickAccept
    ]

    // 检查视频的 feature
    if (this.isMediaStyleVideoVisible) {
      accepts.push(
        videoCoverAllowPickAccept,
        transcodeAllowPickAccept,
        waterMarkAllowPickAccept
      )
    }

    return {
      getList: this.getMediaStyleList,
      separatorList: Array.from(this.bucketInfo?.separator || '').map(sep => ({ value: sep, label: separatorTextMap[sep] })),
      check: (fileInfo: Pick<IFileBase, 'status' | 'mimeType' | 'fsize'> & { type: StorageType }) => {
        if (
          fileInfo.status === FileStatus.Disabled
          || fileInfo.type === StorageType.Archive
          || fileInfo.type === StorageType.DeepArchive
        ) return false

        return accepts.some(accept => (
          accept.mimeTypes.includes(fileInfo.mimeType) && fileInfo.fsize <= accept.maxSize
        ))
      }
    }
  }

  @computed
  get objectDetailConfig() {
    const docUrl = this.configStore.getFull().documentUrls

    return {
      availability: 'Normal',
      documentUrls: this.configStore.getFull().documentUrls,
      updateMetadata: (key: IEncodedEntryURIOptions, qMeta: IMeta[]) => (
        this.toasterStore.promise(
          this.resourceApis.updateFileMeta(this.currentBucket, key, qMeta)
        )
      ),
      mediaStyle: this.mediaStyleConfig,
      isPrivateBucket: this.isPrivateBucket,
      isReadonlyShareBucket: this.isReadonlyShareBucket,
      bucketVersioning: this.bucketVersioning,
      bucketProtected: {
        enable: this.bucketProtected,
        name: this.isMediaStyleVisible ? '原始资源保护' : '原图保护',
        helpDocUrl: (this.isMediaStyleVisible ? docUrl.originalResourceProtection : docUrl.originalProtection) || ''
      },
      previewDisabled: this.iamStore.isActionDeny({ actionName: 'Get', resource: this.currentBucket })
        || this.iamStore.isActionDeny({ actionName: 'Stat', resource: this.currentBucket }),
      metaDataEditDisabled: this.iamStore.isIamUser,
      deleteFileAfterHours: this.regionConfig && this.regionConfig.objectStorage.fileLifeCycle.deleteAfterHours.enable,
      getSignedDownloadUrls: this.resourceApis.getSignedDownloadUrls,
      getResourceProxyUrl: this.getResourceProxyUrl
    } as const
  }

  @autobind
  async getMediaStyleList(mimeType: string, extension: string) {
    let list = this.mediaStyleList
    if (!list) {
      list = await this.imageStyleApis.getImageStyles(this.props.bucketName)
      this.mediaStyleList = list
    }
    const isVideo = mimeType.startsWith('video/')
    return list.filter(item => {
      const sourceFormat = getSourceFormat(item.commands)
      const commands = getCommandsWithoutSourceFormat(item.commands)
      return isVideo === /^(vframe|avthumb|avhls)/.test(commands)
        && (sourceFormat == null || sourceFormat === extension) // $0.xxx 跟文件后缀一致/不包含 $0
    })
  }

  @autobind
  getResourceProxyUrl(url: string) {
    if (!url) { return '' }

    if (!this.bucketInfo) { return '' }

    return getResourceProxyUrl(this.configStore, url, this.bucketInfo.region)
  }

  @autobind
  @ToasterStore.handle()
  fetchObjectDetail(options: { fullPath: string, version?: string }) {
    const { fullPath, version } = options
    return this.resourceApis.getFileState(this.currentBucket, { key: fullPath, version }, this.baseUrl || undefined)
  }

  @autobind
  urlModifyBeforeDownload(url?: string) {
    if (!url || !this.bucketInfo) { return undefined }
    return getResourceProxyUrl(
      this.configStore,
      url,
      this.bucketInfo.region
    )
  }

  @autobind
  @ToasterStore.handle()
  fetchBucketInfo() {
    return this.bucketStore.fetchDetailsByName(this.currentBucket)
  }

  @autobind
  @ToasterStore.handle()
  saveSelectedDefaultDomain() {
    return this.domainStore.setDefaultDomain(
      this.currentBucket,
      this.selectedDomainInfo
    )
      .then(() => {
        runInAction(() => { this.saveDefaultDomainFailed = false })
      })
      .catch(error => {
        runInAction(() => { this.saveDefaultDomainFailed = true })
        throw error
      })
  }

  // TODO: 目前只放了私有云环境，没处理公有云环境，公有云私有云接口不一样
  // 私有云会有源站域名和配置域名，公有云只有 cdn 域名
  @Loadings.handle(LoadingId.Domain)
  async fetchDomains() {
    const result = await this.domainStore.fetchAllDomainsByBucketName(this.currentBucket)

    for (const item of result) {
      if (item.status === 'rejected') {
        this.toasterStore.promise(Promise.reject(item.reason))
      }
    }

    // 如果当前有默认域名，则设置默认域名为当前选中域名
    const defaultDomain = this.domainStore.defaultDomainMap.get(this.props.bucketName)
    if (defaultDomain && defaultDomain.isAvailable) {
      this.updateSelectedDomainData({
        domain: defaultDomain.domain,
        type: defaultDomain.domainType
      })

      return
    }

    // 没有默认域名的情况，则选择一个可用的域名设置当前选中域名
    const domainInfo = this.domainStore.getAvailableDomainInfoByBucketName(this.currentBucket)
    if (domainInfo) this.updateSelectedDomainData(domainInfo)
  }

  async init() {
    await this.fetchBucketInfo()

    try {
      await this.fetchDomains()
    } finally {
      runInAction(() => {
        this.hasInitDomain = true
      })

      this.addDisposer(when(
        () => this.bucketStore.isBlockChainPBucket(this.currentBucket),
        () => this.domainStore.fetchS3DomainByBucketName(this.currentBucket)
      ))
    }

    // 每当选中的域名发生变化自动同步服务端
    this.addDisposer(reaction(
      () => this.selectedDomainInfo,
      () => {
        if (!this.selectedDomainInfo) return

        if (this.iamStore.isIamUser) return // iam 用户
        if (this.userInfoStore.isBufferedUser) return // 受保护的用户
        if (this.bucketStore.isShared(this.props.bucketName)) return // 分享的空间

        // 当前没有默认域名或者默认域名与当前选中的不同，则更新默认域名
        const defaultDomain = this.domainStore.defaultDomainMap.get(this.props.bucketName)
        const isDifferent = this.selectedDomainInfo.domain !== defaultDomain?.domain
        if (isDifferent) return this.saveSelectedDefaultDomain()
      },
      { fireImmediately: true }
    ))
  }
}
