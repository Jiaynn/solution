/**
 * @file test cases for component UploadLightboxForm for SSLConfirmation
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'
import UploadLightboxForm, { IUploadFormProps } from './UploadLightboxForm'

const props: IUploadFormProps = {
  orderid: '123',
  onCancel: () => { console.log('canceled') }
}

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <UploadLightboxForm {...props} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
