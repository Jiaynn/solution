import React from 'react'
import { observer } from 'mobx-react'
import Button from 'react-icecream/lib/button'
import Checkbox from 'react-icecream/lib/checkbox'
import { useLocalStore } from 'portal-base/common/utils/store'
import { useTranslation } from 'portal-base/common/i18n'

import Popover from 'cdn/components/common/Popover'

import LocalStore, { IRegionSelectorProps, areaOptions, regionOptions } from './store'

import './style.less'

const AreaFilter = observer(function _AreaFilter(props: {
  value: { [ areaName: string ]: boolean },
  onChange: (value: string, checked: boolean) => void
}) {
  const t = useTranslation()
  const areaSelectors = areaOptions.map(
    item => (
      <Checkbox key={item.value}
        checked={props.value[item.value]}
        onChange={e => props.onChange(item.value, e.target.checked)}
      >
        {t(item.label)}
      </Checkbox>
    )
  )
  return (
    <div className="areas-wrapper">
      { areaSelectors }
    </div>
  )
})

const Regions = observer(function _Regions(props: {
  value: string[],
  onChange: (value: string, checked: boolean) => void
}) {
  const t = useTranslation()
  const regionSelectors = regionOptions.map(
    (row, index) => {
      const subRegionSelectors = row.regions.map(
        item => (
          <Checkbox key={item.value}
            checked={props.value.indexOf(item.value) > -1}
            onChange={e => props.onChange(item.value, e.target.checked)}
          >
            {t(item.label)}
          </Checkbox>
        )
      )
      return (
        <div className="regions-row" key={index}>
          <div className="region-area-label">{ t(row.areaName) }： </div>
          { subRegionSelectors }
        </div>
      )
    }
  )
  return (
    <div className="regions-wrapper">
      勾选的地区做累计统计
      { regionSelectors }
    </div>
  )
})

export default observer(function RegionSelector(props: IRegionSelectorProps) {
  const store = useLocalStore(LocalStore, props)

  return (
    <div className="comp-region-selector">
      <Popover trigger="click"
        title={
          <AreaFilter
            value={store.selectedArea}
            onChange={store.handleAreaChange}
          />
        }
        onVisibleChange={(visible: boolean) => !visible && store.confirmChange()}
        content={
          <Regions
            value={store.selectedRegions}
            onChange={store.handleRegionChange}
          />
        }
      >
        <Button type="ghost" className="region-selector-btn">{ store.summary }</Button>
      </Popover>
    </div>
  )
})
