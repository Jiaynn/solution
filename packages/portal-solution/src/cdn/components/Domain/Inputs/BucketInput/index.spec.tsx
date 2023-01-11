/*
 * @file cases for bucket input component
 * @author nighca <nighca@live.cn>
 */

import React from 'react'

import { RendererUtils as Renderer } from 'test'

import mockDomainDetail from 'cdn/test/domain-detail-mock'

import { IBucketSimplified } from 'cdn/apis/bucket'

import DomainBucketInput, { SortType, createState } from '.'
import DomainApis from 'cdn/apis/domain'

const domain = mockDomainDetail()

const buckets: IBucketSimplified[] = [{ name: 'zzzz', zone: 'z0', private: 1, protected: 0, last_operation: '', last_operation_extra: '', last_operation_at: '2018-06-21T10:24:40.965210971+08:00', fop_access_white_list: [], files: 0, storage: 0, line_files: 0, line_storage: 0, right: '', share: false }, { name: 'nao-1', zone: 'na0', private: 0, protected: 0, last_operation: '', last_operation_extra: '', last_operation_at: '2018-06-21T10:24:40.965217486+08:00', fop_access_white_list: [], files: 0, storage: 0, line_files: 0, line_storage: 0, right: '', share: false }, { name: 'hahahha', zone: 'z0', private: 0, protected: 0, last_operation: '', last_operation_extra: '', last_operation_at: '2018-06-21T10:24:40.965222651+08:00', fop_access_white_list: [], files: 0, storage: 0, line_files: 0, line_storage: 0, right: 'RW', share: true }, { name: 'abcd', zone: 'z0', private: 0, protected: 0, last_operation: '', last_operation_extra: '', last_operation_at: '2018-06-21T10:24:40.965223468+08:00', fop_access_white_list: [], files: 0, storage: 0, line_files: 0, line_storage: 0, right: 'RW', share: false }, { name: 'dfaf', zone: 'z1', private: 0, protected: 0, last_operation: '', last_operation_extra: '', last_operation_at: '2018-06-21T10:24:40.965225036+08:00', fop_access_white_list: [], files: 0, storage: 0, line_files: 0, line_storage: 0, right: '', share: false }]

it('renders correctly', () => {
  const renderer = new Renderer()
  const domainApis = renderer.inject(DomainApis)
  const tree = renderer.createWithAct(
    <DomainBucketInput
      domains={[domain]}
      buckets={buckets}
      disabled={false}
      state={createState(null, { domainApis, getDomains: () => ([domain]) })}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with disabled: true', () => {
  const renderer = new Renderer()
  const domainApis = renderer.inject(DomainApis)
  const tree = renderer.createWithAct(
    <DomainBucketInput
      domains={[domain]}
      buckets={buckets}
      disabled
      state={createState(null, { domainApis, getDomains: () => ([domain]) })}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with value', () => {
  const renderer = new Renderer()
  const domainApis = renderer.inject(DomainApis)
  const tree = renderer.createWithAct(
    <DomainBucketInput
      domains={[domain]}
      buckets={buckets}
      disabled={false}
      state={createState(buckets[1].name, { domainApis, getDomains: () => ([domain]), modify: false })}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with invalid value', () => {
  const renderer = new Renderer()
  const domainApis = renderer.inject(DomainApis)
  const tree = renderer.createWithAct(
    <DomainBucketInput
      domains={[domain]}
      buckets={buckets}
      disabled={false}
      state={createState('BUCKET_NOT_EXIST', { domainApis, getDomains: () => ([domain]), modify: false })}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with error', () => {
  const renderer = new Renderer()
  const domainApis = renderer.inject(DomainApis)
  const state = createState('BUCKET_NOT_EXIST', { domainApis, getDomains: () => ([domain]), modify: false })
  state.setError('bucket 不可为空')

  const tree = renderer.createWithAct(
    <DomainBucketInput
      domains={[domain]}
      buckets={buckets}
      disabled={false}
      state={state}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with sort', () => {
  const renderer = new Renderer()
  const domainApis = renderer.inject(DomainApis)
  const tree = renderer.createWithAct(
    <DomainBucketInput
      domains={[domain]}
      buckets={buckets}
      disabled={false}
      sort={SortType.Lexic}
      state={createState(null, { domainApis, getDomains: () => ([domain]) })}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
