import React from 'react'
import { RouterStore } from 'portal-base/common/router'
import { LocalStorageStore } from 'portal-base/common/utils/storage'

import { createOemRendererWithRouter } from 'test'

import { localStorageKey } from 'cdn/constants/domain-hosting'
import DomainHosting from '.'

const renderer = createOemRendererWithRouter()

beforeAll(() => {
  const storageStore = renderer.inject(LocalStorageStore)
  storageStore.setItem(localStorageKey, true)
})

it('renders correctly', () => {
  const routerStore = renderer.inject(RouterStore)
  routerStore.push('/domain-hosting')
  const tree = renderer.createWithAct(
    <DomainHosting />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
