/*
 * @file cases for domain conflict component
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { RouterStore } from 'portal-base/common/router'

import { createRendererWithRouter } from 'test'

import Routes from 'cdn/constants/routes'

import DomainConflict from '.'

const renderer = createRendererWithRouter()

beforeAll(() => {
  const routerStore = renderer.inject(RouterStore)
  const routes = renderer.inject(Routes)
  routerStore.push(routes.domainConflict('foo.com'))
})

it('renders correctly', () => {
  const tree = renderer.createWithAct(
    <DomainConflict />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
