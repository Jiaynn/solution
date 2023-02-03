/**
 * @file test cases for component SSLOverview index
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'
import { StatusRenderer, OrderOperationsRenderer, CertOperationsRenderer } from './ColumnRenderers'
import { IOrderInfo, ICertInfo, OrderType } from '../../apis/ssl'
import { SSLDomainType, ProductShortName, CertStatus } from '../../constants/ssl'

const templateOrder: IOrderInfo = {
  auth: { AuthKey: '', AuthValue: '', Domain: '' },
  auth_array: [],
  cert_name: '',
  common_name: '',
  create_time: 1550108878,
  last_modify_time: 1550108879,
  not_after: 0,
  not_before: 0,
  orderParentId: '',
  orderType: OrderType.Normal,
  orderid: '5c64c8cef9537d3d2a0000f0',
  org_organization_name: '',
  product_short_name: ProductShortName.SecureSiteOV,
  product_type: SSLDomainType.Single,
  provider_renewable: false,
  reject_reason: '',
  state: 8,
  trade_order_id: '83b3b79f3802894efd6dec0c0e452e5b',
  upload_confirm_letter: false,
  isPaid: false,
  oneKeyFreeCert: false,
  auto_renew: false,
  renewable: false
}

const templateCert: ICertInfo = {
  certid: '5c3ff02ef9537d3d2a0000e9',
  common_name: 'pro-0117.qbox.net',
  create_time: 1547694126,
  dnsnames: [],
  name: 'pro-0117.qbox.net',
  not_after: 1556352000,
  not_before: 1547712000,
  orderid: '5c3fee76f9537d3d2a0000e8',
  product_short_name: ProductShortName.TrustAsiaTLSC1,
  cert_type: 'dv',
  product_type: SSLDomainType.Single,
  state: CertStatus.None,
  child_order_id: '',
  auto_renew: false,
  renewable: false
}

describe('not paid order for', () => {
  const renderer = new Renderer()
  it('StatusRenderer renders correctly', () => {
    const tree = renderer.create(
      <StatusRenderer record={templateOrder} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('OrderOperationsRenderer renders correctly', () => {
    const tree = renderer.create(
      <OrderOperationsRenderer record={templateOrder} doOperation={jest.fn()} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

})

describe('not paid free order ', () => {
  const renderer = new Renderer()
  const order = { ...templateOrder, product_short_name: ProductShortName.TrustAsiaTLSC1 }
  it('StatusRenderer renders correctly', () => {
    const tree = renderer.create(
      <StatusRenderer record={order} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('OrderOperationsRenderer renders correctly', () => {
    const tree = renderer.create(
      <OrderOperationsRenderer record={order} doOperation={jest.fn()} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('to be completed order ', () => {
  const renderer = new Renderer()
  const order = { ...templateOrder, state: 9 }

  it('StatusRenderer renders correctly', () => {
    const tree = renderer.create(
      <StatusRenderer record={order} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('OrderOperationsRenderer renders correctly', () => {
    const tree = renderer.create(
      <OrderOperationsRenderer record={order} doOperation={jest.fn()} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('order pending', () => {
  const renderer = new Renderer()
  const order = { ...templateOrder, state: 2 }
  const confirmedOrder = { ...templateOrder, state: 2, upload_confirm_letter: true }

  it('StatusRenderer renders correctly', () => {
    const tree1 = renderer.create(
      <StatusRenderer record={order} />
    ).toJSON()
    expect(tree1).toMatchSnapshot()

    const tree2 = renderer.create(
      <StatusRenderer record={confirmedOrder} />
    ).toJSON()
    expect(tree2).toMatchSnapshot()
  })

  it('OrderOperationsRenderer renders correctly', () => {
    const tree1 = renderer.create(
      <OrderOperationsRenderer record={order} doOperation={jest.fn()} />
    ).toJSON()
    expect(tree1).toMatchSnapshot()

    const tree2 = renderer.create(
      <OrderOperationsRenderer record={confirmedOrder} doOperation={jest.fn()} />
    ).toJSON()
    expect(tree2).toMatchSnapshot()
  })
})

// TODO: add other orders' case

describe('CertOperationsRenderer renders correctly', () => {
  const renderer = new Renderer()
  it('with cert by order', () => {
    const tree = renderer.create(
      <CertOperationsRenderer rowid={0} record={templateCert} doOperation={jest.fn()} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('with cert by upload', () => {
    const tree = renderer.create(
      <CertOperationsRenderer rowid={0} record={{ ...templateCert, orderid: '' }} doOperation={jest.fn()} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
