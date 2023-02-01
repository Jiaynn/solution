/*
 * @file component Edit Company & Contact
 * @author Yao Jingtian <yncst233@gmail.com>
 */
import React from 'react'

import InfoBlock, { getDisplayData, InfoRowData } from '../common/InfoBlock'
import InfoCard from '../common/InfoCard'
import { countryData, provinceData } from '../../constants/province-city'
import LayoutBlock from '../common/LayoutBlock'
import { Company } from '../../stores/information-state'

export interface IContactProps {
  name: {
    firstName: string,
    lastName: string
  },
  position: string,
  telephone: string,
  email: string
}

export interface ICompanyContactProps {
  company: Company
  delegate: IContactProps
}

export function companyFormData2Display(company: Company): InfoRowData[] {
  const { area, department, landlinePhone, address, zipCode } = company
  const countryName = countryData[area.country - 1].tv
  const provinceName = area.country === 1 ? provinceData[area.province as number - 1].pv : countryName

  const displayMap: { [key: string]: string } = {
    部门: department,
    座机电话: landlinePhone,
    '国家/省份/城市': `${countryName}／${provinceName}／${area.city}`,
    地址: address
  }

  if (zipCode) {
    displayMap['邮编'] = zipCode
  }
  return getDisplayData(displayMap)
}

export function contactFormData2Display(contact: IContactProps): InfoRowData[] {
  const { position, telephone, email } = contact
  return getDisplayData({
    职位: position,
    电话: telephone,
    邮箱: email
  })
}

export default function CompanyContactShow(props: ICompanyContactProps) {
  const { company, delegate } = props

  return (
    <>
      <LayoutBlock title="公司信息" style={{ borderBottom: 'none', paddingBottom: '16px' }}>
        <InfoCard title={company.name}>
          <InfoBlock data={companyFormData2Display(company)} />
        </InfoCard>
      </LayoutBlock>
      <LayoutBlock title="联系人（授权代表）信息">
        <InfoCard title={`${delegate.name.lastName} ${delegate.name.firstName}`}>
          <InfoBlock data={contactFormData2Display(delegate)} />
        </InfoCard>
      </LayoutBlock>
    </>
  )
}
