/**
 * @file 超链接配置，不同产品下的外部超链接在这里管理
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'

@injectable()
export default abstract class Links {
  abstract trafficStatistics: string
  abstract responseHeader: string
  abstract downloadLog: string
}

export class CdnLinks extends Links {
  trafficStatistics = 'https://developer.qiniu.com/fusion/manual/5029/usage-statistics#all-selected'
  responseHeader = 'https://developer.qiniu.com/fusion/manual/6778/the-http-response-header-configuration'
  downloadLog = 'https://developer.qiniu.com/article/fusion/api/log.html'
}

export class DcdnLinks extends Links {
  trafficStatistics = 'https://developer.qiniu.com/dcdn/development_guidelines/10796/dcdn-usage-statistics#all-selected'
  responseHeader = 'https://developer.qiniu.com/dcdn/development_guidelines/10793/dcdn-the-http-response-header-configuration'
  downloadLog = 'https://developer.qiniu.com/dcdn/development_guidelines/10836/dcdn-log-download'
}
