/**
 * @file test cases for component SSLConfirmation
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'

import SSLConfirmation from '.'

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <SSLConfirmation id="123" />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
