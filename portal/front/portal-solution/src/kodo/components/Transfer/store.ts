/**
 * @file TransferBaseStore
 * @description bucket 跨区域同步
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { computed, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ConfigStore } from 'kodo/stores/config'
import { BucketListStore } from 'kodo/stores/bucket/list'

import { App } from 'kodo/constants/app'
import { RegionSymbol } from 'kodo/constants/region'
import { crossProducts } from 'kodo/constants/transfer'

import { BucketListApis } from 'kodo/apis/bucket/list'

@injectable()
export class TransferBaseStore extends Store {
  constructor(
    private configStore: ConfigStore,
    private bucketListApis: BucketListApis,
    private bucketListStore: BucketListStore
  ) {
    super()
    makeObservable(this)
  }

  private createBucketListStore(product: typeof crossProducts[number]): BucketListStore {
    if (this.configStore.product === product) {
      return this.bucketListStore
    }

    const newStore = new BucketListStore(
      this.configStore,
      this.bucketListApis
    )

    newStore.bindProduct(() => product)

    this.addDisposer(newStore.dispose)
    return newStore
  }

  @computed
  get bucketListStoreMap() {
    // 每个产品的空间列表分开存储
    const map = new Map<App.Kodo | App.Fog, BucketListStore>()

    for (const product of crossProducts) {
      if (this.configStore.hasApp(product)) {
        map.set(
          product,
          this.createBucketListStore(product)
        )
      }
    }

    return map
  }

  @computed
  get regionProductInfoMap(): Map<RegionSymbol, { product: typeof crossProducts[number], productName: string }> {
    return crossProducts.reduce((map, product) => {
      if (this.configStore.hasApp(product)) {
        const productGlobalConfig = this.configStore.getFull(product)

        productGlobalConfig.regions.forEach(region => {
          map.set(region.symbol, {
            product,
            productName: productGlobalConfig.site.productName!
          })
        })
      }
      return map
    }, new Map<RegionSymbol, { product: typeof crossProducts[number], productName: string }>())
  }

  @autobind
  getRegionName(region: RegionSymbol): string {
    const productInfo = this.regionProductInfoMap.get(region)!
    const regionConfig = this.configStore.getRegion({ region, product: productInfo.product })
    return regionConfig.name
  }
}
