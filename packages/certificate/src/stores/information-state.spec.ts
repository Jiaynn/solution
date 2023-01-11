import InformationState from './information-state'
import { IOrderDetail, OrderType } from '../apis/ssl'
import { ProductShortName, SSLDomainType } from '../constants/ssl'
import { AuthMethodType } from '../constants/domain'

it('initial state should be correct', () => {
  const store = new InformationState()
  expect(store.newDomains).toEqual({
    commonName: '',
    dnsNames: [], // 域名（通用名称）
    memoName: '',    // 备注名
    authMethod: '', // TrustAsia证书 校验方式
    encrypt: '', // PRO类型和TrustAsia证书 加密方式
    record_type: undefined
  })

  expect(store.company).toEqual({
    name: '',
    department: '',
    landlinePhone: '',
    area: {
      country: -1,
      province: -1,
      city: ''
    },
    address: '',
    zipCode: ''
  })

  expect(store.delegate).toEqual({
    name: {
      lastName: '', // 姓氏
      firstName: ''
    },
    position: '',
    telephone: '',
    email: ''
  })
})

it('after fetch from api should be correct', () => {
  const store = new InformationState()

  const orderData: IOrderDetail = {
    admin_email: 'test@shanghai.com',
    admin_firstName: '上',
    admin_lastName: '海',
    admin_phone: '12345678901',
    admin_title: '上海证书',
    auth_array: [{
      AuthKey: '/.well-known/pki-validation/fileauth.txt',
      AuthValue: '201901031832290ultr64rldpmcko9ayttd4hry1y1x99ghqwib5v6yyn73yroqf',
      Domain: 'https-advanced-0103.coolplayer.net'
    }],
    auth_method: AuthMethodType.File,
    certID: '5c2f369ef9537d3d2a0000c5',
    cert_name: 'https-advanced-0103.coolplayer.net',
    common_name: 'https-advanced-0103.coolplayer.net',
    create_time: 1546597563,
    dns_names: 'a.coolplayer.net,b.coolplayer.net',
    encrypt: 'RSA',
    limit: 0,
    orderParentId: '',
    orderType: OrderType.Normal,
    orderid: '',
    org_addressLine1: '上海',
    org_city: '上海',
    org_country: 'CN',
    org_division: '新区两修路',
    org_organization_name: '上海浦东',
    org_phone: '012-12345678',
    org_postalCode: '123456',
    org_region: '上海',
    product_short_name: ProductShortName.TrustAsiaTLSC1,
    product_type: SSLDomainType.Single,
    provider_renewable: true,
    reject_reason: '',
    state: 14,
    trade_order_id: '',
    upload_confirm_letter: false,
    wildcard_limit: 0,
    years: 1,
    isPaid: false,
    auth: {
      AuthKey: '',
      AuthValue: '',
      Domain: ''
    },
    last_modify_time: 0,
    not_after: 0,
    not_before: 0,
    oneKeyFreeCert: false,
    auto_renew: false,
    renewable: false
  }

  store.updateCompanyContact(orderData)
  store.updateNewDomains(orderData)

  expect(store.newDomains).toEqual({
    commonName: 'https-advanced-0103.coolplayer.net',
    dnsNames: ['a.coolplayer.net', 'b.coolplayer.net'],
    memoName: 'https-advanced-0103.coolplayer.net',
    authMethod: 'FILE',
    encrypt: 'RSA'
  })

  expect(store.company).toEqual({
    name: '上海浦东',
    department: '新区两修路',
    landlinePhone: '012-12345678',
    area: {
      country: 1,
      province: 2,
      city: '上海'
    },
    address: '上海',
    zipCode: '123456'
  })

  expect(store.delegate).toEqual({
    name: {
      lastName: '海',
      firstName: '上'
    },
    position: '上海证书',
    telephone: '12345678901',
    email: 'test@shanghai.com'
  })
})
