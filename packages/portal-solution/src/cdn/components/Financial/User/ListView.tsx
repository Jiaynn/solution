/**
 * @file Financial User ListView Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import Table, { TableProps } from 'react-icecream/lib/table'
import Button from 'react-icecream/lib/button'

import { humanizeChargeType, humanizeUnitPrice } from 'cdn/transforms/financial'

import { IFinancial } from 'cdn/apis/oem/financial'

export type Props = Omit<TableProps<IFinancial>, 'columns' | 'rowKey'> & {
  onEdit: (item: IFinancial) => void
  onShowHistory: (item: IFinancial) => void
  onShowCurrent: (item: IFinancial) => void
  onUpdateBill: (item: IFinancial) => void
}

export default function UserListView(props: Props) {
  const columns = [
    {
      title: '用户名',
      dataIndex: 'name'
    },
    {
      title: '邮箱',
      dataIndex: 'email'
    },
    {
      title: '计费方式',
      render: (_: unknown, info: IFinancial) => (
        info.chargeType
          ? humanizeChargeType(info.chargeType, info.subChargeType)
          : '--'
      )
    },
    {
      title: '单价',
      render: (_: unknown, info: IFinancial) => (
        info.chargeType
          ? humanizeUnitPrice(info.unitPrice, info.chargeType)
          : '--'
      )
    },
    {
      title: '操作',
      render: (_: unknown, info: IFinancial) => renderOperations(props, info)
    }
  ]

  return (
    <Table
      className="comp-financial-user-listview"
      rowKey="email"
      columns={columns}
      {...props}
    />
  )
}

function renderOperations(props: Props, info: IFinancial) {
  return (
    <>
      <Button type="link" onClick={() => props.onEdit(info)}>配置</Button>
      <Button type="link" disabled={!info.chargeType} onClick={() => props.onShowHistory(info)}>历史账单</Button>
      <Button type="link" disabled={!info.chargeType} onClick={() => props.onShowCurrent(info)}>本月账单</Button>
      <Button type="link" disabled={!info.chargeType} onClick={() => props.onUpdateBill(info)}>重新出账</Button>
    </>
  )
}
