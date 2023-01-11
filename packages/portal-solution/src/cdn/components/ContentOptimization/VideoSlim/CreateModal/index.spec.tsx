/**
 * @desc cases for video slim create modal component
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'portal-base/common/utils/store'
import { ToasterStore } from 'portal-base/common/toaster'

import { createRendererWithRouter } from 'test'

import { LocalStore } from './store'
import { AddFileMode } from './form'
import CreateModalWithStore, { CreateModalInner } from '.'

const renderer = createRendererWithRouter()

const mockedDomain = 'foo.com'
const mockedFn = jest.fn()
const modalProps = {
  visible: true,
  onCancel: mockedFn,
  onSubmit: mockedFn
}

it('renders correctly', () => {
  const tree = renderer.createWithAct(
    <CreateModalWithStore
      domain={mockedDomain}
      {...modalProps}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with given store', () => {

  const TestCreateModal = observer(function _TestCreateModal() {
    const mockedStore = useLocalStore(LocalStore, {
      domain: mockedDomain,
      ...modalProps
    })
    const toasterStore = useInjection(ToasterStore)

    mockedStore.form.$.addFileMode.onChange(AddFileMode.Specific)

    return (
      <CreateModalInner
        store={mockedStore}
        toasterStore={toasterStore}
        {...modalProps}
      />
    )
  })

  const tree = renderer.createWithAct(
    <TestCreateModal />
  ).toJSON()

  expect(tree).toMatchSnapshot()
})
