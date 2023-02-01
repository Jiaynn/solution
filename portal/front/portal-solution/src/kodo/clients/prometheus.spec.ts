/**
 * @file unit test for fetch store of prometheus
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// import 'whatwg-fetch'
// import { defaultHttpMessageMap as codeMessageMap } from 'qn-fe-core/client'

// import {
//   PROMETHEUS_RESPONSE_ERROR_CODE_MESSAGE_MAP
// } from 'kodo/constants/apis/proxy-error/prometheus'
// import { PublicRegionSymbol } from 'kodo/constants/region'
// import merge from 'kodo/utils/merge'
// import prometheusFetchStore, {
//   // 常用方法
//   ResultType, instantQuery, rangeQuery,
//   // 高级用法
//   PrometheusFetchStore, Status, IMetric, IResponseData, IResponseSuccessBody, normalizeVector
// } from './prometheus'

// // TODO: 补充真正的带业务逻辑的数据
// // TODO: 考虑 UT 并发执行，是不是每个 test case 都不应该复用同一个 fetch store instance

// function bindResolvedFetchStore<T extends ResultType, M extends IMetric = IMetric>(
//   data: IResponseData<T, M>
// ) {
//   const result: IResponseSuccessBody<T, M> = {
//     // TODO: 应该 mock base fetch store 否则测试不了 status 的逻辑
//     status: Status.Success,
//     data
//   }

//   const mockedFetch = jest.fn()

//   mockedFetch.mockReturnValueOnce(Promise.resolve({
//     ok: true,
//     status: 200,
//     headers: [],
//     text() {
//       return Promise.resolve(JSON.stringify(result))
//     },
//     json() {
//       return Promise.resolve(result)
//     }
//   }))

//   prometheusFetchStore.bindRealFetch(mockedFetch)
// }

// async function resolveLastWith(fetchStore: PrometheusFetchStore, result: any, delay?: number) {
//   const fetchItem = fetchStore.items.slice(-1)[0]
//   fetchStore.send(fetchItem.id)
//   if (delay != null) {
//     await new Promise(resolve => setTimeout(resolve, delay))
//   }
//   fetchStore.resolve(fetchItem.id, result)
// }

// describe('test prometheus fetch store', () => {
//   interface INormalMetric {
//     x: 1
//   }

//   it('instantQuery should work well with generics ResultType.matrix', async () => {
//     const data: IResponseData<ResultType.Matrix, INormalMetric> = {
//       resultType: ResultType.Matrix,
//       result: [
//         {
//           metric: {
//             x: 1
//           },
//           values: [
//             [+new Date() / 1e3, '12345']
//           ]
//         }
//       ]
//     }

//     const fetchStore = new PrometheusFetchStore()

//     const req = instantQuery<ResultType.Matrix, INormalMetric>({
//       region: PublicRegionSymbol.Z0,
//       query: 'sum by(server, diskpath) (kodo_pfd_disk_broken) == 1',
//       fetchStore
//     })

//     resolveLastWith(fetchStore, data)

//     await expect(req).resolves.toMatchObject(merge(data, {
//       result: [{ values: data.result[0].values.map(normalizeVector) }]
//     }).result)
//   })

//   it('instantQuery should work well with options ResultType.vector', async () => {
//     const data: IResponseData<ResultType.Vector, INormalMetric> = {
//       resultType: ResultType.Vector,
//       result: [
//         {
//           metric: {
//             x: 1
//           },
//           value: [+new Date(), '12345']
//         }
//       ]
//     }

//     const fetchStore = new PrometheusFetchStore()

//     const req = instantQuery<INormalMetric>({
//       region: PublicRegionSymbol.Z0,
//       query: 'sum by(server, diskpath) (kodo_pfd_disk_broken) == 1',
//       type: ResultType.Vector,
//       fetchStore
//     })

//     resolveLastWith(fetchStore, data)

//     expect(await req).toMatchObject(merge(data, {
//       result: [{ value: normalizeVector(data.result[0].value) }]
//     }).result)
//   })

//   it('rangeQuery should work well', () => {
//     const now = new Date()
//     const data: IResponseData<ResultType.Matrix, INormalMetric> = {
//       resultType: ResultType.Matrix,
//       result: [
//         {
//           metric: {
//             x: 1
//           },
//           values: [
//             [+now / 1e3, '12345']
//           ]
//         }
//       ]
//     }

//     bindResolvedFetchStore(data)

//     return rangeQuery<INormalMetric>({
//       region: PublicRegionSymbol.Z0,
//       query: 'sum by(server, diskpath) (kodo_pfd_disk_broken) == 1',
//       start: +new Date(),
//       end: new Date(),
//       step: '1m'
//     }).then(result => {
//       expect(result).toMatchObject(merge(data, {
//         result: [{ values: [[+now, 12345]] }]
//       }).result)
//     })
//   })

//   it('error handle should work well', () => {
//     const fetchStore = new PrometheusFetchStore()

//     const testMessages = {
//       ...codeMessageMap,
//       ...PROMETHEUS_RESPONSE_ERROR_CODE_MESSAGE_MAP
//     }

//     const errorMessageKeys = Object.keys(testMessages)

//     expect.assertions(errorMessageKeys.length)

//     return Promise.all(errorMessageKeys.map(key => {

//       const numberKey = Number(key)
//       const id = fetchStore.enqueue('/test')
//       const responseText = '{"status": "error"}'
//       const resp = new Response(responseText, { status: numberKey })

//       fetchStore.send(id)
//       fetchStore.fill(id, resp)

//       return fetchStore.promiseFor(id)
//         .catch(error => {
//           expect(error).toMatchObject({
//             message: testMessages[numberKey]
//           })
//         })
//     }))
//   })

//   it('normal result handle should work well', () => {
//     const fetchStore = new PrometheusFetchStore()

//     const testMessages = {
//       ...codeMessageMap,
//       ...PROMETHEUS_RESPONSE_ERROR_CODE_MESSAGE_MAP,
//       200: '响应正文（body）内容格式不正确'
//     }

//     const errorMessageKeys = Object.keys(testMessages)

//     expect.assertions(errorMessageKeys.length)

//     return Promise.all(errorMessageKeys.map(key => {

//       const numberKey = Number(key)
//       const id = fetchStore.enqueue('/test')
//       const responseText = `{"status": "success", "data": {"key": ${numberKey}}}`
//       const resp = new Response(responseText, { status: numberKey })

//       fetchStore.send(id)
//       fetchStore.fill(id, resp)

//       return fetchStore.promiseFor(id)
//         .then(result => {
//           expect(result).toMatchObject({
//             key: numberKey
//           })
//         })
//         .catch(error => {
//           expect(error).toMatchObject({
//             message: testMessages[numberKey]
//           })
//         })
//     }))
//   })
// })
