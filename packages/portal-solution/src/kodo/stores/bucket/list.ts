/**
 * @file bucketList store
 * @author yinxulai <me@yinxulai.cn>
 */

import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import autobind from 'autobind-decorator'
import { action, computed, observable, makeObservable } from 'mobx'
import { Loadings } from 'portal-base/common/loading'

import { valuesOfEnum } from 'kodo/utils/ts'

import { tagStringToTag } from 'kodo/transforms/bucket/setting/tag'

import { ConfigStore } from 'kodo/stores/config'

import { App } from 'kodo/constants/app'
import { RegionSymbol } from 'kodo/constants/region'

import { BucketListApis, IBucketListItem } from 'kodo/apis/bucket/list'

export enum Loading {
  List = 'list',
  Item = 'item'
}

// bucket list store
@injectable()
export class BucketListStore extends Store {

  constructor(
    private configStore: ConfigStore,
    private bucketListApis: BucketListApis
  ) {
    super()
    makeObservable(this)
  }

  // loadings
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  // 全量的 name
  @observable.ref nameList: string[] = []

  // 已加载的 list item 数据
  private listItemMap = observable.map<string, IBucketListItem>({}, { deep: false })

  // tag 数据 tag => bucketName[] 仅保留单次结果
  private nameSetGroupByTagMap = observable.map<string, Set<string>>({}, { deep: false })

  private getProduct = () => this.configStore.product

  bindProduct(get: () => App.Kodo | App.Fog) {
    this.getProduct = get
  }

  // isLoading
  @autobind
  isLoading(key?: Loading) {
    return key ? this.loadings.isLoading(key) : !this.loadings.isAllFinished()
  }

  // 根据 region group
  // 极个别情况（接口原因）listItemMap 可能不全、这也就意味着 nameListGroupByRegion 可能与 nameList、listItemMap 长度可能是不同的
  @computed
  get nameListGroupByRegion() {
    const listItemMap = this.listItemMap
    const allRegion = this.configStore.getRegion({ allRegion: true })
    const result = new Map<RegionSymbol, string[]>(
      allRegion.map(region => [region.symbol, []])
    )

    this.nameList.forEach(name => {
      const ListItem = listItemMap.get(name)
      if (ListItem && ListItem.region) {
        const list = result.get(ListItem.region)
        if (list) {
          list.push(name)
        } else {
          result.set(ListItem.region, [name])
        }
      }
    })

    return result
  }

  // 所有 bucket 集
  // 极个别情况（接口原因）listItemMap 可能不全、这也就意味着 list 可能与 nameList、listItemMap 长度可能是不同的
  @computed
  get list() {
    return this.nameList.map(name => this.listItemMap.get(name)).filter(Boolean) as IBucketListItem[]
  }

  // 根据 region group
  @computed
  get listGroupByRegion() {
    return new Map(
      [...this.nameListGroupByRegion].map(
        ([region, names]): [string, IBucketListItem[]] => (
          [region, names.map(name => this.listItemMap.get(name)!)]
        )
      )
    )
  }

  @autobind
  getByName(name: string) {
    return this.listItemMap.get(name)
  }

  @autobind
  getListByRegion(region: RegionSymbol) {
    return this.listGroupByRegion.get(region)
  }

  @autobind
  getNameListByRegion(region: RegionSymbol) {
    return this.nameListGroupByRegion.get(region)
  }

  @autobind
  getNameListByTagKey(tagKey: string) {
    return this.nameSetGroupByTagMap.get(tagKey)
  }

  @action.bound
  private updateListItemMap(data: IBucketListItem[]) {
    this.listItemMap.clear()
    data.forEach(bucket => this.listItemMap.set(bucket.tbl, bucket))
  }

  @action.bound
  private updateNameList(data: string[]) {
    this.nameList = data
  }

  @action.bound
  private updateNameGroupByTagMap(tag: string, bucketNames: string[]) {
    this.nameSetGroupByTagMap.set(tag, new Set(bucketNames))
  }

  @autobind
  async fetchNameListByTag(tag: string) {
    const { Key = null, Value = null } = tagStringToTag(tag) || {}
    const data = await this.bucketListApis.getBucketNameList({
      tags: Key ? [{ Key, Value: Value! }] : [],
      shared: true // 共享空间
    })
    this.updateNameGroupByTagMap(tag, data)
  }

  // 获取 Bucket 列表
  @autobind
  @Loadings.handle(Loading.List)
  async fetchList() {
    const product = this.getProduct()

    const names = (await this.bucketListApis.getBucketNameList({ shared: true, product })) || []
    this.updateNameList(names)

    const [listA, listB] = await Promise.all([
      this.bucketListApis.getBucketList({ shared: true, line: true, product }), // 获取低频空间
      this.bucketListApis.getBucketList({ shared: true, line: false, product }) // 获取非低频空间
    ])

    const listItems = [...(listA || []), ...(listB || [])] // 获取到的 listItems 数据
    const loadedNames = new Set(listItems.map(item => item.tbl)) // 已经获取到 listItem 的 names
    const missingNames = names.filter(bucket => !loadedNames.has(bucket)) // 缺失的 listItem 的 name

    // 数据不全 获取缺失的数据
    if (missingNames.length) {
      listItems.push(...(await Promise.all(
        missingNames.map(
          bucket => this.bucketListApis.getBucketListItemByName(bucket)
        )
      )))
    }

    this.updateListItemMap(listItems)
  }

  @autobind
  @Loadings.handle(Loading.Item)
  fetchByName(name: string) {
    const req = this.bucketListApis.getBucketListItemByName(name)
    req.then(item => {
      action(
        () => {
          this.updateListItemMap([...this.list, item])
          if (!this.nameList.includes(name)) {
            this.updateNameList([...this.nameList, name])
          }
        }
      )()
    }).catch(() => { /**/ })
    return req
  }
}
