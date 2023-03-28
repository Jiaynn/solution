import Mock from 'better-mock'

import { mockRequest } from './request'

import {
  IsOpenSolutionOptions,
  IsOpenSolutionResult,
  CompleteSolutionOptions,
  CompleteSolutionResult,
  GetBucketListOptions,
  GetBucketListResult,
  IsConfigSolutionOptions,
  IsConfigSolutionResult
} from './_types/imageType'
import { GetMessageListOptions } from './_types/messageType'

export class MockApi {
  // 是否开通某服务
  static isOpenSolution(_options: IsOpenSolutionOptions) {
    return mockRequest<IsOpenSolutionResult>(
      Mock.mock({
        code: -79418438.63190451,
        request_id: '@integer(0, 100)',
        message: '@ctitle(5,10)',
        data: {
          status: '@boolean'
        }
      })
    )
  }

  // 是否配置某方案
  static isConfigSolution(_options: IsConfigSolutionOptions) {
    return mockRequest<IsConfigSolutionResult>(
      Mock.mock({
        code: -79418438.63190451,
        request_id: '@integer(0, 100)',
        message: '@ctitle(5,10)',
        data: {
          status: '@boolean'
        }
      })
    )
  }
  // 方案配置完成
  static completeSolution(_options: CompleteSolutionOptions) {
    return mockRequest<CompleteSolutionResult>(
      Mock.mock({
        request_id: '@id',
        code: '@integer(0, 100)',
        data: {
          solution_code: '@title(5,10)',
          status: '@integer(0, 1)',
          solution_name: '@title(5,10)'
        },
        message: '@integer(0, 100)'
      })
    )
  }

  // 获取方案列表
  static getBucketList(_options: GetBucketListOptions) {
    return mockRequest<GetBucketListResult>(
      Mock.mock({
        code: '@integer(0, 100)',
        data: {
          end_page: '@boolean',
          page_total: '@integer(0, 100)',
          total_count: '@integer(0, 100)',
          'list|1-10': [
            {
              solution_code: '@title(5,10)',
              bucket_id: '@ctitle(5,10)',
              uid: '@title(5,10)',
              region: '@ctitle(5,10)'
            }
          ]
        },
        request_id: '@title(5,10)',
        message: '@ctitle(5,10)'
      })
    )
  }

  // 获取消息列表
  static getMessageList(_options: GetMessageListOptions) {
    return mockRequest<any>(
      Mock.mock({
        'list|1-10': [
          {
            icon_image_url: '@title(5,10)',
            title: '@ctitle(3,7)',
            describe: '@ctitle(30,40)',
            bottomList: [
              '@title(5,10)',
              '@title(5,10)',
              '@title(5,10)'

            ]
          }
        ]
      })
    )
  }
}
