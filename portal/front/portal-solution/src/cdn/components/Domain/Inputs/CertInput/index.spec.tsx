import React from 'react'
import { PROPS } from 'qn-fe-core/local-store'

import { createContainer, RendererUtils as Renderer } from 'test'
import CertInput, { LocalStore } from '.'

const storeProps = {
  domain: 'qiniu.com',
  value: 'true',
  onChange: jest.fn()
}

const storePropsWithError = {
  domain: 'qiniu.com',
  value: 'true',
  error: 'mortal error',
  onChange: jest.fn()
}

const cert = {
  id: '3213',
  not_before: '20111030',
  not_after: '20180330',
  dnsnames: ['qiniu.com', 'qiniu.io'],
  name: 'qiniu',
  cert_name: 'qiniu biz'
}

it('store update correctly', () => {
  const container = createContainer([
    LocalStore,
    { identifier: PROPS, value: storeProps }
  ])
  const store = container.get(LocalStore)
  const certs = [cert]
  store.updateCerts(certs)
  expect(store.certs).toEqual(certs)
})

const renderer = new Renderer()

it('renders correctly', () => {
  const tree = renderer.createWithAct(
    <CertInput {...storeProps} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with error', () => {
  const tree = renderer.createWithAct(
    <CertInput {...storePropsWithError} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
