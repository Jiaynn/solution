import autobind from 'autobind-decorator'

import { CommonClient } from 'portal-base/common/apis/common'
import { injectable } from 'qn-fe-core/di'

import { DomainApis, ICDNDomainInfo } from 'portal-base/fusion'

import { service } from 'constants/api'
import {
  OpenSolutionResult,
  OpenSolutionOptions,
  CreateBucketOptions,
  CreateBucketResult,
  IsOpenSolutionOptions,
  IsOpenSolutionResult,
  CompleteSolutionOptions,
  CompleteSolutionResult,
  GetBucketListOptions,
  GetBucketListResult,
  IsConfigSolutionOptions,
  IsConfigSolutionResult
} from './_types/imageType'
import { DomainStore } from 'kodo/stores/domain'

@autobind
@injectable()
export class SolutionApis {
  constructor(private solutionCommonClient: CommonClient, private domainApis:DomainApis, private domainStore:DomainStore) {}

  /**
   * @des 是否开通某方案
   * @url /enable
   * @param options
   * @returns
   */
  isOpenSolution(
    options: IsOpenSolutionOptions
  ): Promise<IsOpenSolutionResult> {
    return this.solutionCommonClient.get(
      `${service.isOpenSolution}?solution_code=${options.solution_code}`
    )
  }

  /**
   * @des 是否配置某方案
   * @url /status
   * @param options
   * @returns
   */
  isConfigSolution(options:IsConfigSolutionOptions):Promise<IsConfigSolutionResult> {
    return this.solutionCommonClient.get(
      `${service.isConfigSolution}?solution_code=${options.solution_code}`
    )
  }
  /**
   * @desc 开通方案
   * @URL /
   * @param options
   * @returns
   */
  openSolution(options: OpenSolutionOptions): Promise<OpenSolutionResult> {
    return this.solutionCommonClient.post(`${service.openSolution}`, options)
  }

  /**
   * @desc 创建bucket
   * @param options
   * @url /bucket/create
   * @returns
   */
  createBucket(options: CreateBucketOptions): Promise<CreateBucketResult> {
    return this.solutionCommonClient.post(`${service.createBucket}`, options)
  }

  /**
   * @desc 方案配置完成
   * @url /complete
   * @param options
   * @returns
   */
  completeSolution(
    options: CompleteSolutionOptions
  ): Promise<CompleteSolutionResult> {
    return this.solutionCommonClient.post(`${service.completeSolution}`, options)
  }

  /**
   * @desc 获取bucket列表
   * @url /bucket/list
   * @param options
   * @returns
   */
  getBucketList(options: GetBucketListOptions): Promise<GetBucketListResult> {
    return this.solutionCommonClient.get(
      `${service.getBucketList}?page_num=${options.page_num}&page_size=${options.page_size}&solution_code=${options.solution_code}`
    )
  }

  /**
   *
   * @returns 本方案所有空间的域名
   */
  async getDomains() {
    const res = await this.solutionCommonClient.get(
      `${service.getBucketList}?page_num=${1}&page_size=${1000}&solution_code=image`
    ) as GetBucketListResult

    // eslint-disable-next-line no-console

    const domains: ICDNDomainInfo[] = []

    // for (let i = 0; i < res.list.length; i++) {
    //   const cdnDomainInfo = await this.domainApis.searchDomains(res.list[i].bucket_id, 1000)
    //   // eslint-disable-next-line no-await-in-loop
    //   domains.push(...cdnDomainInfo)
    // }

    return domains
  }
}
