import autobind from 'autobind-decorator'
import { makeObservable, observable, computed, action, runInAction, reaction } from 'mobx'
import Store from 'qn-fe-core/store'

import { injectable } from 'qn-fe-core/di'

import { FieldState, FormState } from 'formstate-x'

import { ImageSolutionApis } from 'apis/image'

import { GetBucketListResultDataList } from 'apis/_types/imageType'
import { DomainStore, ICDNDomain } from 'kodo/stores/domain'

@injectable()
export default class ImageSolutionStore extends Store {
  constructor(
    private solutionApis: ImageSolutionApis,
    private domainStore: DomainStore
  ) {
    super()
    makeObservable(this)
  }

  @observable.ref buckets: GetBucketListResultDataList[] = []

  @action.bound
  updateBuckets(data: GetBucketListResultDataList[]) {
    this.buckets = data
  }

  @computed
  get bucketNames() {
    return this.buckets && this.buckets.map(b => b.bucket_id)
  }

  @computed
  get hasBucket() {
    return this.bucketNames.length > 0
  }

  @autobind
  async fetchBucketList() {
    const result = await this.solutionApis.getBucketList({ solution_code: 'image' })
    const list = result.list || []
    this.updateBuckets(list)
    this.updateCurrentBucket(list[0]?.bucket_id)
  }

  @observable currentBucket = ''

  @action.bound
  updateCurrentBucket(name: string) {
    this.currentBucket = name
  }

  @observable.ref currentDomains: ICDNDomain[] = []

  @observable.ref state = new FormState({ filterDomainName: new FieldState('', 500) })

  @computed
  get filterDomainsByName() {
    if (!this.state.$.filterDomainName || this.state.$.filterDomainName.value === '') {
      return this.currentDomains
    }
    return this.currentDomains.filter(d => d.name.includes(this.state.$.filterDomainName.value))
  }

  @action.bound
  updateCurrentDomains(domains: ICDNDomain[]) {
    this.currentDomains = domains
  }
  // 当前空间对应的域名
  @computed get currentDomainNames() {
    return this.currentDomains.map(d => d.name)
  }

  @autobind
  fetchCurrentDomains() {
    return this.domainStore.fetchCDNDomainListByBucketName(this.currentBucket).then(() => {
      const domains = this.domainStore.getCDNAccelerateDomainListByBucketName(this.currentBucket)
      runInAction(() => {
        this.updateCurrentDomains(domains)
      })
    })
  }

  init() {
    // 当currentBucket改变时也要改变currentDomains
    this.addDisposer(reaction(
      () => this.currentBucket,
      async () => {
        this.fetchCurrentDomains()
      }
    ))
  }
}

