import React from 'react'
import { RouterStore } from 'portal-base/common/router'

import { createRendererWithRouter } from 'test'

import mockDomainDetail from 'cdn/test/domain-detail-mock'

import DomainStore from 'cdn/stores/domain'

import Routes from 'cdn/constants/routes'

import DomainCreateResult from '.'
import { CreateResult } from './store'

const domain = mockDomainDetail({ name: 'www.qiniu.com' })
const domain2 = { ...domain, name: 'foo.com' }
const domainType = domain.type

const renderer = createRendererWithRouter()

beforeAll(() => {
  const domainStore = renderer.inject(DomainStore)
  domainStore.setDomainDetail(domain)
  domainStore.setDomainDetail(domain2)
})

describe('DomainCreateResult', () => {
  it('renders correctly with no domain info', () => {
    const tree = renderer.create(
      <DomainCreateResult />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with all success', () => {
    const routerStore = renderer.inject(RouterStore)
    const routes = renderer.inject(Routes)
    routerStore.push(routes.domainCreateResult({
      domainType,
      results: [
        { name: domain.name, result: CreateResult.Success },
        { name: domain2.name, result: CreateResult.Success }
      ],
      createOptions: []
    }))

    const tree = renderer.create(
      <DomainCreateResult />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with all failed', () => {
    const routerStore = renderer.inject(RouterStore)
    const routes = renderer.inject(Routes)
    routerStore.push(routes.domainCreateResult({
      domainType,
      results: [
        { name: domain.name, result: CreateResult.Failed },
        { name: domain2.name, result: CreateResult.Failed }
      ],
      createOptions: []
    }))

    const tree = renderer.create(
      <DomainCreateResult />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with partial success', () => {
    const routerStore = renderer.inject(RouterStore)
    const routes = renderer.inject(Routes)
    routerStore.push(routes.domainCreateResult({
      domainType,
      results: [
        { name: domain.name, result: CreateResult.Failed },
        { name: domain2.name, result: CreateResult.Success }
      ],
      createOptions: []
    }))

    const tree = renderer.create(
      <DomainCreateResult />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
