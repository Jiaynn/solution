/**
 * @file test cases for component App
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'

import App from '.'

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <App />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
