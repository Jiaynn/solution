import React from 'react'
import { observer } from 'mobx-react'
import Button from 'react-icecream/lib/button'
import Checkbox from 'react-icecream/lib/checkbox'
import { useLocalStore } from 'portal-base/common/utils/store'
import { useTranslation } from 'portal-base/common/i18n'

import Popover from 'cdn/components/common/Popover'

import LocalStore, { IRegionSelectorProps, regionOptions } from './store'

import './style.less'

const allRegionMsg = {
  cn: '全部区域',
  en: 'All regions'
}

const AreaFilter = observer(function _AreaFilter(props: {
  value: boolean,
  onChange: (checked: boolean) => void
}) {
  const t = useTranslation()
  return (
    <div className="areas-wrapper">
      <div className="regions-row">
        <Checkbox
          checked={props.value}
          onChange={e => props.onChange(e.target.checked)}
        >
          {t(allRegionMsg)}
        </Checkbox>
      </div>
    </div>
  )
})

const Regions = observer(function _Regions(props: {
  value: string[],
  onChange: (value: string, checked: boolean) => void
}) {
  const t = useTranslation()
  const regionSelectors = regionOptions.map(
    row => row.regions.map(
      item => (
        <div className="regions-row" key={item.value}>
          <Checkbox
            checked={props.value.indexOf(item.value) > -1}
            onChange={e => props.onChange(item.value, e.target.checked)}
          >
            {t(item.label)}
          </Checkbox>
        </div>
      )
    )
  )

  return (
    <div className="regions-wrapper">
      { regionSelectors }
    </div>
  )
})

export default observer(function RegionSelector(props: IRegionSelectorProps) {
  const store = useLocalStore(LocalStore, props)

  return (
    <div className="comp-traffic-region-selector">
      <Popover trigger="click"
        placement="bottom"
        overlayClassName="traffic-region-selector-popover"
        onVisibleChange={(visible: boolean) => !visible && store.confirmChange()}
        content={
          <>
            <AreaFilter
              value={store.hasAllRegions}
              onChange={store.handleAreaChange}
            />
            <Regions
              value={store.selectedRegions}
              onChange={store.handleRegionChange}
            />
          </>
        }
      >
        <Button type="ghost" className="region-selector-btn">{ store.summary }</Button>
      </Popover>
    </div>
  )
})
