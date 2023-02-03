/**
 * @file test cases for component Layout
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'

import Layout from '.'

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <Layout />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
