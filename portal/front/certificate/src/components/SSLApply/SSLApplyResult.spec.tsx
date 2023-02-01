/**
 * @file test cases for component SSLApplyResult
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */
import React from 'react'

import { RendererUtils as Renderer } from '../../utils/test'
import SSLApplyResult from './SSLApplyResult'

it('renders correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <SSLApplyResult orderid="123" type="query" />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders success correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <SSLApplyResult orderid="123" type="success" />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders warn correctly', () => {
  const renderer = new Renderer()
  const tree = renderer.create(
    <SSLApplyResult orderid="123" type="warn" />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
