import { observable, computed, reaction, action } from 'mobx'
import { remove, values } from 'lodash'
import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { I18nStore } from 'portal-base/common/i18n'

import {
  getAllRegionNameList,
  getChinaRegionNameList,
  getForeignRegionNameList
} from 'cdn/transforms/traffic-region'

import { areas, regionNameMap, RegionNameKey } from 'cdn/constants/traffic-region'

export interface IRegionSelectorProps {
  value: string[],
  onChange: (regions: string[]) => void
}

export const regionOptions = (Object.keys(regionNameMap) as RegionNameKey[]).map(
  areaKey => ({
    areaName: regionNameMap[areaKey],
    regions: values(regionNameMap[areaKey].regions).map(
      (region: {key: string, cn: string, en: string}) => ({
        label: region,
        value: region.key
      })
    )
  })
)

const messages = {
  allRegions: {
    cn: '全部区域',
    en: 'All regions'
  },
  selectRegions: {
    cn: (num: number, total: number) => `已选 ${num}/${total} 个区域`,
    en: (num: number, total: number) => `${num}/${total} regions have been selected`
  }
}

export const allRegions = getAllRegionNameList()
export const chinaRegions = getChinaRegionNameList()
export const foreignRegions = getForeignRegionNameList()

@injectable()
export default class LocalStore extends Store {
  @observable selectedRegions!: string[]

  constructor(@injectProps() private props: IRegionSelectorProps, private i18n: I18nStore) {
    super()
  }

  @computed get regionsForQuery() {
    if (!this.selectedRegions) {
      return []
    }

    return this.selectedRegions
  }

  @computed get hasAllRegions() {
    return this.selectedRegions && this.selectedRegions.length === allRegions.length
  }

  @computed get hasAllForeignRegions() {
    if (!this.selectedRegions) {
      return false
    }
    const regions = this.selectedRegions.filter(
      region => foreignRegions.indexOf(region) > -1
    )
    return regions.length === foreignRegions.length
  }

  @computed get hasAllChinaRegions() {
    if (!this.selectedRegions) {
      return false
    }
    const regions = this.selectedRegions.filter(
      region => chinaRegions.indexOf(region) > -1
    )
    return regions.length === chinaRegions.length
  }

  @computed get selectedArea() {
    return {
      [areas.foreign]: this.hasAllForeignRegions,
      [areas.china]: this.hasAllChinaRegions
    }
  }

  @computed get summary() {
    if (this.hasAllRegions) {
      return this.i18n.t(messages.allRegions)
    }
    return this.i18n.t(
      messages.selectRegions,
      this.selectedRegions ? this.selectedRegions.length : 0,
      allRegions.length
    )
  }

  @action.bound handleAreaChange(checked: boolean) {
    if (checked) {
      this.selectedRegions = allRegions
    } else {
      this.selectedRegions = []
    }
  }

  @action.bound handleRegionChange(value: string, checked: boolean) {
    if (checked) {
      this.selectedRegions.push(value)
      return
    }
    remove(this.selectedRegions, region => region === value)
  }

  @autobind confirmChange() {
    this.props.onChange(this.regionsForQuery)
  }

  @action.bound updateSelectedRegions(initialRegions: string[]) {
    this.selectedRegions = initialRegions
  }

  init() {
    this.addDisposer(reaction(
      () => this.props.value,
      regions => {
        this.updateSelectedRegions(regions)
      },
      { fireImmediately: true }
    ))
  }
}
