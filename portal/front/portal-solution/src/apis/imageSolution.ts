import autobind from 'autobind-decorator'

import { CommonClient } from 'portal-base/common/apis/common'
import { injectable } from 'qn-fe-core/di'

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

@autobind
@injectable()
export class SolutionApis {
  constructor(private solutionCommonClient: CommonClient) {}

  // 是否开通某方案
  isOpenSolution(
    options: IsOpenSolutionOptions
  ): Promise<IsOpenSolutionResult> {
    return this.solutionCommonClient.get(
      `${service.isOpenSolution}?solution_code=${options.solution_code}`,
      {}
    )
  }

  // 是否配置某方案
  isConfigSolution(options:IsConfigSolutionOptions):Promise<IsConfigSolutionResult> {
    return this.solutionCommonClient.get(
      `${service.isConfigSolution}?solution_code=${options.solution_code}`,
      {}
    )
  }
  /**
   * @desc 开通方案
   * @URL /solution
   * @param options
   * @returns
   */
  openSolution(options: OpenSolutionOptions): Promise<OpenSolutionResult> {
    return this.solutionCommonClient.post(`${service.openSolution}`, options)
  }

  /**
   * @desc 创建bucket
   * @param options
   * @url /solution/bucket/create
   * @returns
   */
  createBucket(options: CreateBucketOptions): Promise<CreateBucketResult> {
    return this.solutionCommonClient.post(`${service.createBucket}`, options, {
      headers: {
        Authorization: 'QiniuStub uid=1381218000'
      }
    })
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

  // 获取bucket列表
  getBucketList(options: GetBucketListOptions): Promise<GetBucketListResult> {
    return this.solutionCommonClient.get(
      `${service.getBucketList}?page_num=${options.page_num}&page_size=${options.page_size}&solution_code=${options.solution_code}&region=${options.region}`,
      {},
      {
        headers: {
          Authorization: 'QiniuStub uid=1381218098'
        }
      }
    )
  }
}
