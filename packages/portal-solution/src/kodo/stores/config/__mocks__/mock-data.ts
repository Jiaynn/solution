/**
 * @file config mock data
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { IConfigResponse } from 'kodo/apis/config'
import { IKodoFogConfig, IPlatformConfig, StorageDeployMode } from '../types'

const kodoAndFogConfig: IKodoFogConfig = {
  productUrl: [],
  devtools: false,
  site: {
    // 发生未知错误时，错误提示信息的后缀，例如：发生位置错误，请联系管理员
    unknownExceptionMessageSuffix: '请联系管理员',
    // 浏览器标签的 favicon
    favicon: '/kodo/static/favicon.ico',
    // 浏览器标签的 title 前缀
    pageTitle: '雾存储',
    // 当前的产品名称，会在侧边栏上部和跨区域同步选择产品时显示
    productName: '产品名称',
    // 站点的前端路由前缀，如下设置时
    // 原本的 /overview 页面的路由会变成 /test-root-path/overview
    rootPath: '/test-root-path',
    /* 404 页面配置 */
    notFoundPage: {
      /* 404 Not Found 页面地址 */
      url: '',
      /* 用于记录跳转来源的查询参数名 */
      fromUrlParamName: ''
    }
  },

  // 具体的区域配置信息
  regions: [
    {
      // 区域的名称，用于页面显示
      name: '华东',
      // 区域的唯一标识符，用于各接口的参数，必须全局唯一
      symbol: 'z0',
      // 区域的说明，用于显示在创建空间的的区域选择下方
      description: '华东的说明',

      invisible: false,

      tag: 'TAG',

      apply: {
        enable: true,
        notice: { enable: true },
        description: '区域申请前的说明',
        form: {
          description: '区域申请表单里的说明',
          agreementUrl: 'https://baidu.com',
          expectedUsage: [
            { name: '小于 100TB', key: '<100TB' },
            { name: '大于 100TB', key: '>100TB' }
          ]
        }
      },

      // 是否为海外区域
      overseas: false,

      // 智能多媒体处理
      dora: {
        enable: true,
        // 内容审核能力，对应到空间设置的内容审核功能
        censor: { enable: true },
        transcode: { enable: true },
        image: {
          enable: false,
          isOldVersion: false,
          uploadEnable: false,
          originalProtected: {
            description: ''
          },
          imageSlim: {
            description: ''
          },
          defaultImageUrl: ''
        },
        mediaStyle: {
          enable: false,
          image: {
            imageSlim: {
              description: ''
            },
            defaultImageUrl: ''
          },
          video: { enable: false, transcode: { description: '', frameRate: { description: '' } } },
          originalProtected: { description: '' }
        }
      },

      // 对象存储的服务配置
      objectStorage: {
        // 用于资源管理中上传文件时使用，目前实现为仅使用第一个
        uploadUrls: ['http://upload.qiniu.io'],
        // 用于资源管理中，如果用户没有绑定域名，则使用该地址下载文件，目前实现为仅使用第一个
        downloadUrls: ['http://download.qiniu.io'],
        resourceProxy: { enable: false },

        // 域名管理的源站域名功能
        domain: {
          enable: true,
          apiScopeName: '',
          // 绑定域名时允许输入端口，很特殊!
          // 部分用户 80 端口无法开启，导致域名访问时必须携带端口
          allowPort: { enable: true },
          // 绑定域名时用于用户解析域名的地址
          sourceHosts: ['a.com'],
          // 启用 AWS-S3 兼容协议域名
          awsS3: {
            enable: true,
            // 绑定 S3 域名时用于用户解析域名的地址
            sourceHosts: []
          },
          description: '绑定自定义域名为空间的源站域名，即可通过该域名直接访问存储空间内的文件。加速文件访问，请绑定自定义 CDN 加速域名。',
          singleSourceHosts: {
            flowOut: ''
          }
        },

        // 空间备注，为空间添加描述
        bucketRemark: { enable: true },
        // 空间重定向，自定义跳转规则
        bucketRoutingRule: { enable: true },
        // 空间日志，记录空间的操作日志
        bucketLog: { enable: true },
        // 分享空间，可以分享空间给其他用户
        bucketShare: { enable: true },
        // 空间加密，文件存储到具体硬件时加密
        bucketEncryption: { enable: true },
        // 文件多版本，允许对文件创建历史版本
        fileMultiVersion: { enable: true },
        // 访问来源验证
        referrerVerification: {
          enable: true,
          // 访问来源验证设置界面上方的说明
          description: '来源验证说明'
        },
        // 文件生命周期设置
        fileLifeCycle: {
          // 允许设置 n 小时后删除，暂未实现，开启时仅仅会显示小时的粒度，而不会显示设置操作
          deleteAfterHours: { enable: true }
        },
        worm: {
          // 文件锁定功能
          enable: true
        }
      }
    }
  ],

  signIn: {
    // 登录/登出的跳转地址
    signInUrl: '/signin',
    signOutUrl: '/signout'
  },

  // 站点的主体布局配置，可为 public、built-in
  // 注意：public 布局包含一些特殊请求，例如 financial，使用该布局请务必确保相关服务可用
  layout: {
    type: 'built-in'
  },

  // 网站各处的文档链接
  // 地址可以是相对地址或者绝对地址
  documentUrls: {
    sla: '/doc/test',
    maxAge: '/doc/test',
    event: '/doc/test',
    access: '/doc/test',
    source: '/doc/test',
    crossOrigin: '/doc/test',
    authorization: '/doc/test',
    safetyReferrer: '/doc/test',
    lifecycle: '/doc/test',
    version: '/doc/test',
    dataProtectionSSEncryption: '/doc/test',
    downloadToken: '/doc/test',
    transfer: '/doc/test',
    resourceManage: '/doc/test',
    batchDownload: '/doc/test',
    domain: '/doc/test',
    log: '/doc/test',
    censor: '/doc/test',
    originalResourceProtection: '/doc/test',
    mediaStyle: '/doc/test',
    originalProtection: '/doc/test',
    testDomainAccessRestrictionRules: '/doc/test',
    configureCnameDomain: '/doc/test',
    bucketTagManage: '/doc/test',
    imageStyleIntro: '/doc/test',
    imageStyle: '/doc/test',
    imageProcess: '/doc/test',
    videoProcess: '/doc/test',
    styleSeparator: '/doc/test',
    transcodeStyle: '/doc/test',
    magicVars: '/doc/test',
    chtype: '/doc/test',
    category: '/doc/test',
    testDomain: '/doc/test',
    s3AWS: '/doc/test',
    multiPartUploadInterface: '/doc/test',
    modifyTheFileStatus: '/doc/test',
    worm: '/doc/test',
    wormSetting: '/doc/test',
    bucketRemark: '/doc/test',
    staticPageDetail: '/doc/test',
    staticPageSetting: '/doc/test',
    routingRuleDetail: '/doc/test',
    routingRuleSetting: '/doc/test'
  },

  // 全局的对象存储配置，内容主要分为两部分
  // 1、仅支持全局的配置，例如：storageType、overview、transfer、createBucket、bucketList
  // 2、除了 uploadUrls、 downloadUrls 以外的 region 级别的配置
  // 当全局与 region 同时配置了某配置时， region 的优先级更高
  objectStorage: {
    // 服务的部署模式、可选 physical or k8s，目前会影响到证书管理功能、处于 k8s 模式时，无法启用证书管理
    deployMode: StorageDeployMode.Physical,

    // 支持的存储类型、默认包含标准存储
    storageType: {
      // 低频存储
      lowFrequency: { enable: true },
      // 归档存储
      archive: { enable: true },
      // 深度归档
      deepArchive: { enable: true }
    },

    // 首页概览
    overview: {
      // 概览页面上方的说明
      description: '查看产品说明 <a href="//develop.qiniu.com">文档</a>'
    },

    // 创建空间
    createBucket: {
      // 显示在创建空间上方的说明
      description: '欢迎光临 <a href="doc://styleSeparator">文档</a>'
    },

    // 空间列表
    bucketList: {
      // 显示在空间列表上方的说明
      description: '雾存储服务等级协议 <a href="http://doc.com">（SLA）</a>'
    },

    // 跨区域同步
    transfer: {
      enable: true,
      // 跨区域同步的说明
      description: '跨区域同步说明 <a href="//develop.qiniu.com">文档</a>',
      // 跨产品同步
      crossProduct: {
        enable: true,
        // 允许切换源产品
        sourceProductSelect: { enable: true }
      }
    },

    // 资源管理旧版界面的功能配置
    resourceManage: {
      // 开启旧版资源管理功能
      enable: false,
      // 上传界面的功能配置
      upload: {
        // 上传页面右下角的说明
        description: '文件上传时的说明'
      }
    },

    resourceManageV2: {
      upload: {
        description: ''
      }
    },

    // 参考 region 的 objectStorage 配置项
    domain: {
      enable: true,
      allowPort: { enable: true },
      sourceHosts: [],
      singleSourceHosts: {
        flowOut: ''
      },
      // 用于设置七牛原生协议显示的 API 域的名称
      apiScopeName: '七牛原生接口',
      awsS3: {
        enable: true,
        sourceHosts: []
      },
      description: '绑定自定义域名为空间的源站域名，即可通过该域名直接访问存储空间内的文件。加速文件访问，请绑定自定义 CDN 加速域名。'
    },

    // 参考 region 的 objectStorage 配置项
    bucketRemark: { enable: true },
    // 参考 region 的 objectStorage 配置项
    bucketRoutingRule: { enable: true },
    // 参考 region 的 objectStorage 配置项
    bucketLog: { enable: true },
    // 参考 region 的 objectStorage 配置项
    bucketShare: { enable: true },
    // 参考 region 的 objectStorage 配置项
    bucketEncryption: { enable: true },
    // 参考 region 的 objectStorage 配置项
    fileMultiVersion: { enable: true },
    // 参考 region 的 objectStorage 配置项
    referrerVerification: {
      enable: true,
      description: '来源验证说明'
    },
    // 参考 region 的 objectStorage 配置项
    fileLifeCycle: {
      deleteAfterHours: { enable: true }
    },
    worm: { enable: true }
  },

  // pili 系统，当启用时，系统会在处理空间时考虑 pili 的引用安全
  // 例如删除空间、公有转私有时警告用户 pili 正在使用该空间
  pili: {
    enable: true
  },

  // 参考 region 的 dora 配置项
  // 智能多媒体处理
  dora: {
    enable: true,
    censor: { enable: true },
    transcode: { enable: true },
    image: {
      enable: false,
      isOldVersion: false,
      uploadEnable: false,
      originalProtected: {
        description: ''
      },
      imageSlim: {
        description: ''
      },
      defaultImageUrl: ''
    },

    mediaStyle: {
      enable: false,
      image: {
        imageSlim: {
          description: ''
        },
        defaultImageUrl: ''
      },
      video: { enable: false, transcode: { description: '', frameRate: { description: '' } } },
      originalProtected: { description: '' }
    }
  },

  // CDN 加速域名系统
  fusion: {
    enable: true,
    domain: {
      enable: true,
      // 自动生成测试域名
      autoGenerateTestDomain: { enable: true }
    }
  },

  // 证书管理
  certificate: {
    enable: true,
    // 证书管理所使用的服务，可选 fusion、storage
    // fusion 为 CDN 提供的证书管理系统
    // storage 为对象存储提供的证书管理系统
    service: 'storage'
  },

  // 拉流转推功能
  streamPush: {
    enable: true
  },

  statistics: {
    bucketFlow: {
      singleOut: {
        enable: false
      }
    }
  }
}

