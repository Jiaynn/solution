import React from 'react'

import { RendererUtils as Renderer } from 'test'

import mockDomainDetail from 'cdn/test/domain-detail-mock'

import FreeCertInput from './index'

const domain = mockDomainDetail()

const freeCertInputProps = {
  value: true,
  needConfigureCname: true,
  onChange: jest.fn(),
  domain
}

const freeCertInputPropsNeedCname = {
  value: true,
  needConfigureCname: true,
  onChange: jest.fn(),
  domain
}

const freeCertInputPropsWithError = {
  value: true,
  needConfigureCname: true,
  onChange: jest.fn(),
  error: '测试错误',
  domain
}

const renderer = new Renderer()

it('free cert input render correctly', () => {
  const tree = renderer
    .createWithAct(<FreeCertInput {...freeCertInputProps} />)
    .toJSON()
  expect(tree).toMatchSnapshot()
})

it('free cert input render correctly need cname', () => {
  const tree = renderer
    .createWithAct(<FreeCertInput {...freeCertInputPropsNeedCname} />)
    .toJSON()
  expect(tree).toMatchSnapshot()
})

it('free cert input render correctly with error', () => {
  const tree = renderer
    .createWithAct(<FreeCertInput {...freeCertInputPropsWithError} />)
    .toJSON()
  expect(tree).toMatchSnapshot()
})
