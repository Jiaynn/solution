/*
 * @file component Cert of SSLOverview
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'

import Table from 'react-icecream/lib/table'
import { useLocalStore } from 'qn-fe-core/local-store'

import { sslType } from '../../../constants/ssl'
import { humanizeTime } from '../../../utils/base'
import { shortNameToInfo } from '../../../utils/certificate'
import { IOrderInfo } from '../../../apis/ssl'
import { StatusRenderer, OrderOperationsRenderer } from '../ColumnRenderers'
import DownloadCertModal from '../DownloadCertModal'
import StateStore from './store'
import Search from './Search'

import './style.less'

export interface IOrderProps {}

const { Column } = Table

export default observer(function _OrderOverview(_props: IOrderProps) {
  const store = useLocalStore(StateStore)
  return (
    <>
      <Search state={store.searchState} onSearch={() => store.updateSearchOptions()} />
      <Table
        dataSource={store.orders.slice()}
        pagination={store.pagination}
        rowKey={(record: IOrderInfo) => record.orderid}
        loading={store.isLoading}
      >
        <Column
          title="订单号"
          dataIndex="orderid"
          key="orders.orderid"
          render={orderid => orderid || '-'}
        />
        <Column
          title="订单时间"
          dataIndex="create_time"
          key="orders.create_time"
          render={create_time => humanizeTime(create_time)}
        />
        <Column
          title="修改时间"
          dataIndex="last_modify_time"
          key="orders.last_modify_time"
          render={last_modify_time => humanizeTime(last_modify_time)}
        />
        <Column
          title="证书通用名称"
          dataIndex="common_name"
          key="orders.common_name"
          render={common_name => common_name || '-'}
        />
        <Column
          title="证书备注名"
          dataIndex="cert_name"
          key="orders.cert_name"
          render={name => name || '-'}
        />
        <Column
          title="证书品牌"
          dataIndex="product_short_name"
          key="orders.brand"
          render={name => {
            if (!name) {
              return null
            }

            const info = shortNameToInfo(name)
            return (
              <div style={{ lineHeight: '20px' }}>
                {info.brand}<br />
                {sslType[info.certType] != null ? `${sslType[info.certType].text}(${sslType[info.certType].code})` : '--'}
              </div>
            )
          }}
        />
        <Column<IOrderInfo>
          title="订单状态"
          dataIndex="state"
          key="orders.state"
          render={(_, record) => <StatusRenderer key={record.orderid} record={record} />}
        />
        <Column<IOrderInfo>
          title="操作"
          key="orders.operations"
          render={(_, record) => (
            <OrderOperationsRenderer
              key={record.orderid}
              record={record}
              doOperation={info => store.handleOperation(info)}
            />
          )}
        />
      </Table>
      <DownloadCertModal store={store.downloadCertStore} />
    </>
  )
})
