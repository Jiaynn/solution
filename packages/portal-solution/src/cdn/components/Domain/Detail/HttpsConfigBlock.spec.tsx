/*
 * @file cases for domain create component
 * @author nighca <nighca@live.cn>
 */

import React from 'react'

import { RendererUtils as Renderer } from 'test'

import mockDomainDetail from 'cdn/test/domain-detail-mock'
import mockCertInfo from 'cdn/test/cert-info-mock'

import HttpsConfigBlock from './HttpsConfigBlock'

const domain = mockDomainDetail()
const certInfo = mockCertInfo()

const doNothing = () => null

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <HttpsConfigBlock domain={domain} certInfo={certInfo} loading={false} handleConfigure={doNothing} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with loading: true', () => {
  const renderer = new Renderer()

  const tree = renderer.createWithAct(
    <HttpsConfigBlock domain={domain} certInfo={certInfo} loading handleConfigure={doNothing} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
