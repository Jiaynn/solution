import React from 'react'
import Table from 'react-icecream/lib/table'

export interface IConfigInfo {}

export default function ConfigTable(props: {
  configList: IConfigInfo[]
  loading: boolean
  renderOperations: (_: any, record: any, index: number) => { props: object, children: JSX.Element } | JSX.Element
}) {
  const { configList, loading, renderOperations } = props
  return (
    <Table className="content-config-table" dataSource={configList} loading={loading} rowKey="name" pagination={false}>
      <Table.Column title="配置项" key="name" dataIndex="name" width="120px" />
      <Table.Column title="描述" key="desc" dataIndex="desc" />
      <Table.Column title="当前配置" key="value" dataIndex="value" width="240px" />
      <Table.Column title="操作" key="op" render={renderOperations} width="180px" />
    </Table>
  )
}
