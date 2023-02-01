/**
 * @file CoefficientTip  Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'

import { transformCoefficientForEdit } from 'cdn/transforms/financial'

import { maxChargeCoefficient, minChargeCoefficient } from 'cdn/constants/oem'

export interface IProps {
  isFirst: boolean
}

export default function CoefficientTip({ isFirst }: IProps) {
  const tipItems = [
    <p key="fist-tip">
      设置的计费系数超过一般预期（{minChargeCoefficient}-{maxChargeCoefficient}），请再次确认！
    </p>
  ]

  // 非首次设置计费系数
  if (!isFirst) {
    tipItems.push(
      <p key="extra-tip" style={{ marginTop: '16px' }}>
        修改计费项从当前月开始生效，若需修改历史账单请使用重新出账功能，请确认是否修改！
      </p>
    )
  }

  return (
    <div className="comp-ceofficient-tip">
      {...tipItems}
    </div>
  )
}

export function isNormalCoefficient(val: number) {
  const formatVal = transformCoefficientForEdit(val)
  return formatVal <= maxChargeCoefficient && formatVal >= minChargeCoefficient
}
