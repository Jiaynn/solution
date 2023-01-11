/**
 * @file test cases for component SSLInformation
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'
import CompanyContactShow, { IContactProps } from './CompanyContactShow'
import { Company } from '../../stores/information-state'

const company: Company = {
  name: 'alex',
  department: 'test',
  landlinePhone: '222',
  area: {
    country: 1,
    province: 2,
    city: 'sh'
  },
  address: 'address',
  zipCode: '200000'
}
const delegate: IContactProps = {
  name: {
    lastName: 'Lee', // 姓氏
    firstName: 'll'
  },
  position: 'QA',
  telephone: '123',
  email: 'a@b.c'
}

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <CompanyContactShow
      company={company}
      delegate={delegate}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
