/**
 * @file cases for GeoCoverConfig component
 * @author hejinxin <hejinxin@qiniu.com>
 */

import React from 'react'

import { RendererUtils as Renderer } from 'test'

import mockDomainDetail from 'cdn/test/domain-detail-mock'

import GeoCoverConfigBlock from './GeoCoverConfigBlock'

const domain = mockDomainDetail()

const noop = () => {}

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <GeoCoverConfigBlock domain={domain} hasIcp onConfigOk={noop} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with no icp record', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <GeoCoverConfigBlock domain={domain} hasIcp={false} onConfigOk={noop} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
