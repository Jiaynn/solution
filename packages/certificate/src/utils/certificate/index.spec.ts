import moment from 'moment'

import {
  shortNameToInfo,
  getLatestDnsNames,
  hasRepeatItem,
  canAddDomain
} from './index'
import { sslMap, SSLDomainType, SslBrand, CertType } from '../../constants/ssl'
import { OrderType } from '../../apis/ssl'

const now = moment('2018-04-15').valueOf()

const MockDate = Date

MockDate.now = () => now
MockDate.parse = () => now
MockDate.UTC = () => now

global.Date = MockDate

it('transform shortNameToInfo correctly', () => {
  Object.keys(sslMap).forEach((sslBrand: SslBrand) => {
    Object.keys(sslMap[sslBrand]).forEach((sslType: CertType) => {
      const productShortName = sslMap[sslBrand][sslType]!.shortName
      const result = shortNameToInfo(productShortName)
      expect(result).toEqual({ brand: sslBrand, certType: sslType })
    })
  })
})

describe('transform getLatestDnsNames with replaceOrders correctly', () => {
  it('latest dnsnames is the last', () => {
    const orders = [{
      create_time: 1503838901,
      state: 1,
      dnsnames: '1.com'
    }, {
      create_time: 1503834001,
      state: 4,
      dnsnames: '2.com'
    }, {
      create_time: 1503934001,
      state: 1,
      dnsnames: '1.com,3.com,4.com,*.5.com'
    }]
    const result = getLatestDnsNames(orders)
    expect(result).toEqual([
      '1.com',
      '3.com',
      '4.com',
      '*.5.com'
    ])
  })

  it('latest dnsnames is the first', () => {
    const orders = [{
      create_time: 1503838901,
      state: 1,
      dnsnames: '1.com'
    }, {
      create_time: 1503834001,
      state: 4,
      dnsnames: '2.com'
    }, {
      create_time: 1503934001,
      state: 2,
      dnsnames: '1.com,3.com,4.com,*.5.com'
    }]
    const result = getLatestDnsNames(orders)
    expect(result).toEqual(['1.com'])
  })

  it('latest dnsnames is none with not completed orders', () => {
    const orders = [{
      create_time: 1503838901,
      state: 2,
      dnsnames: '1.com'
    }, {
      create_time: 1503834001,
      state: 4,
      dnsnames: '2.com'
    }, {
      create_time: 1503934001,
      state: 8,
      dnsnames: '1.com,3.com,4.com,*.5.com'
    }]
    const result = getLatestDnsNames(orders)
    expect(result).toEqual([])
  })

  it('latest dnsnames is none with empty orders', () => {
    const result = getLatestDnsNames([])
    expect(result).toEqual([])
  })
})

describe('hasRepeatItem works correctly', () => {
  it('for an array', () => {
    expect(hasRepeatItem([1, 2, 3])).toBe(false)
    expect(hasRepeatItem([1, 2, 2, 2, 3])).toBe(true)
  })

  it('for two arraies', () => {
    expect(hasRepeatItem([1, 2, 3], [4, 5, 6, 7])).toBe(false)
    expect(hasRepeatItem([1, 2, 2, 2, 3], [4, 3])).toBe(true)
  })
})

describe('canAddDomain works correctly', () => {
  it('for which can renew', () => {
    expect(canAddDomain({
      // now: moment('2018-04-15').valueOf(),
      notAfter: moment('2018-04-15').add(45, 'd').unix(),
      state: 1,
      productType: SSLDomainType.Multiple,
      orderType: OrderType.Normal
    })).toBe(true)
    expect(canAddDomain({
      // now: moment('2018-04-15').valueOf(),
      notAfter: -1,
      state: 1,
      productType: SSLDomainType.Multiple,
      orderType: OrderType.Normal
    })).toBe(true)
  })

  it('for cert which is free', () => {
    expect(canAddDomain({
      // now: moment('2018-04-15').valueOf(),
      notAfter: moment('2018-04-15').add(60, 'd').unix(),
      state: 2,
      productType: SSLDomainType.Multiple,
      orderType: OrderType.Normal
    })).toBe(false)
    expect(canAddDomain({
      // now: moment('2018-04-15').valueOf(),
      notAfter: moment('2018-04-15').add(60, 'd').unix(),
      state: 1,
      productType: SSLDomainType.Single,
      orderType: OrderType.Normal
    })).toBe(false)
    expect(canAddDomain({
      // now: moment('2018-04-15').valueOf(),
      notAfter: moment('2018-04-15').add(60, 'd').unix(),
      state: 2,
      productType: SSLDomainType.Multiple,
      orderType: OrderType.Replace
    })).toBe(false)
    expect(canAddDomain({
      // now: moment('2018-04-15').valueOf(),
      notAfter: 0,
      state: 2,
      productType: SSLDomainType.Multiple,
      orderType: OrderType.Normal
    })).toBe(false)
  })
})
