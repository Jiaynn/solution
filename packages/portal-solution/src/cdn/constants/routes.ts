/**
 * @file 路由相关配置，可消费路由的地方建议都配置到这里
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import { withQueryParams } from 'qn-fe-core/utils'
import { To } from 'portal-base/common/router'

import { encodeName } from 'cdn/transforms/domain/url'

import { SearchType } from 'cdn/constants/statistics'
import { DomainType } from 'cdn/constants/domain'

import { ICreateDomainState } from 'cdn/components/Domain/Create/Result'
import { ConfigInputType } from 'cdn/components/Domain/Create/CreateForm'

@injectable()
export default class Routes {
  /** route 前缀 */
  basename: string

  constructor(basename: string) {
    this.basename = basename
  }

  get domainList() {
    return `${this.basename}/domain`
  }

  domainCreate(params: { type?: DomainType, pareDomain?: string } = {}) {
    return withQueryParams(`${this.basename}/domain/create`, params)
  }

  domainCreateResult({ retryImmediately, ...createState }: ICreateDomainState & { retryImmediately?: boolean }): To {
    return {
      pathname: `${this.basename}/domain/create/result`,
      search: withQueryParams('', { retryImmediately }),
      state: createState
    }
  }

  domainVerifyOwnership(state: ICreateDomainState): To {
    return {
      pathname: `${this.basename}/domain/verify-ownership`,
      state
    }
  }

  domainDetail(domain: string, extra?: {
    module?: ConfigInputType
    basename?: string
  }) {
    const basename = extra?.basename || this.basename
    return `${basename}/domain/${encodeName(domain)}${extra?.module ? '#' + extra.module : ''}`
  }

  domainConflict(domain: string) {
    return withQueryParams(`${this.basename}/domain/conflict`, { domain })
  }

  /** 统计分析 */
  statistics(type: 'usage' | 'log', searchType: SearchType) {
    return `${this.basename}/statistics/${type}/${searchType}`
  }

  /** 统计分析 - 用量统计 */
  statisticsFlow(domain?: string) {
    const path = this.statistics('usage', SearchType.Flow)
    return domain ? withQueryParams(path, { domain }) : path
  }

  /** 日志分析 - 视频瘦身 */
  videoSlim(domain?: string) {
    const path = `${this.basename}/statistics/log/videoslim`
    return domain ? withQueryParams(path, { domain }) : path
  }

  /** 内容优化 - 视频瘦身 */
  get optimizationVideo() {
    return `${this.basename}/content-optimization/video`
  }

  alarmList(domain?: string) {
    return `${this.basename}/alarm${domain ? '/' + domain : ''}`
  }

  get userOverview() {
    return `${this.basename}/overview`
  }

  get userFreeze() {
    return `${this.basename}/freeze`
  }
}
