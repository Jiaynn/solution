import { observable, computed, reaction, action } from 'mobx'
import { uniq, remove, values } from 'lodash'
import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { I18nStore } from 'portal-base/common/i18n'

import {
  getAllRegionNameList,
  getChinaRegionNameList,
  getOtherRegionNameList,
  containChinaRegions,
  containOtherRegions,
  containAllRegions
} from 'cdn/transforms/region'

import { areas, areaNameMap, regionNameMap, RegionNameKey } from 'cdn/constants/region'

export interface IRegionSelectorProps {
  value: string[]
  onChange: (regions: string[]) => void
}

export const areaOptions = Object.keys(areaNameMap).map(
  area => ({
    label: areaNameMap[area],
    value: area
  })
)

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
  selectRegions: {
    cn: (num: number) => `已选 ${num}/36 个区域`,
    en: (num: number) => `${num}/36 regions have been selected`
  }
}

export const allRegions = getAllRegionNameList()
export const chinaRegions = getChinaRegionNameList()
export const otherRegions = getOtherRegionNameList()

@injectable()
export default class LocalStore extends Store {
  @observable selectedRegions!: string[]

  constructor(
    @injectProps() private props: IRegionSelectorProps,
    private i18n: I18nStore
  ) {
    super()
  }

  @computed get regionsForQuery() {
    if (!this.selectedRegions) {
      return []
    }
    return this.selectedRegions.slice()
  }

  @computed get hasAllChinaRegions() {
    if (!this.selectedRegions) {
      return false
    }
    return containChinaRegions(this.selectedRegions)
  }

  @computed get hasAllOtherRegions() {
    if (!this.selectedRegions) {
      return false
    }
    return containOtherRegions(this.selectedRegions)
  }

  @computed get hasAllRegions() {
    if (!this.selectedRegions) {
      return false
    }
    return containAllRegions(this.selectedRegions)
  }

  @computed get selectedArea() {
    return {
      [areas.global]: this.hasAllRegions,
      [areas.china]: this.hasAllChinaRegions,
      [areas.other]: this.hasAllOtherRegions
    }
  }

  @computed get summary() {
    if (this.hasAllRegions) {
      return this.i18n.t(areaNameMap[areas.global])
    }
    return this.i18n.t(messages.selectRegions, this.selectedRegions ? this.selectedRegions.length : 0)
  }

  @action.bound handleAreaChange(value: string, checked: boolean) {
    let regions: string[] = []
    switch (value) {
      case areas.global: regions = allRegions; break
      case areas.china: regions = chinaRegions; break
      case areas.other: regions = otherRegions; break
      default:
    }
    if (checked) {
      this.selectedRegions = uniq(this.selectedRegions.concat(regions))
      return
    }
    remove(this.selectedRegions, region => regions.indexOf(region) > -1)
  }

  @action.bound handleRegionChange(value: string, checked: boolean) {
    if (checked) {
      this.selectedRegions.push(value)
      return
    }
    remove(this.selectedRegions, region => region === value)
  }

  @action.bound updateSelectedRegions(regions: string[]) {
    this.selectedRegions = regions
  }

  @autobind confirmChange() {
    this.props.onChange(this.regionsForQuery)
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
