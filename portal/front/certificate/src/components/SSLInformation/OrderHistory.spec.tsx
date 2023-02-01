/**
 * @file test cases for component OrderHistory in SSLInformation
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'

import OrderHistory from './OrderHistory'

const orderId = '123'
const originDomains = [
  'test-1.qiniu.io',
  'test-1-1.qiniu.io',
  'test-1-2.qiniu.io'
]
const orders = [{
  orderid: '599d67e8f9537d17fc000001',
  state: 1,
  reject_reason: '',
  dnsnames: 'test-1-3.qiniu.io,test-1-1.qiniu.io,*.test-1-4.qiniu.io,*.test-1-5.qiniu.io,*.test-1-6.qiniu.io,test-1-2.qiniu.io',
  certID: '599e3d5c0c3ca4d80e000001',
  trade_order_id: 'be341249df108cb23c312ae62b6565cd',
  create_time: 1503487976
}, {
  orderid: '599d3c35f9537d241f000001',
  state: 15,
  reject_reason: '',
  dnsnames: '*.test-1-8.qiniu.io,*.test-1-9.qiniu.io,test-1-3.qiniu.io,test-1-1.qiniu.io,test-1-2.qiniu.io,*.test-1-7.qiniu.io',
  certID: '',
  trade_order_id: '3dcaf04c357c577a857f3ffadc555f9b',
  create_time: 1503476789
}, {
  orderid: '599c0675f9537d3f4c000004',
  state: 2,
  reject_reason: '',
  dnsnames: '*.test-1-5.qiniu.io,*.test-1-6.qiniu.io,test-1-1.qiniu.io,test-1-2.qiniu.io,test-1-3.qiniu.io,*.test-1-4.qiniu.io',
  certID: '',
  trade_order_id: '10b4945abe2e627db646b3c5226a4e50',
  create_time: 1503397493
}, {
  orderid: '599bd168f9537d2217000001',
  state: 1,
  reject_reason: '',
  dnsnames: 'test-1-1.qiniu.io,test-1-2.qiniu.io,test-1-3.qiniu.io',
  certID: '599bf377f9537d2217000002',
  trade_order_id: '',
  create_time: 1503383912
}
]

it('renders replace order info correctly', () => {
  const renderer = new Renderer()
  const updateDns = (data: string[]) => console.log(data)
  const updateCertID = (data: string) => console.log(data)
  const tree = renderer.create(
    <OrderHistory
      orderid={orderId}
      sslBrand="DigiCert"
      originDomains={originDomains}
      orders={orders}
      updateParentDnsNames={updateDns}
      updateParentCertID={updateCertID} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders only reissue order correctly', () => {
  const renderer = new Renderer()
  const updateDns = (data: string[]) => console.log(data)
  const updateCertID = (data: string) => console.log(data)

  const dvReplaceOrders = [{
    orderid: '599bd168f9537d2217000001',
    state: 1,
    reject_reason: '',
    dnsnames: '',
    certID: '599bf377f9537d2217000002',
    trade_order_id: '',
    create_time: 1503383912,
    auth_method: 'FILE',
    auth_array: [{
      AuthKey: 'test-dv.qbox.net',
      AuthValue: 'abcdedcba'
    }]
  }]
  const tree = renderer.create(
    <OrderHistory
      orderid={orderId}
      sslBrand="TrustAsia"
      originDomains={['test-dv.qbox.net']}
      orders={dvReplaceOrders}
      updateParentDnsNames={updateDns}
      updateParentCertID={updateCertID} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
