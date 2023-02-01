/**
 * @file test cases for component SSLOverview index
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'
import SSLOverview from '.'

jest.mock('rc-tabs/lib/ScrollableInkTabBar', () => () => null)

it('renders order correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <SSLOverview />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
