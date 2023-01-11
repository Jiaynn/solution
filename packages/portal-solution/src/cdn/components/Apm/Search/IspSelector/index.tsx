/*
 * @file 运营商选择
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import Checkbox from 'react-icecream/lib/checkbox'
import Button from 'react-icecream/lib/button'
import { useLocalStore } from 'portal-base/common/utils/store'
import { useTranslation } from 'portal-base/common/i18n'

import { humanizeIsp } from 'cdn/transforms/isp'

import Popover from 'cdn/components/common/Popover'

import LocalStore, { ispOptions, IProps } from './store'

export interface IIspListProps {
  selectedIsps: string[]
  onChange: (v: string) => void
}

function IspList(props: IIspListProps) {
  const t = useTranslation()
  const options = ispOptions.map(
    ispOption => (
      <li key={ispOption.value} style={{ height: '32px', lineHeight: '32px' }}>
        <Checkbox
          checked={props.selectedIsps.indexOf(ispOption.value) >= 0}
          onChange={() => props.onChange(ispOption.value)}
        >
          {t(humanizeIsp(ispOption.value))}
        </Checkbox>
      </li>
    )
  )

  return (
    <ul className="domain-list-content">{ options }</ul>
  )
}

export default observer(function IspSelector(props: IProps) {
  const store = useLocalStore(LocalStore, props)
  const { selectedIsps, confirmChange, onIspChange, summary } = store

  return (
    <div className="domain-selector-wrapper">
      <Popover trigger="click"
        placement="bottomLeft"
        overlayClassName="domain-selector"
        onVisibleChange={(visible: boolean) => !visible && confirmChange()}
        content={
          <IspList
            selectedIsps={selectedIsps}
            onChange={isp => onIspChange(isp)}
          />
        }
      >
        <Button type="ghost" className="domain-selector-btn">
          {summary}
        </Button>
      </Popover>
    </div>
  )
})