const platformConfig: IPlatformConfig = {
  devtools: false,
  productUrl: [],

  site: {
    // 发生未知错误时，错误提示信息的后缀，例如：发生位置错误，请联系管理员
    unknownExceptionMessageSuffix: '请联系管理员',
    // 登录界面的 logo
    logo: '/platform/static/qiniu-logo-with-title-and-padding.png',
    // 浏览器标签的 favicon
    favicon: '/platform/static/favicon.ico',
    // 浏览器标签的 title 前缀
    pageTitle: '',
    // 站点的版本信息，仅仅 signIn.type 为 'built-in' 时有效（使用内置的登录界面）
    copyright: '© 2021 七牛云',
    // 站点的前端路由前缀
    rootPath: '',
    /* 404 页面配置 */
    notFoundPage: {
      /* 404 Not Found 页面地址 */
      url: '',
      /* 用于记录跳转来源的查询参数名 */
      fromUrlParamName: ''
    }
  },

  signIn: {
    // 登录的类型，主要取值有 local、qiniu-sso、external-sso
    // local 代表使用本地的登录页面进行登录
    // external-sso 代表跳转到外部的 sso 进行登录
    type: 'local',

    // 登录/登出的跳转地址
    signInUrl: '',
    signOutUrl: ''
  },

  // 用户模块
  user: {
    enable: true,
    // AK/SK 设置界面
    key: { enable: true },
    // 用户概要信息界面
    profile: { enable: true },
    // 用户安全设置界面
    security: {
      enable: true,
      // 密码设置
      password: {
        // 密码的规则，可选 from-api or 具体的规则配置
        // 当值为“具体的规则配置”时将会直接将配置作为规则
        // 当值为 from-api 时将会通过接口获取规则
        rule: 'from-api' as any
      }
    },
    // 操作日志界面
    oplog: { enable: true }
  },

  documentUrls: {
    aksk: '/doc/test'
  }
}

export const serverResponse: IConfigResponse = {
  platform: { ...platformConfig, productUrl: ['portal.qiniu.com/platform'] },
  kodo: { ...kodoAndFogConfig, productUrl: ['portal.qiniu.com/kodo'] },
  fog: { ...kodoAndFogConfig, productUrl: ['portal.qiniu.com/fog'] }
}
