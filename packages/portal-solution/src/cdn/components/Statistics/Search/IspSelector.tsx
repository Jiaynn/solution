/*
 * @file 运营商选择
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import Select from 'react-icecream/lib/select'
import { TranslateFn, useTranslation } from 'portal-base/common/i18n'

import { humanizeIsp } from 'cdn/transforms/isp'

import { isps } from 'cdn/constants/isp'

export interface IProps {
  value: string
  onChange: (v: string) => void
}

const getOptions = (t: TranslateFn) => (
  [
    isps.all,
    isps.telecom,
    isps.unicom,
    isps.mobile,
    isps.tietong,
    isps.cernet,
    isps.drpeng,
    isps.others
  ].map(
    isp => (
      <Select.Option key={isp} value={isp}>{t(humanizeIsp(isp))}</Select.Option>
    )
  )
)

export default function IspSelector(props: IProps) {
  const t = useTranslation()

  return (
    <Select
      value={props.value}
      onChange={props.onChange}
      style={{ width: 240 }}
    >
      {getOptions(t)}
    </Select>
  )
}
