/*
 * @file cases for bs auth config input component
 * @author nighca <nighca@live.cn>
 */

import React from 'react'

import { RendererUtils as Renderer } from 'test'

import mockDomainDetail from 'cdn/test/domain-detail-mock'

import DomainBsAuthConfigInput, { createState, getDefaultBsAuthConfig, IBsAuthConfig } from '.'

const domain = mockDomainDetail()

const value: IBsAuthConfig = {
  ...getDefaultBsAuthConfig(),
  enable: true
}

it('renders correctly', () => {
  const state = createState(value, () => false)
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <DomainBsAuthConfigInput
      domain={domain}
      isQiniuPrivate={false}
      modify={false}
      state={state}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with isQiniuPrivate: true', () => {
  const state = createState(value, () => false)
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <DomainBsAuthConfigInput
      domain={domain}
      isQiniuPrivate
      modify={false}
      state={state}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with modify: true', () => {
  const state = createState(value, () => false)
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <DomainBsAuthConfigInput
      domain={domain}
      isQiniuPrivate={false}
      modify
      state={state}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with error', () => {
  const renderer = new Renderer()

  const state = createState(value, () => false)

  state.$.userAuthUrl.setError('error of userAuthUrl')
  state.$.parameters.setError('error of userAuthUrl')
  state.$.successStatusCode.setError('error of userAuthUrl')
  state.$.failureStatusCode.setError('error of userAuthUrl')
  state.$.timeLimit.setError('error of userAuthUrl')

  const tree = renderer.createWithAct(
    <DomainBsAuthConfigInput
      domain={domain}
      isQiniuPrivate={false}
      modify={false}
      state={state}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with disabled', () => {
  const renderer = new Renderer()

  const state = createState(value, () => false)
  const tree = renderer.createWithAct(
    <DomainBsAuthConfigInput
      domain={domain}
      isQiniuPrivate={false}
      modify={false}
      state={state}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
