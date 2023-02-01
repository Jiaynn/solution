/**
 * @file test cases for component SSLInformation
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'

import { RendererUtils as Renderer } from '../../utils/test'
import SSLInformation from '.'
import OrderInfo from '../../stores/order-info'
import CertInfo from '../../stores/cert-info'
import { ProductShortName, SearchType, SSLDomainType } from '../../constants/ssl'
import SslApis, { OrderType } from '../../apis/ssl'
import { AuthMethodType } from '../../constants/domain'

const orderId = '123'

const certInfo = new CertInfo()
certInfo.updateCertData({
  certid: '596dcf3f4ae08c3a79000001',
  name: 'coco-07.coolplayer.net',
  common_name: 'coco-07.coolplayer.net',
  dnsnames: [
    'coco-07.coolplayer.net'
  ],
  pri: '',
  ca: '',
  create_time: 1500368703,
  not_before: 1500336000,
  not_after: 1531958399,
  orderid: '596dca4af9537d2612000004',
  product_short_name: 'TrustAsiaTLSC1',
  product_type: 'single',
  encrypt: 'ECDSA',
  enable: true
})

it('renders DV rejected orderinfo correctly', () => {
  const renderer = new Renderer()

  const SSLInfomationWrap = observer(function _SSLInfomationWrap() {
    const sslApis = useInjection(SslApis)
    const orderInfo = new OrderInfo(sslApis)
    orderInfo.updateApplyStateData({
      product_short_name: ProductShortName.TrustAsiaTLSWildcardC1,
      years: 1,
      limit: -1,
      wildcard_limit: 1,
      common_name: '*.coolplayer.net',
      org_addressLine1: '亮秀路',
      org_city: '上海',
      org_region: '上海',
      org_postalCode: '200201',
      org_country: 'CN',
      admin_firstName: 'Li',
      admin_lastName: 'Lihua',
      admin_phone: '15221194578',
      admin_email: 'leerudy123@gmail.com',
      org_organization_name: '问',
      org_division: '桦',
      org_phone: '029-1223444',
      orderid: '',
      admin_title: 'QA',
      dns_names: '',
      cert_name: '*.coolplayer.net',
      auth_array: [
        {
          AuthKey: '/.well-known/pki-validation/fileauth.txt',
          AuthValue: '2017062214161311na26tne1co29peby9ehpkr0w4amc0yfl194t6m42gwa0stjr',
          Domain: 'coolplayer.net'
        }
      ],
      auth_method: AuthMethodType.File,
      encrypt: 'RSA',
      reject_reason: 'DNS验证超时',
      product_type: SSLDomainType.Wildcard,
      state: 4,
      orderType: OrderType.Normal,
      orderParentId: '',
      upload_confirm_letter: true,
      create_time: 1502265402,
      certID: '',
      isPaid: false,
      auth: {
        AuthKey: '',
        AuthValue: '',
        Domain: ''
      },
      trade_order_id: '',
      provider_renewable: true,
      last_modify_time: 0,
      not_after: 0,
      not_before: 0,
      oneKeyFreeCert: false,
      auto_renew: false,
      renewable: false
    })

    return <SSLInformation itemid={orderId} type="order" orderInfo={orderInfo} />
  })

  const tree = renderer.create(
    <SSLInfomationWrap />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders certinfo correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <SSLInformation itemid={orderId} type={SearchType.Cert} certInfo={certInfo} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with no info', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <SSLInformation itemid={orderId} type="order" />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
