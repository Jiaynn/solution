/**
 * @file test cases for component UploadCertForm
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'
import UploadCertForm from './UploadCertForm'

const onUploaded = () => { console.log('uploaded') }
const onCancel = () => { console.log('canceled') }

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <UploadCertForm onUploaded={onUploaded} onCancel={onCancel} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
