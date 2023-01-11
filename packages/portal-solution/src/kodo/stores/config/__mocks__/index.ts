import { runInAction } from 'mobx'

import { serverResponse } from './mock-data'

// ConfigStore 使用到了 alert，需要 mock
window.alert = jest.fn()

const { ConfigStore } = jest.requireActual('../index')
const store = new ConfigStore()

runInAction(() => {
  store.product = 'kodo'
  store.updateFullConfig(serverResponse)
})

export default store
