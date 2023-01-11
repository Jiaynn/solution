/**
 * @file component certificate period
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import Radio, { RadioChangeEvent } from 'react-icecream/lib/radio'

import { ProductShortName } from '../../constants/ssl'
import { getCertYearTipsByYear } from '../../utils/certificate'
import { DiscountsType } from '../../stores/apply-state'

export interface IProps {
  shortName: ProductShortName
  years: number[]
  discounts: DiscountsType
  value: number
  onChange: (v: number) => void
}

export default function CertificatePeriod(props: IProps) {

  const getDiscountTip = (year: number) => (
    props.discounts[year]
      ? (<span className="radio-tip">{props.discounts[year]} 折</span>)
      : null
  )

  const { onChange } = props
  const handleRaioChange = React.useCallback((e: RadioChangeEvent) => {
    onChange(e.target.value)
  }, [onChange])

  return (
    <Radio.Group
      size="small"
      value={props.value}
      onChange={handleRaioChange}
    >
      {
        props.years.map((year: number) => (
          <Radio key={year} value={year} className="ant-radio-border adv-radio radio-horizontal">
            <span className="radio-info">
              <span className="radio-text">
                {`${year}年`}
                {getCertYearTipsByYear(year)}
              </span>
              {getDiscountTip(year)}
            </span>
          </Radio>
        ))
      }
    </Radio.Group>
  )
}
