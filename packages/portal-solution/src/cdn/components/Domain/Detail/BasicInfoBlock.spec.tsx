/*
 * @file cases for domain create component
 * @author nighca <nighca@live.cn>
 */

import React from 'react'

import { RendererUtils as Renderer } from 'test'

import mockDomainDetail from 'cdn/test/domain-detail-mock'

import BasicInfoBlock from './BasicInfoBlock'

const domain = mockDomainDetail()

const noop = () => {}

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <BasicInfoBlock domain={domain} hasIcp onRefresh={noop} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
