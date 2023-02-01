/**
 * @file store for ResourceManage
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import { action, computed, observable, reaction, runInAction, when, makeObservable } from 'mobx'
import { FieldState } from 'formstate'
import autobind from 'autobind-decorator'
import { UserInfoStore } from 'portal-base/user/account'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Store from 'qn-fe-core/store'
import { injectProps } from 'qn-fe-core/local-store'
import { injectable } from 'qn-fe-core/di'

import {
  decorateKey, getKeyAndVersion, getOriginalKey, getTargetKey, isNewDecoratedKey
} from 'kodo/transforms/bucket/resource'

import { BucketStore } from 'kodo/stores/bucket'
import { ConfigStore } from 'kodo/stores/config'
import { DomainStore, IDomainInfo } from 'kodo/stores/domain'
import { KodoIamStore } from 'kodo/stores/iam'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { authCheck } from 'kodo/components/common/Auth'

import { ResourceApis, IFileBase, IFileResource } from 'kodo/apis/bucket/resource'
import { IBucket } from 'kodo/apis/bucket'

export interface IFileInfo extends IFileBase {
  latest?: boolean // 是否是最新版本
  isNewFile: boolean // 是否是新上传文件
  notAvailable?: boolean // 代表文件信息获取失败
  children?: IFileInfo[]
}

export interface IVersionFilesInfo {
  key: string
  children?: IFileInfo[]
}

export type IFile = IVersionFilesInfo | IFileInfo

export interface IBucketInfo extends IBucket { }

export enum LoadingId {
  Refresh = 'refresh',
  List = 'List',
  Domain = 'domain'
}

// 这里相比 ecloud 做如下几点优化：
// 1. 展示模式为普通模式下，单文件的更改例如删除或者更改元数据，直接更改对应数据，不再重新刷新
// 2. 优化新增文件的处理
// 3. 增加了低频数据存储量及存储文件数的显示
@injectable()
export default class StateStore extends Store {
  constructor(
    private featureConfigStore: FeatureConfigStore,
    private userInfoStore: UserInfoStore,
    private toasterStore: ToasterStore,
    private resourceApis: ResourceApis,
    private bucketStore: BucketStore,
    private configStore: ConfigStore,
    private domainStore: DomainStore,
    private iamStore: KodoIamStore,
    @injectProps() props: { bucketName: string }
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
    this.currentBucket = props.bucketName
    this.init()
  }

  @observable marker: string
  @observable hasSensitive = false
  // 标记拉取的文件列表的版本的最后一条是否是该文件的最新版本
  @observable isLastVersionOver = false
  @observable selectedDomainInfo: IDomainInfo
  @observable currentBucket: string
  @observable hasInitDomain = false

  @observable.shallow selectedRowKeys: string[] = []
  @observable.ref expandedRowKeys: string[] = []
  // 版本的时候因为需要多请求一条看是否版本最后一条是最新文件，跟 isLastVersionOver 配合使用
  @observable.ref temporaryFile: IFileInfo[] = []
  // 从接口获取的原始数据经过与 newFiles 的比较去重后的数据
  // 普通模式列表的数据就是 newFiles（latest）+ files 的组合
  @observable.shallow files: IFileInfo[] = []
  // 新上传的数据
  @observable.shallow newFiles: IFileInfo[] = []
  // 界面版本模式下的文件数据
  versionFileMap = observable.map<string, IFileInfo[]>({}, { deep: false })

  filesTime: number
  versionFieldState: FieldState<boolean> = new FieldState(false)
  prefixField: FieldState<string> = new FieldState('')
  loadings = Loadings.collectFrom(this, LoadingId)

  @computed
  get bucketInfo() {
    return this.bucketStore.getDetailsByName(this.currentBucket)
  }

  // 关于以下这种写法，是因为没有值不代表就是 false，如果界面强依赖该值的时候，应该先判断该值再去做下一步处理
  // 但是当界面弱依赖，或者只是部分接口依赖的时候，怎么处理是个难题，因为拿不到值导致的界面报错或者因为拿不到值
  // 导致无法发请求都是有问题的，不过我个人感觉界面报错可能更能接受，因为如果不去做下一步操作可能会导致整个应用不可预知的状态发生，
  // 比如本来一个显示应该报错处理，但是却显示了其他值，这可能会导致用户认为这本就是这样，这样是有风险的
  @computed
  get isPrivateBucket() {
    return this.bucketInfo ? !!this.bucketInfo.private : null
  }

  @computed
  get isReadonlyShareBucket() {
    return this.bucketInfo ? ShareType.ReadOnly === this.bucketInfo.perm : true
  }

  @computed
  get isShowingVersion() {
    return this.bucketInfo ? this.bucketInfo.versioning && this.versionFieldState.value : null
  }

  @computed
  get shouldShowDownloadMenu() {
    return !this.iamStore.isActionDeny({ actionName: 'Get', resource: this.currentBucket }) && this.baseUrl
  }

  @computed
  get shouldShowChangeFileStatusMenu() {
    return authCheck({
      iamStore: this.iamStore,
      bucketStore: this.bucketStore,
      userInfoStore: this.userInfoStore,
      featureConfigStore: this.featureConfigStore
    }, {
      featureKeys: ['KODO.KODO_BUCKET_CHANGE_FILE_STATUS'],
      iamPermission: { actionName: 'Chstatus', resource: this.currentBucket }
    }) && !this.isReadonlyShareBucket
  }

  @computed
  get shouldShowChangeStorageTypeMenu() {
    if (this.bucketInfo == null) { return false }

    return this.configStore.supportedStorageTypes.length > 1 // 启用的存储类型小于 2 个则不开启存储类型修改功能
      && !this.iamStore.isActionDeny({ actionName: 'Chtype', resource: this.currentBucket })
      && !this.isShowingVersion
  }

  @computed
  get shouldShowCopyLinkMenu() {
    return !this.iamStore.isActionDeny({ actionName: 'Get', resource: this.currentBucket })
      && this.isPrivateBucket != null
      && !this.isPrivateBucket
      && !this.bucketInfo!.protected
      && this.baseUrl
  }

  @computed
  get shouldShowDeleteMenu() {
    return !this.iamStore.isActionDeny({ actionName: 'Delete', resource: this.currentBucket })
      && !this.isReadonlyShareBucket
  }

  @computed
  get isRefreshing() {
    return this.loadings.isLoading(LoadingId.Refresh)
  }

  @computed
  get isListLoading() {
    return [LoadingId.List, LoadingId.Domain].some(id => this.loadings.isLoading(id))
  }

  @computed
  get baseUrl() {
    return this.domainStore.getResourceBaseUrl(
      this.currentBucket,
      this.selectedDomainInfo
    )
  }

  // 界面版本模式下的列表展示数据
  // TODO: 版本下如果出现多条 notAvailable 会造成 table row key 重复，同时因为缺少文件版本信息上下列表无法同步
  // 对于多条 notAvailable 的数据目前先不管
  @computed
  get versionFileList() {
    // 后端返回的数据是按照版本从旧到新排序过的
    const list: IVersionFilesInfo[] = [...this.versionFileMap.entries()].map(([key, versionFiles]) => {
      const data = versionFiles.map((file, index) => ({
        ...file,
        latest: index === versionFiles.length - 1
      }))

      return {
        key,
        putTime: data[data.length - 1].putTime,
        tag: true,
        children: data
      }
    })

    if (list.length) {
      const listFinalIndex = list.length - 1
      const { children } = list[listFinalIndex]

      if (children && children.length) {
        const lastIndex = children.length - 1
        // 直接改变好了，不弄展开重新赋值了，节省性能
        children[lastIndex].latest = this.marker ? this.isLastVersionOver : true
      }
    }

    return [
      ...(
        this.prefixField.value
          ? this.newFiles.filter(file => file.key.indexOf(this.prefixField.value) === 0)
          : this.newFiles
      ),
      ...list
    ]
  }

  // 界面普通模式下的列表展示数据
  @computed
  get fileList() {
    // 普通模式的展示需要过滤掉重复 key 的数据，只展示最新新上传的，同时如果有前缀设置的话还要匹配前缀
    const matchedData = this.newFiles.filter(file => (
      this.prefixField.value
        ? file.key.indexOf(this.prefixField.value) === 0 && file.latest
        : file.latest
    ))
    return [...matchedData, ...this.files]
  }

  @action.bound
  updateSelectedDomainData(domainInfo: IDomainInfo) {
    this.selectedDomainInfo = domainInfo
    // 切换域名的时候也清理下 newFiles
    this.clearNewFiles()
  }

  @action.bound
  updateExpandedRowKeys(keys: string[]) {
    this.expandedRowKeys = keys
  }

  @action.bound
  updateSelectedRowKeys(keys: string[]) {
    this.selectedRowKeys = keys
  }

  // 之前在 ecloud 里，files 是通过 computed get 出来的，但是这样会使单文件的改动也导致整个重新计算，所以这里不再用 computed
  @action.bound
  updateFiles(data: IFileInfo[]) {
    // 把 newFiles 存在的从 data 中过滤掉
    const uniqueData = data.filter(item => !this.newFiles.some(file => item.key === file.key))
    this.files.push(...uniqueData)
  }

  @action.bound
  updateFileData(data: IFileResource) {
    let result: Array<IFileBase & { isNewFile: boolean }>
    if (!data) {
      return
    }

    this.hasSensitive = data.has_sensitive_words
    const list = [...this.temporaryFile, ...data.items]
      .map(item => ({ ...item, isNewFile: false }))

    if (data.marker) {
      // isLastVersionOver 记录最后两条是否是同名 key
      // 因为我们会把最后一条去掉，如果同名那么倒数第二条就不是最新版本了
      const { length } = data.items
      this.isLastVersionOver = !(
        data.items[length - 1].key === data.items[length - 2].key
      )

      this.temporaryFile = [{
        ...data.items[length - 1],
        isNewFile: false
      }]

      this.marker = data.marker
      result = list.slice(0, -1)
    } else {
      this.isLastVersionOver = true
      this.marker = data.marker
      result = list
    }

    // 根据界面展示模式选择去选择更新 version map 还是 list
    if (this.isShowingVersion) {
      this.updateFileVersionMap(result)
    } else {
      this.updateFiles(result)
    }
  }

  @action.bound
  updateFile(originaKey: string, file: IFileInfo, originalVersion: string | undefined, isNew = false) {
    // 普通模式下重命名文件要更新 selectedRowKeys
    if (!this.isShowingVersion && file.key !== originaKey) {
      const rowIndex = this.selectedRowKeys.findIndex(rowKey => rowKey === decorateKey(originaKey, isNew))
      if (rowIndex >= 0) {
        this.selectedRowKeys[rowIndex] = decorateKey(file.key, isNew)
      }
    }

    if (this.isShowingVersion) {
      // 版本模式下不能修改文件名
      // 如果处在界面版本模式，文件的更新会影响已存在列表的数据，所以也需要同步更新下 map 里的数据
      if (file.key !== originaKey) {
        throw new Error('界面版本模式下不能修改 key')
      }

      // 更新指定版本文件
      const versionFiles = this.versionFileMap.get(file.key)
      // map 里存的只是当前请求的数据，而因为一次请求拿到的数据有限
      // 所以如果当前 map 里不存在，说明当前修改的是新上传的文件
      // 这时候更新 map 的事情交给后续的加载更多就行
      if (versionFiles) {
        const index = versionFiles.findIndex(data => data.version === originalVersion)
        if (index >= 0) {
          const newVersionFiles = [...versionFiles]
          newVersionFiles[index] = file
          this.versionFileMap.set(file.key, newVersionFiles)
        }
      }

    } else if (!isNew) {
      // 如果改动的是界面普通模式下的已存在文件则检查并更新 files
      // 普通模式下对已存在的列表做了过滤，不会出现跟 newFiles 重名的，所以不需要同步新旧文件列表
      // 所以这里更新完成之后直接返回就行
      const index = this.files.findIndex(item => (
        item.key === originaKey && item.version === originalVersion
      ))
      this.files[index] = file
      return
    }

    // 到这一段说明本次修改有两种情况：1.修改的是新文件 2. 修改的是界面版本模式的文件
    // 如果是处在版本模式下，新老文件列表需要保持同步，所以不管是哪种情况，newFiles 的检查更新是必须的
    const newIndex = this.newFiles.findIndex(item => (
      item.key === originaKey && item.version === originalVersion
    ))

    if (newIndex > -1) {
      // 版本模式下不能修改文件名，而普通模式新文件本身就是最新的，所以 latest 跟原先是一致的
      const { isNewFile, latest } = this.newFiles[newIndex]
      this.newFiles[newIndex] = {
        ...file,
        isNewFile,
        latest
      }
    }
  }

  // 注意：删除操作中的 key 都是被包装过的
  @action.bound
  deleteFiles(decoratedKeys: string[]) {
    const newKeys: string[] = []
    const oldKeys: string[] = []
    // 这里提取下新上传的和已存在的
    decoratedKeys.forEach(decoratedKey => {
      const targetKey = getOriginalKey(decoratedKey)
      if (isNewDecoratedKey(decoratedKey)) {
        newKeys.push(targetKey)
      } else {
        oldKeys.push(targetKey)
      }
    })

    // 更新 newFiles 数据
    newKeys.forEach(key => {
      const newFileIndex = this.newFiles.findIndex(data => (
        getTargetKey({
          key: data.key,
          ...(this.isShowingVersion && { version: data.version })
        }) === key
      ))

      this.newFiles.splice(newFileIndex, 1)
      const rowIndex = this.selectedRowKeys.findIndex(rowKey => rowKey === decorateKey(key, true))
      if (rowIndex >= 0) {
        this.selectedRowKeys.splice(rowIndex, 1)
      }
    })

    if (!this.isShowingVersion) {
      // 普通模式下删除已存在的数据的同时也清除一下选中的对应的复选框
      oldKeys.forEach(key => {
        const rowIndex = this.selectedRowKeys.findIndex(rowKey => rowKey === decorateKey(key, false))
        if (rowIndex >= 0) {
          this.selectedRowKeys.splice(rowIndex, 1)
        }
        const index = this.files.findIndex(item => item.key === key)
        this.files.splice(index, 1)
      })
      return
    }

    // 开启版本情况下删除下面列表的同时保持新上传的数据的同步
    oldKeys.forEach(key => {
      const versionKey = getKeyAndVersion(key)
      const newFileIndex = this.newFiles.findIndex(item => (
        item.key === versionKey.key && item.version === versionKey.version
      ))

      if (newFileIndex > -1) {
        this.newFiles.splice(newFileIndex, 1)
      }
    })

    // 开版本情况下的删除操作后去刷新 list，因为版本情况下数据结构比较复杂，删除操作的副作用比较大
    if (oldKeys.length || newKeys.length) {
      this.refreshList()
    }
  }

  @autobind
  @ToasterStore.handle()
  async fetchFileState(
    originalKey: string,
    isNewFile: boolean,
    originalVersion: string | undefined,
    newKey?: string
  ) {
    const targetKey = newKey || originalKey
    // 存在 newKey 代表是修改文件名，不需要 version
    const targetVersion = newKey ? undefined : originalVersion

    const stateInfo = await this.resourceApis.getFileState(this.currentBucket, {
      key: targetKey,
      version: targetVersion
    }, this.baseUrl)

    this.updateFile(originalKey, {
      ...stateInfo,
      key: targetKey,
      isNewFile: false
    }, originalVersion, isNewFile)
  }

  @action.bound
  updateFileVersionMap(list: IFileInfo[]) {
    list.forEach(item => {
      const data = this.versionFileMap.get(item.key) || []
      this.versionFileMap.set(
        item.key,
        [
          ...data,
          item
        ]
      )
    })
  }

  // TODO: 目前只放了私有云环境，没处理公有云环境，公有云私有云接口不一样
  // 私有云会有源站域名和配置域名，公有云只有 cdn 域名
  @Loadings.handle(LoadingId.Domain)
  fetchDomains() {
    const req = this.domainStore.fetchAllDomainsByBucketName(this.currentBucket)

    req.then(() => {
      const domainInfo = this.domainStore.getAvailableDomainInfoByBucketName(this.currentBucket)
      if (domainInfo) {
        this.updateSelectedDomainData(domainInfo)
      }
    }).catch(() => { /**/ })

    req.then(data => {
      data.forEach(item => {
        if (item.status === 'rejected') {
          this.toasterStore.promise(Promise.reject(item.reason))
        }
      })
    }).catch(() => { /**/ })

    return req
  }

  @autobind
  @ToasterStore.handle()
  fetchFiles() {
    const time = new Date().getTime()
    this.filesTime = time
    this.loadings.start(LoadingId.List)

    const req = this.resourceApis.getFileResource({
      bucket: this.currentBucket,
      prefix: this.prefixField.value,
      baseUrl: this.baseUrl,
      delimiter: '',
      allversion: !!this.isShowingVersion,
      limit: 51,
      marker: this.marker
    })

    req.then(data => {
      if (this.filesTime === time) {
        this.updateFileData(data)
        this.loadings.stop(LoadingId.List)
      }
    }).catch(() => { /**/ })

    return req.catch(error => {
      if (this.filesTime === time) {
        this.loadings.stop(LoadingId.List)
        throw error
      }
    })
  }

  @ToasterStore.handle()
  fetchBucketInfo() {
    return this.bucketStore.fetchDetailsByName(this.currentBucket)
  }

  @autobind
  @ToasterStore.handle('保存默认域名成功')
  setDefaultDomain() {
    return this.domainStore.setDefaultDomain(this.currentBucket, this.selectedDomainInfo)
  }

  // 新上传的文件会通过该方法放到 newFiles 里，并对最新版本的文件进行标记
  @action.bound
  addFile(key: string, file?: IFileInfo) {
    const newFile = {
      ...file,
      key,
      isNewFile: true,
      latest: true,
      ...(!file && { notAvailable: true })
    }

    const index = this.newFiles.findIndex(item => item.key === key)
    if (index >= 0) {
      this.newFiles[index].latest = false
      this.newFiles.splice(index, 0, newFile as IFileInfo)
    } else {
      this.newFiles.unshift(newFile as IFileInfo)
    }
  }

  @action.bound
  clearNewFiles() {
    this.newFiles = []
  }

  @action.bound
  resetPrefix() {
    this.prefixField.reset()
  }

  @action.bound
  refreshList() {
    this.marker = ''
    this.files = []
    this.temporaryFile = []
    this.expandedRowKeys = []
    this.versionFileMap.clear()
    this.updateSelectedRowKeys([])
    this.updateExpandedRowKeys([])
    this.fetchFiles()
  }

  @autobind
  @Loadings.handle(LoadingId.Refresh)
  refresh() {
    this.clearNewFiles()

    return Promise.all([
      this.fetchBucketInfo(),
      this.refreshList()
    ])
  }

  async init() {
    await this.fetchBucketInfo()

    try {
      await this.fetchDomains()
    } finally {
      runInAction(() => {
        this.hasInitDomain = true
      })

      this.addDisposer(reaction(
        () => ({
          baseUrl: this.baseUrl,
          prefix: this.prefixField.$,
          version: this.isShowingVersion,
          iamPermission: this.iamStore.isIamUser
            ? !this.iamStore.isActionDeny({ actionName: 'List', resource: this.currentBucket })
            : true
        }),
        data => {
          if (data.iamPermission) {
            this.refreshList()
          }
        },
        { fireImmediately: true }
      ))

      this.addDisposer(when(
        () => this.bucketStore.isBlockChainPBucket(this.currentBucket),
        () => this.domainStore.fetchS3DomainByBucketName(this.currentBucket)
      ))
    }
  }
}
