import autobind from 'autobind-decorator'

import { CommonClient } from 'portal-base/common/apis/common'
import { injectable } from 'qn-fe-core/di'

import { imageService } from 'constants/api'
import {
  OpenSolutionOptions,
  CreateBucketOptions,
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
export class ImageSolutionApis {
  constructor(private solutionCommonClient: CommonClient) { }

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
      `${imageService.openSolution}?solution_code=${options.solution_code}`
    )
  }

  /**
   * @des 是否配置某方案
   * @url /status
   * @param options
   * @returns
   */
  isConfigSolution(options: IsConfigSolutionOptions): Promise<IsConfigSolutionResult> {
    return this.solutionCommonClient.get(
      `${imageService.configSolution}?solution_code=${options.solution_code}`
    )
  }
  /**
   * @desc 开通方案
   * @URL /
   * @param options
   * @returns
   */
  openSolution(options: OpenSolutionOptions): Promise<boolean> {
    return this.solutionCommonClient.post(`${imageService.openSolution}`, options)
  }

  /**
   * @desc 创建bucket
   * @param options
   * @url /bucket/create
   * @returns
   */
  createBucket(options: CreateBucketOptions): Promise<void> {
    return this.solutionCommonClient.post(`${imageService.createBucket}`, options)
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
    return this.solutionCommonClient.post(`${imageService.completeSolution}`, options)
  }

  /**
   * @desc 获取bucket列表
   * @url /bucket/list
   * @param options
   * @returns
   */
  getBucketList(options: GetBucketListOptions): Promise<GetBucketListResult> {
    const regionQuery = options.region ? `&region=${options.region}` : ''
    return this.solutionCommonClient.get(
      `${imageService.getBucketList}?solution_code=${options.solution_code}${regionQuery}`
    )
  }
}
