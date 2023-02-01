/*
 * @file cases for domain create component
 * @author nighca <nighca@live.cn>
 */

import React from 'react'

import { RendererUtils as Renderer } from 'test'

import mockDomainDetail from 'cdn/test/domain-detail-mock'

import {
  OperatingState, operatingStateDescs, WorkflowTaskType,
  WorkflowTaskErrorCode, OperationType
} from 'cdn/constants/domain'

import DomainStateMessage from './DomainStateMessage'
import { domainDetailCtx } from './context'

const domain = mockDomainDetail()

it('renders correctly', () => {
  const renderer = new Renderer()
  const ctxValue = { domainDetail: domain, refreshDomainDetail: () => null }
  const tree = renderer.createWithAct(
    <domainDetailCtx.Provider value={ctxValue}>
      <DomainStateMessage />
    </domainDetailCtx.Provider>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with https conf processing', () => {
  const domainDetail = {
    ...domain,
    operationType: OperationType.ModifyHttpsConf,
    operatingState: OperatingState.Processing
  }
  const ctxValue = { domainDetail, refreshDomainDetail: () => null }
  const renderer = new Renderer()
  const tree = renderer.createWithAct(
    <domainDetailCtx.Provider value={ctxValue}>
      <DomainStateMessage />
    </domainDetailCtx.Provider>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with https cert process failed', () => {
  const domainDetail = {
    ...domain,
    operationType: OperationType.ModifyHttpsCert,
    operatingState: OperatingState.Failed,
    operatingStateDesc: operatingStateDescs.verifyHttpsCertFail
  }
  const ctxValue = { domainDetail, refreshDomainDetail: () => null }
  const renderer = new Renderer()

  const tree = renderer.createWithAct(
    <domainDetailCtx.Provider value={ctxValue}>
      <DomainStateMessage />
    </domainDetailCtx.Provider>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with redo workflow task', () => {
  const domainDetail = {
    ...domain,
    operatingState: OperatingState.Processing,
    operTaskId: 'Task6041d314f9537d4e57000004',
    operTaskType: WorkflowTaskType.All,
    operTaskErrCode: WorkflowTaskErrorCode.QpsLimit
  }
  const ctxValue = { domainDetail, refreshDomainDetail: () => null }
  const renderer = new Renderer()

  const tree = renderer.createWithAct(
    <domainDetailCtx.Provider value={ctxValue}>
      <DomainStateMessage />
    </domainDetailCtx.Provider>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with abandon workflow task', () => {
  const domainDetail = {
    ...domain,
    operatingState: OperatingState.Processing,
    operTaskId: 'Task6041d314f9537d4e57000004',
    operTaskType: WorkflowTaskType.Abandon,
    operTaskErrCode: WorkflowTaskErrorCode.FreeCertLimit
  }
  const ctxValue = { domainDetail, refreshDomainDetail: () => null }
  const renderer = new Renderer()

  const tree = renderer.createWithAct(
    <domainDetailCtx.Provider value={ctxValue}>
      <DomainStateMessage />
    </domainDetailCtx.Provider>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
