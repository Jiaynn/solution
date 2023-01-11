/**
 * @file test cases for component SSLApply
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'
import { ProductShortName } from '../../constants/ssl'
import SSLApply from '.'

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <SSLApply shortName={ProductShortName.SecureSiteOV} years={1} limit={1} wildcardLimit={0} renew={false} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
