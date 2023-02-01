/**
 * @file Financial Bill ListView Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import Table, { TableProps } from 'react-icecream/lib/table'

import { humanizeChargeType, humanizeUnitPrice, transformCentToYuan } from 'cdn/transforms/financial'
import { humanizeTraffic, humanizeBandwidth } from 'cdn/transforms/unit'

import { ChargeType } from 'cdn/constants/oem'

import { IBill } from 'cdn/apis/oem/financial'

export type Props = Omit<TableProps<IBill>, 'columns' | 'rowKey'>

export default function BillListView(props: Props) {
  const columns = [
    {
      title: '月份',
      dataIndex: 'month'
    },
    {
      title: '计费方式',
      render: (_: unknown, info: IBill) => (
        humanizeChargeType(info.chargeType, info.subChargeType)
      )
    },
    {
      title: '使用量',
      render: (_: unknown, info: IBill) => (
        info.chargeType === ChargeType.Traffic
          ? humanizeTraffic(info.usageAmount)
          : humanizeBandwidth(info.usageAmount)
      )
    },
    {
      title: '单价',
      render: (_: unknown, info: IBill) => (
        humanizeUnitPrice(info.unitPrice || 0, info.chargeType)
      )
    },
    {
      title: '金额（元）',
      render: (_: unknown, info: IBill) => (
        transformCentToYuan(info.monthCost || 0)
      )
    }
  ]

  return (
    <Table
      className="comp-bill-listview"
      rowKey="month"
      columns={columns}
      {...props}
    />
  )
}
