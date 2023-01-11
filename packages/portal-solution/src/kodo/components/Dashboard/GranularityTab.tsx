/**
 * @file component GranularityTab 粒度选择
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Radio } from 'react-icecream/lib'
import { RadioChangeEvent } from 'react-icecream/lib/radio'

import { Granularity, granularityTextMap } from 'kodo/constants/date-time'

export interface IProps {
  value: Granularity
  granularities: Granularity[]
  className?: string
  onChange?(value: Granularity): void
}

export default observer(function GranularityTab(props: IProps) {

  const { onChange, value, granularities, className } = props

  return (
    <Radio.Group
      className={className}
      onChange={(e: RadioChangeEvent) => onChange!(e.target.value)}
      value={value}
    >
      {
        granularities && granularities.map(key => (
          <Radio.Button key={key} value={key}>
            {granularityTextMap[key]}
          </Radio.Button>
        ))
      }
    </Radio.Group>
  )
})
