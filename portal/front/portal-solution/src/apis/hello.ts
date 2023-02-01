import { CommonClient } from 'portal-base/common/apis/common'
import { injectable } from 'qn-fe-core/di'

const API_PREFIX = '/api/app'

interface GetHelloOptions {}

@injectable()
export default class HelloApis {
  constructor(private commonClient: CommonClient) {}

  getTargetForHello(options: GetHelloOptions = {}) {
    return this.commonClient.get<string>(`${API_PREFIX}/hello/for`, options)
  }
}
