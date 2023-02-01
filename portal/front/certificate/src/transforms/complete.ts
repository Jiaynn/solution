/*
 * @file complete transform
 * @author zhuhao <zhuhao@qiniu.com>
 */

import { IValue as CompanyFormValue } from '../components/SSLOverview/Info/Company/Form'
import { IValue as ContactFormValue } from '../components/SSLOverview/Info/Contact/Form'
import { IAreaValue } from '../components/common/AreaSelect'
import { SSLDomainType } from '../constants/ssl'
import { countryData, provinceData, cityData } from '../constants/province-city'

export function validateCompanyData(data: CompanyFormValue): boolean {
  return !!(
    data && data.name
    && data.division
    && data.country
    && data.province
    && data.city
    && data.address
    && data.postCode
    && data.phone
  )
}

export function humanizeAreaText(country: string, province: string, city: string) {
  const countryItem = countryData.find(item => item.tcode === country)
  return `${countryItem && countryItem.tv || '--'}/${province || '--'}/${city || '--'}`
}

export function validateContactData(data: ContactFormValue): boolean {
  return !!(
    data && data.lastName
    && data.firstName
    && data.position
    && data.phone
    && data.email
  )
}

export function isMultiDomain(productType?: SSLDomainType): boolean {
  return productType === SSLDomainType.Multiple
  || productType === SSLDomainType.MultipleWildcard
}

export interface IAreaFormData {
  country: string
  province: string
  city: string
}

export function areaValue2Api(value: IAreaValue): IAreaFormData {
  const country = countryData.find(item => item.tk === value.country)
  const province = provinceData.find(item => item.pk === value.province)
  const city = cityData.find(item => item.ck === value.city)
  return {
    country: country ? country.tcode : '',
    province: province ? province.pv : '',
    city: city ? city.cv : ''
  }
}

export function areaValue2Props(value: IAreaFormData): IAreaValue {
  const country = countryData.find(item => item.tcode === value.country)!
  const province = provinceData.find(item => item.pv === value.province)!
  const city = cityData.find(item => item.cv === value.city)!
  return {
    country: country && country.tk,
    province: province && province.pk,
    city: city && city.ck
  }
}
