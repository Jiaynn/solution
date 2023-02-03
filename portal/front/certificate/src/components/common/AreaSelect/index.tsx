/*
 * @file component AreaSelect
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observable, computed, action, reaction } from 'mobx'
import { observer } from 'mobx-react'

import { observeInjectable } from 'qn-fe-core/store'
import Disposable from 'qn-fe-core/disposable'
import { useLocalStore, injectProps } from 'qn-fe-core/local-store'
import Select from 'react-icecream/lib/select'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'

import { countryData, provinceData, cityData } from '../../../constants/province-city'

export interface IAreaValue {
  country: number
  province: number
  city: number
}

export interface IAreaSelectProps {
  value: IAreaValue
  onChange: (value: IAreaValue) => void
}

export default observer(function _AreaSelect(props: IAreaSelectProps) {
  const store = useLocalStore(AreaStore, props)
  return (
    <Row type="flex" justify="space-between" align="middle" gutter={20}>
      <Col span={8}>
        <Select
          value={store.selectedCountry}
          onChange={(country: number) => store.updateSelectedCountry(country)}
        >
          {
            store.countryList.map(country => (
              <Select.Option key={country.tk} value={country.tk}>
                {country.tv}
              </Select.Option>
            ))
          }
        </Select>
      </Col>
      <Col span={8}>
        <Select
          value={store.selectedProvince}
          onChange={(province: number) => store.updateSelectedProvince(province)}
        >
          {
            store.provinceList.map(province => (
              <Select.Option key={province.pk} value={province.pk}>
                {province.pv}
              </Select.Option>
            ))
          }
        </Select>
      </Col>
      <Col span={8}>
        <Select
          value={store.selectedCity}
          onChange={(city: number) => store.updateSelectedCity(city)}
        >
          {
            store.cityList.map(city => (
              <Select.Option key={city.ck} value={city.ck}>
                {city.cv}
              </Select.Option>
            ))
          }
        </Select>
      </Col>
    </Row>
  )
})

export const defaultArea = {
  country: 1,
  province: 1,
  city: 72
}

@observeInjectable()
export class AreaStore extends Disposable {
  constructor(@injectProps() private props: IAreaSelectProps) {
    super()
  }

  @observable selectedCountry: number = defaultArea.country
  @observable selectedProvince: number = defaultArea.province
  @observable selectedCity: number = defaultArea.city

  // 国家下拉框列表
  countryList = countryData

  // 省份下拉框列表
  provinceList = provinceData

  // 城市下拉框列表
  @computed get cityList() {
    return cityData.filter(
      city => this.selectedProvince && city.pk === this.selectedProvince
    )
  }

  @computed get result(): IAreaValue {
    return {
      country: this.selectedCountry,
      province: this.selectedProvince,
      city: this.selectedCity
    }
  }

  @action updateSelectedCountry(country: number) {
    this.selectedCountry = country
  }

  @action updateSelectedProvince(province: number) {
    this.selectedProvince = province
  }

  @action updateSelectedCity(city: number) {
    this.selectedCity = city
  }

  initSelectedArea(area?: IAreaValue) {
    const { country, province, city } = area || defaultArea
    this.updateSelectedCountry(country)
    this.updateSelectedProvince(province)
    this.updateSelectedCity(city)
  }

  init() {

    this.addDisposer(reaction(
      () => this.props.value,
      area => this.initSelectedArea(area)
    ))

    this.addDisposer(reaction(
      () => this.result,
      value => {
        this.props.onChange(value)
      }
    ))

    // 切换 city 的时候默认使用 provinceList 中的第一个
    this.addDisposer(reaction(
      () => this.provinceList,
      provinceList => {
        if (provinceList && provinceList[0]) {
          this.updateSelectedProvince(provinceList[0].pk)
        }
      }
    ))

    // 切换 province 的时候默认使用 cityList 中的第一个
    this.addDisposer(reaction(
      () => this.cityList,
      cityList => {
        if (cityList && cityList[0] && !cityList.some(cityItem => cityItem.ck === this.selectedCity)) {
          this.updateSelectedCity(cityList[0].ck)
        }
      }
    ))
  }
}
