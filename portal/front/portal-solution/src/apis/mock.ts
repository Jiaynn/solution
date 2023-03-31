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
import {
  AppInfoQuery,
  AppListQuery,
  AppParam,
  CodeUrl,
  PiliHubListResult
} from './_types/interactMarketingType'
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
            bottomList: ['@title(5,10)', '@title(5,10)', '@title(5,10)']
          }
        ]
      })
    )
  }
}

export class MockInteractMarketingApi {
  static getAppInfo(query: AppInfoQuery) {
    const { appId } = query

    return Mock.mock({
      appId,
      appName: '@name',
      'appScenarios|1': [0, 1],
      'appScenariosVo|1': ['电商直播', '互动直播'],
      'integrationWay|1]': [0, 1],
      integrationWayVo: ['标准集成（不带UI）', '含UI集成'],
      'components:7': ['@cname(2,4)'],
      hub: '@name',
      piliDomain: {
        publishRtmp: 'http://www.@domain.com',
        liveRtmp: 'http://www.@domain.com',
        liveHdl: 'http://www.@domain.com',
        liveHls: 'http://www.@domain.com'
      },
      RTCApp: '@name',
      IMServer: '@name',
      kodo: {
        bucket: '@name',
        callBack: 'http://www.@domain.com',
        addr: '@name'
      }
    })
  }

  static getAppList(query: AppListQuery) {
    const { pageSize } = query
    const pageCount = 10

    return Mock.mock({
      [`total_count|1-${pageSize * pageCount}`]: 1,
      page_count: pageCount,
      'end_page|1': true,
      [`list|${pageSize}`]: [
        {
          appId: '@ID',
          appName: '@NAME',
          'appScenarios|1': ['电商直播', '互动直播'],
          'integrationWay|1': ['含UI集成', '不含UI集成'],
          'status|1': ['已完成', '未完成'],
          createTime: () => Math.round(Mock.Random.timestamp() / 1000)
        }
      ]
    })
  }

  static getAppParam(): AppParam {
    return [
      {
        type: '安全组件',
        items: [
          {
            componentId: '6412cde8492ae419f542fe05',
            scenes: -1,
            type: '安全组件',
            name: '鉴黄暴恐',
            enName: '',
            default: 1,
            remark: ''
          }
        ]
      },
      {
        type: '直播组件',
        items: [
          {
            componentId: '6412cde8492ae419f542fdfc',
            scenes: -1,
            type: '直播组件',
            name: '连麦组件',
            enName: 'mic',
            default: 0,
            remark: ''
          },
          {
            componentId: '6412cde8492ae419f542fdfd',
            scenes: -1,
            type: '直播组件',
            name: '直播美颜',
            enName: 'beauty',
            default: 1,
            remark:
              '选择直播美颜组件需要先购买对应产品，请咨询您的销售确认，否则在实际应用中不会有相应功能效果'
          }
        ]
      },
      {
        type: '互动组件',
        items: [
          {
            componentId: '6412cde8492ae419f542fdfe',
            scenes: -1,
            type: '互动组件',
            name: 'PK组件',
            enName: 'relay',
            default: 0,
            remark: ''
          },
          {
            componentId: '6412cde8492ae419f542fdff',
            scenes: -1,
            type: '互动组件',
            name: '点赞组件',
            enName: 'like',
            default: 1,
            remark: ''
          },
          {
            componentId: '6412cde8492ae419f542fe00',
            scenes: -1,
            type: '互动组件',
            name: '礼物组件',
            enName: 'gift',
            default: 1,
            remark: ''
          },
          {
            componentId: '6412cde8492ae419f542fe01',
            scenes: -1,
            type: '互动组件',
            name: '弹幕组件',
            enName: 'bulletScreen',
            default: 1,
            remark: ''
          }
        ]
      },
      {
        type: '通用组件',
        items: [
          {
            componentId: '6412cde8492ae419f542fe02',
            scenes: -1,
            type: '通用组件',
            name: '直播预约',
            enName: 'booking',
            default: 0,
            remark: ''
          },
          {
            componentId: '6412cde8492ae419f542fe03',
            scenes: -1,
            type: '通用组件',
            name: '直播公告',
            enName: 'announcement',
            default: 1,
            remark: ''
          }
        ]
      },
      {
        type: '电商组件',
        items: [
          {
            componentId: '6412cde8492ae419f542fe04',
            scenes: -1,
            type: '电商组件',
            name: '购物车',
            enName: 'item',
            default: 0,
            remark: ''
          }
        ]
      }
    ]
  }

  static getCodeUrl(): CodeUrl {
    const mockUrl = () => Mock.Random.url('http', 'mock.test.com')
    return Mock.mock({
      appId: '@id',
      android_url: mockUrl,
      ios_url: mockUrl,
      server_url: mockUrl,
      server_fixed_url: mockUrl
    })
  }

  static getPiliHubList(): PiliHubListResult {
    return Mock.mock({})
  }
}
