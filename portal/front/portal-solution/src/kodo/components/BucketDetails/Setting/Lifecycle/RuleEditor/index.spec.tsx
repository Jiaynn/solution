/**
 * @author: corol
 * @github: github.com/huangbinjie
 * @created: Wed Jun 12 2019
 *
 * Copyright (c) 2019 Qiniu
 */

// // TODO: 正确的配置测试的条件
// jest.mock('kodo/stores/config')

// import * as React from 'react'
// import { renderer } from 'portal-base/common/utils/test'
// import { createMemoryHistory } from 'history'

// import routerStore from 'portal-base/common/stores/router'

// import RuleEditor from '.'
// import RuleEditorStore from './store'

// const history = createMemoryHistory()
// jest.mock('react-icecream/lib/drawer', () => (({ children }) => <div>{children}</div>))

// beforeAll(() => {
//   routerStore.bindHistory(history)
// })

// it('render with versioning true', () => {
//   const tree = renderer.create(
//     <RuleEditor store={new RuleEditorStore(() => [])} bucketName="test" onOk={noop as any} onClose={noop} />
//   ).toJSON()
//   expect(tree).toMatchSnapshot()
// })

// it('render with versioning false', () => {
//   const tree = renderer.create(
//     <RuleEditor store={new RuleEditorStore(() => [])} bucketName="test" onOk={noop as any} onClose={noop} />
//   ).toJSON()
//   expect(tree).toMatchSnapshot()
// })

// function noop() {
//   return null
// }
