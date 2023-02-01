import { observable, computed, reaction, action } from 'mobx'
import { remove, values } from 'lodash'
import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import {
  getAllRegionNameList,
  notContainsAreaCode,
  containAllRegions
} from 'cdn/transforms/apm-region'

import { areas, areaNameMap, regionNameMap, RegionNameKey } from 'cdn/constants/region'

export interface IRegionSelectorProps {
  value: string[]
  onChange: (regions: string[]) => void
}

// apm 中的全部地区相当于中国大陆
export const areaOption = {
  label: areaNameMap[areas.global],
  value: areas.global
}

export const regionOptions = (Object.keys(regionNameMap) as RegionNameKey[])
  .filter(areaCode => notContainsAreaCode.indexOf(areaCode) < 0)
  .map(
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

@injectable()
export default class LocalStore extends Store {
  @observable selectedRegions: string[] = []

  constructor(
    @injectProps() private props: IRegionSelectorProps
  ) {
    super()
  }

  @computed get regionsForQuery() {
    if (!this.selectedRegions) {
      return []
    }
    return this.selectedRegions.slice()
  }

  @computed get hasAllRegions() {
    return this.selectedRegions && containAllRegions(this.selectedRegions)
  }

  @computed get selectedArea() {
    return this.hasAllRegions
  }

  @computed get summary() {
    if (containAllRegions(this.selectedRegions)) {
      return '全部地区'
    }
    return `已选 ${this.selectedRegions ? this.selectedRegions.length : 0}/31 个区域`
  }

  @action.bound handleAreaChange(checked: boolean) {
    if (checked) {
      this.selectedRegions = getAllRegionNameList()
      return
    }
    this.selectedRegions = []
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

  @action.bound updateSelectedRegionsByAreaAndPropsValue(initialRegions: string[]) {
    this.selectedRegions = initialRegions || []
  }

  init() {
    this.addDisposer(reaction(
      () => this.props.value,
      regions => {
        this.updateSelectedRegionsByAreaAndPropsValue(regions)
      },
      { fireImmediately: true }
    ))
  }
}
