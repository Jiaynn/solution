/**
 * @file test cases for component SSLOverview index
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'
import DownloadCertForm from './DownloadCertForm'

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <DownloadCertForm certId="foo" brand="TrustAsia" sslType="dv" />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
