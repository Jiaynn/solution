/**
 * @file component OverviewDateRangeTab
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Radio } from 'react-icecream/lib'

import { valuesOfEnum } from 'kodo/utils/ts'

export interface IProps {
  value?: OverviewDateRangeType
  onChange(value: OverviewDateRangeType): void
  disabledOptions?: OverviewDateRangeType[] // 屏蔽的选项
}

export enum OverviewDateRangeType {
  SevenDays = 'sevenDays',
  FifteenDays = 'fifteenDays',
  CurrentMonth = 'currentMonth',
  LastMonth = 'lastMonth'
}

export const overviewDateRangeTextMap = {
  [OverviewDateRangeType.SevenDays]: '7天',
  [OverviewDateRangeType.FifteenDays]: '15天',
  [OverviewDateRangeType.CurrentMonth]: '本月',
  [OverviewDateRangeType.LastMonth]: '上月'
}

export default observer(
  function OverviewDateRangeTab(props: IProps): React.ReactElement<IProps> {
    return (
      <Radio.Group
        value={props.value}
        buttonStyle="none"
        onChange={e => props.onChange(e.target.value)}
      >
        {
          valuesOfEnum(OverviewDateRangeType)
            .filter(item => !(props.disabledOptions && props.disabledOptions.includes(item)))
            .map(value => (
              <Radio.Button key={value} value={value}>{overviewDateRangeTextMap[value]}</Radio.Button>
            ))
        }
      </Radio.Group>
    )
  }
)
