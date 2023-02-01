/**
 * @file test cases for component BucketDetails
 * @author yinxulai <me@yinxulai.com>
 */

// // TODO: 正确的配置测试的条件
// jest.mock('kodo/stores/config')

// import * as React from 'react'
// import { createMemoryHistory } from 'history'
// import { renderer } from 'portal-base/common/utils/test'
// import { RouterStore as routerStore } from 'portal-base/common/router'

// import { mockScrollableInkTabBar } from 'kodo/test/utils'

// import { BucketPage } from '../../constants/bucket'
// import { getDetailsPath } from '../../routes/bucket'

// mockScrollableInkTabBar()
// import BucketDetails from './index'

// function createRouterStore() {
//   const history = createMemoryHistory()
//   routerStore.bindHistory(history) // FIXME: `yarn link portal-base` 之后这里有类型问题
//   return routerStore
// }

// beforeAll(() => {
//   createRouterStore()
// })

// it('renders correctly BucketDetails', () => {
//   routerStore.push(getDetailsPath({ page: BucketPage.Domain, bucketName: 'bucketName' }))
//   const tree = renderer.create(
//     <BucketDetails key="bucketName" bucketName="bucketName" />
//   ).toJSON()
//   expect(tree).toMatchSnapshot()
// })
