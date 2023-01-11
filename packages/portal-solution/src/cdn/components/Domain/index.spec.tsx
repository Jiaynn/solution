import React from 'react'
import { RouterStore } from 'portal-base/common/router'

import { createRendererWithRouter, createDcdnRendererWithRouter } from 'test'

import DomainManage from '.'

const renderer = createRendererWithRouter()
const dcdnRenderer = createDcdnRendererWithRouter()

it('renders correctly', () => {
  const routerStore = renderer.inject(RouterStore)
  routerStore.push('/domain/overview')
  const tree = renderer.create(
    <DomainManage />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders dcdn correctly', () => {
  const routerStore = dcdnRenderer.inject(RouterStore)
  routerStore.push('/domain/overview')
  const tree = dcdnRenderer.create(
    <DomainManage />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
