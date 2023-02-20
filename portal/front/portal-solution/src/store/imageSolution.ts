import autobind from 'autobind-decorator'
import { makeObservable, observable, computed, action, runInAction } from 'mobx'
import Store from 'qn-fe-core/store'

import { injectable } from 'qn-fe-core/di'

import { SolutionApis } from 'apis/imageSolution'
import { GetBucketListResultDataList } from 'apis/_types/imageType'
import { DomainStore } from 'kodo/stores/domain'

@injectable()
export default class ImageSolutionStore extends Store {
  constructor(
    private solutionApis: SolutionApis,
    private domainStore: DomainStore
  ) {
    super()
    makeObservable(this)
  }

  @observable.ref buckets:GetBucketListResultDataList[] = []

  @action.bound
  updateBuckets(data: GetBucketListResultDataList[]) {
    this.buckets = data
  }

  @computed
  get bucketNames() {
    return this.buckets.map(b => b.bucket_id)
  }

  @autobind
  async fetchBucketList() {
    const { list } = await this.solutionApis.getBucketList({ page_num: 1, page_size: 1000, solution_code: 'image' })
    this.updateBuckets(list)
    this.updateCurrentBucket(list[0]?.bucket_id)
  }

  @observable currentBucket = ''

  @action.bound
  updateCurrentBucket(name:string) {
    this.currentBucket = name
    // console.log('currentBucket', this.currentBucket)
  }

  // 当前空间对应的域名
  @observable.ref currentDomains:string[] = []

  @action.bound
  updateCurrentDomains(data: string[]) {
    this.currentDomains = data
    // console.log('currentDomains', this.currentDomains)
  }

  @autobind
  fetchCurrentDomains() {
    return this.domainStore.fetchCDNDomainListByBucketName(this.currentBucket).then(() => {
      const domains = this.domainStore.getCDNAccelerateDomainListByBucketName(this.currentBucket)
      const domainNames = domains.map(d => d.name)
      runInAction(() => {
        this.updateCurrentDomains(domainNames)
      })
    })
  }
}

