/**
 * @file cases for ipTypes config component
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'

import { RendererUtils as Renderer } from 'test'

import mockDomainDetail from 'cdn/test/domain-detail-mock'

import { GeoCover, IpTypes, OperatingState, OperationType } from 'cdn/constants/domain'

import IpTypesConfigBlock from './IpTypesConfigBlock'

const domain = mockDomainDetail()

const noop = () => {}

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <IpTypesConfigBlock domain={domain} onConfigOk={noop} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with geoCover is foreign', () => {
  const domainDetail = {
    ...domain,
    geoCover: GeoCover.Foreign,
    ipTypes: IpTypes.IPv4
  }

  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <IpTypesConfigBlock domain={domainDetail} onConfigOk={noop} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with update ipv6 processing', () => {
  const domainDetail = {
    ...domain,
    operationType: OperationType.UpdateIPv6,
    operatingState: OperatingState.Processing
  }

  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <IpTypesConfigBlock domain={domainDetail} onConfigOk={noop} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
