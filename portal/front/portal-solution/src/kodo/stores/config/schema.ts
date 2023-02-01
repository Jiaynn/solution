// 不完全符合 JsonSchema 标准
// TODO: 支持转换成标准的 JsonSchema
// TODO: 自动生成文档

// TODO: 补全 preset 信息
// TODO: 自动生成配置界面
// TODO: 结合 feature

// 以前的配置以后尽量抽空补充说明
// 新加的配置请务必描述清楚

import type { PasswordCharset } from 'portal-base/user/account'

import { App } from 'kodo/constants/app'

export enum SchemaKind {
  String = 'string',
  Number = 'number',
  Object = 'object',
  Array = 'array',
  Boolean = 'boolean'
}

// 内置的几个标准环境配置
const BuiltInEnv = {
  Test: '测试',
  QiniuPublic: '七牛公有云',
  StandardPrivate: '标准私有云'
} as const

export type Normalize<T> = {
  normalize?: (current: unknown) => T // 自定义的 normalize 预处理
}

export type DefaultValue<T> = {
  default: T | ((rawData: unknown) => T)
  preset?: { [key in keyof typeof BuiltInEnv]?: T }
}

// default 的作用是用于服务端未配置改项时的默认取值
// preset 的作用主要是方便生成常用的标准场景下的配置
// 如果某个配置项在查询 preset 未配置则会读取 default
type ComputedDefaultValueType<T extends SchemaKind> =
  T extends SchemaKind.Boolean
  ? DefaultValue<boolean> & Normalize<boolean>
  : T extends SchemaKind.String
  ? DefaultValue<string> & Normalize<string>
  : T extends SchemaKind.Number
  ? DefaultValue<number> & Normalize<number>
  : T extends SchemaKind.Object
  ? Normalize<Record<string, unknown>>
  : T extends SchemaKind.Array
  ? Normalize<unknown[]>
  : never

type Schema<T extends SchemaKind, O extends {} = {}> = O & {
  kind: T // 数据类型
  type?: unknown // 通过手动指定 type 来帮助 ComputedJsonType 精确 ts 类型，不填写会自动推导
  title: string // 标题
  required: boolean // 是否必传
  description?: string // 配置说明
} & ComputedDefaultValueType<T>

export type NumberSchema = Schema<SchemaKind.Number>
export type StringSchema = Schema<SchemaKind.String>
export type BooleanSchema = Schema<SchemaKind.Boolean>
export type ObjectSchema<T extends {} = {}> = Schema<SchemaKind.Object, { properties: T }>
export type ArraySchema<T extends unknown = unknown> = Schema<SchemaKind.Array, { items: T }>

export type TypedSchema = BooleanSchema | StringSchema | NumberSchema | ArraySchema | ObjectSchema

type ComputedNormalSchemaJsonType<T extends TypedSchema> =
  T extends BooleanSchema
  ? boolean
  : T extends StringSchema
  ? string
  : T extends NumberSchema
  ? number
  : unknown

type ComputedObjectSchemaJsonType<T extends ObjectSchema> =
  T extends ObjectSchema<infer P>
  ? { [key in keyof P]: P[key] extends TypedSchema ? ComputedJsonType<P[key]> : P[key] }
  : { [key: string]: unknown }

type ComputedArraySchemaJsonType<T extends ArraySchema> =
  T extends ArraySchema<infer P>
  ? P extends TypedSchema ? Array<ComputedJsonType<P>> : P[]
  : unknown[]

export type ComputedType<T extends TypedSchema> = T extends { type: infer C } ? C : T

export type ComputedJsonType<T extends TypedSchema> =
  T extends { type: infer C } ? C
  : T extends ObjectSchema
  ? ComputedObjectSchemaJsonType<T>
  : T extends ArraySchema
  ? ComputedArraySchemaJsonType<T>
  : ComputedNormalSchemaJsonType<T>

function defineSchema<T extends TypedSchema>(d: T): T {
  return { ...d } as unknown as T
}

const devToolsConfigSchema = defineSchema({
  required: false,
  title: '前端开发调试工具配置，功能入口位于右下角',
  kind: SchemaKind.Object,
  properties: {
    devtools: defineSchema({
      default: false,
      required: false,
      title: '是否开启配置调试工具',
      kind: SchemaKind.Boolean,
      preset: {
        Test: true,
        QiniuPublic: false,
        StandardPrivate: false
      }
    })
  }
})

export const doraConfigSchema = defineSchema({
  required: false,
  title: 'Dora 能力配置项',
  kind: SchemaKind.Object,
  properties: {
    enable: defineSchema({
      default: false,
      required: false,
      title: '开启',
      description: 'dora 功能总开关',
      kind: SchemaKind.Boolean,
      preset: {
        Test: true,
        QiniuPublic: true,
        StandardPrivate: false
      }
    }),
    censor: defineSchema({
      required: false,
      title: '内容智能审核',
      description: '内容智能审核相关的功能配置项',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '开启',
          description: '开启后界面将出现内容审核相关功能',
          kind: SchemaKind.Boolean,
          preset: {
            Test: true,
            QiniuPublic: true,
            StandardPrivate: false
          }
        })
      }
    }),
    transcode: defineSchema({
      required: false,
      title: '转码样式功能',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '开启',
          description: '开启后空间详情会出现转码样式功能块',
          kind: SchemaKind.Boolean,
          preset: {
            Test: true,
            QiniuPublic: true,
            StandardPrivate: false
          }
        })
      }
    }),
    image: defineSchema({
      required: false,
      title: '图片样式',
      description: '老版本图片样式功能(即将下线)',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '开启',
          description: '开启后空间详情会出现图片样式功能块',
          kind: SchemaKind.Boolean,
          preset: {
            Test: true,
            QiniuPublic: false,
            StandardPrivate: false
          }
        }),
        isOldVersion: defineSchema({
          default: false,
          required: false,
          title: '是否使用老版',
          description: '开启后图片样式功能下的创建样式将会跳转去 dora 站点',
          kind: SchemaKind.Boolean,
          preset: {
            Test: true,
            QiniuPublic: false,
            StandardPrivate: false
          }
        }),
        uploadEnable: defineSchema({
          default: false,
          required: false,
          title: '上传原图功能是否开启',
          description: '是否允许用户在样式预览功能中上传自定义文件作为预览源',
          kind: SchemaKind.Boolean,
          preset: {
            Test: true,
            QiniuPublic: true,
            StandardPrivate: false
          }
        }),
        imageSlim: defineSchema({
          required: false,
          title: '图片瘦身',
          kind: SchemaKind.Object,
          properties: {
            description: defineSchema({
              default: '',
              required: false,
              title: '图片瘦身描述',
              description: '配置的内容将会显示在创建样式的图片瘦身模块下（支持 html）',
              kind: SchemaKind.String,
              preset: {
                Test: '<div>图片瘦身目前仅支持 jpg，png 的图片格式。</div><div>无需添加任何参数，自动瘦身；肉眼画质不变，图片体积大幅减少，节省 CDN 流量。</div><div>价格：0.1 元/千次。</div>',
                QiniuPublic: '<div>图片瘦身目前仅支持 jpg，png 的图片格式。</div><div>无需添加任何参数，自动瘦身；肉眼画质不变，图片体积大幅减少，节省 CDN 流量。</div><div>价格：0.1 元/千次。</div>',
                StandardPrivate: '<div>图片瘦身目前仅支持 jpg，png 的图片格式。</div><div>无需添加任何参数，自动瘦身；肉眼画质不变，图片体积大幅减少，节省 CDN 流量。'
              }
            })
          }
        }),
        defaultImageUrl: defineSchema({
          default: '',
          required: false,
          title: '默认图片',
          description: '图片样式新建/编辑时默认图片，格式必须是完整地址，例如 https://test.domain/filename',
          kind: SchemaKind.String,
          preset: {
            QiniuPublic: 'https://dn-ojpbly1un.qbox.me/gogopher.jpg'
          }
        }),
        originalProtected: defineSchema({
          required: false,
          title: '空间设置-原图保护',
          kind: SchemaKind.Object,
          properties: {
            description: defineSchema({
              default: '',
              required: false,
              title: '原图保护描述文字',
              description: '配置的内容将会显示在创建样式的图片瘦身模块下（支持 html）',
              kind: SchemaKind.String,
              preset: {
                Test: '开启原图保护后，文件只能通过带样式或者带签名的方式访问；禁止直接访问源文件或传入处理参数的访问。修改设置后，请及时刷新 CDN 缓存，以保证设置生效。刷新 CDN 缓存，请至 <a href="/cdn/refresh-prefetch">融合CDN-刷新预取-刷新目录 </a>。',
                QiniuPublic: '开启原图保护后，文件只能通过带样式或者带签名的方式访问；禁止直接访问源文件或传入处理参数的访问。修改设置后，请及时刷新 CDN 缓存，以保证设置生效。刷新 CDN 缓存，请至 <a href="/cdn/refresh-prefetch">融合CDN-刷新预取-刷新目录 </a>。',
                StandardPrivate: '开启原图保护后，文件只能通过带样式或者带签名的方式访问；禁止直接访问源文件或传入处理参数的访问。修改设置后，请及时刷新 CDN 缓存，以保证设置生效。'
              }
            })
          }
        })
      }
    }),
    mediaStyle: defineSchema({
      required: false,
      title: '多媒体样式',
      description: '多媒体样式功能配置',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '开启',
          description: '开启后空间详情将会出现多媒体样式功能模块',
          kind: SchemaKind.Boolean,
          preset: {
            Test: true,
            QiniuPublic: true,
            StandardPrivate: false
          }
        }),
        originalProtected: defineSchema({
          required: false,
          title: '原图保护',
          description: '访问管理的原图保护功能模块配置',
          kind: SchemaKind.Object,
          properties: {
            description: defineSchema({
              default: '',
              required: false,
              title: '原图保护描述文字',
              description: '配置内容将会显示在访问管理的原图保护开关上方（支持 html）',
              kind: SchemaKind.String,
              preset: {
                Test: '开启原始资源保护后，文件只能通过带样式或者带签名的方式访问；禁止直接访问源文件或传入处理参数的访问。修改设置后，请及时刷新 CDN 缓存，以保证设置生效。刷新 CDN 缓存，请至 <a href="/cdn/refresh-prefetch">融合CDN-刷新预取-刷新目录 </a>。',
                QiniuPublic: '开启原始资源保护后，文件只能通过带样式或者带签名的方式访问；禁止直接访问源文件或传入处理参数的访问。修改设置后，请及时刷新 CDN 缓存，以保证设置生效。刷新 CDN 缓存，请至 <a href="/cdn/refresh-prefetch">融合CDN-刷新预取-刷新目录 </a>。',
                StandardPrivate: '开启原始资源保护后，文件只能通过带样式或者带签名的方式访问；禁止直接访问源文件或传入处理参数的访问。修改设置后，请及时刷新 CDN 缓存，以保证设置生效。'
              }
            })
          }
        }),
        image: defineSchema({
          required: false,
          title: '图片处理',
          kind: SchemaKind.Object,
          properties: {
            imageSlim: defineSchema({
              required: false,
              title: '图片瘦身',
              kind: SchemaKind.Object,
              properties: {
                description: defineSchema({
                  default: '',
                  required: false,
                  title: '图片瘦身描述',
                  description: '配置的内容将会显示在创建样式的图片瘦身模块下（支持 html）',
                  kind: SchemaKind.String,
                  preset: {
                    Test: '<div>图片瘦身目前仅支持 jpg，png 的图片格式。</div><div>无需添加任何参数，自动瘦身；肉眼画质不变，图片体积大幅减少，节省 CDN 流量。</div><div>价格：0.1 元/千次。</div>',
                    QiniuPublic: '<div>图片瘦身目前仅支持 jpg，png 的图片格式。</div><div>无需添加任何参数，自动瘦身；肉眼画质不变，图片体积大幅减少，节省 CDN 流量。</div><div>价格：0.1 元/千次。</div>',
                    StandardPrivate: '<div>图片瘦身目前仅支持 jpg，png 的图片格式。</div><div>无需添加任何参数，自动瘦身；肉眼画质不变，图片体积大幅减少，节省 CDN 流量。'
                  }
                })
              }
            }),
            defaultImageUrl: defineSchema({
              default: '',
              required: false,
              title: '图片样式新建/编辑时默认图片',
              kind: SchemaKind.String,
              preset: {
                QiniuPublic: 'https://dn-ojpbly1un.qbox.me/gogopher.jpg'
              }
            })
          }
        }),
        video: defineSchema({
          required: false,
          title: '视频处理',
          kind: SchemaKind.Object,
          properties: {
            enable: defineSchema({
              default: false,
              required: false,
              title: '功能是否开启',
              kind: SchemaKind.Boolean,
              preset: {
                Test: true,
                QiniuPublic: true,
                StandardPrivate: false
              }
            }),
            transcode: defineSchema({
              required: false,
              title: '视频转码配置',
              kind: SchemaKind.Object,
              properties: {
                description: defineSchema({
                  default: '',
                  required: false,
                  title: '视频转码描述',
                  kind: SchemaKind.String,
                  preset: {
                    QiniuPublic: '查看 <a href="/dora/media-gate/preset">我的预设集</a>。如果更多预设集，前往 <a href="/dora/media-gate/preset/transcode/create">创建预设集</a>'
                  }
                }),
                frameRate: defineSchema({
                  required: false,
                  title: '帧率配置',
                  kind: SchemaKind.Object,
                  properties: {
                    description: defineSchema({
                      default: '',
                      required: false,
                      title: '帧率描述',
                      kind: SchemaKind.String,
                      preset: {
                        Test: '常用帧率：24，25，30。',
                        QiniuPublic: '常用帧率：24，25，30。',
                        StandardPrivate: '常用帧率：24，25，30。'
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  }
})

const fusionConfigSchema = defineSchema({
  required: false,
  title: 'fusion 相关能力配置',
  kind: SchemaKind.Object,
  properties: {
    enable: defineSchema({
      default: false,
      required: false,
      title: '功能是否开启',
      kind: SchemaKind.Boolean,
      preset: {
        Test: true,
        QiniuPublic: true,
        StandardPrivate: false
      }
    }),
    domain: defineSchema({
      required: false,
      title: '域名相关配置',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean,
          preset: {
            Test: true,
            QiniuPublic: true,
            StandardPrivate: false
          }
        }),
        autoGenerateTestDomain: defineSchema({
          required: false,
          title: '自动生成测试域名',
          kind: SchemaKind.Object,
          properties: {
            enable: defineSchema({
              default: false,
              required: false,
              title: '功能是否开启',
              description: '开启后创建空间成功时将会获取自动生成的测试域名并弹窗显示',
              kind: SchemaKind.Boolean,
              preset: {
                Test: true,
                QiniuPublic: true,
                StandardPrivate: false
              }
            })
          }
        })
      }
    })
  }
})

const baseSiteInfoSchema = defineSchema({
  required: true,
  title: '站点的基础配置',
  kind: SchemaKind.Object,
  properties: {
    favicon: defineSchema({
      required: true,
      title: '浏览器标签页图标',
      kind: SchemaKind.String,
      default: (rawData: string) => {
        // 这里这样写是避免 env 注入导致的语法错误
        const favicon = process.env.SITE_CONFIG.favicon
        return rawData || favicon || ''
      }
    }),
    pageTitle: defineSchema({
      required: true,
      title: '页面标题',
      kind: SchemaKind.String,
      default: (rawData: string) => {
        // 这里这样写是避免 env 注入导致的语法错误
        const pageTitle = process.env.SITE_CONFIG.pageTitle
        return rawData || pageTitle || ''
      }
    }),
    rootPath: defineSchema({
      required: true,
      default: '',
      title: '前端的根路径',
      kind: SchemaKind.String
    }),
    unknownExceptionMessageSuffix: defineSchema({
      default: '',
      required: true,
      title: '未知异常信息结尾',
      kind: SchemaKind.String
    }),
    notFoundPage: defineSchema({
      required: false,
      title: '404 页面配置',
      kind: SchemaKind.Object,
      properties: {
        url: defineSchema({
          default: '',
          required: false,
          title: '404 Not Found 页面地址',
          kind: SchemaKind.String
        }),
        fromUrlParamName: defineSchema({
          default: '',
          required: false,
          title: '用于记录跳转来源的查询参数名',
          kind: SchemaKind.String
        })
      }
    })
  }
})

const kodoFogSiteInfoSchema = defineSchema({
  required: true,
  title: '站点的基础配置',
  kind: SchemaKind.Object,
  properties: {
    ...baseSiteInfoSchema.properties,
    productName: defineSchema({
      default: '对象存储',
      required: true,
      title: '产品名称',
      kind: SchemaKind.String
    })
  }
})

const baseObjectStorageSchema = defineSchema({
  required: true,
  title: '对象存储的基础配置',
  kind: SchemaKind.Object,
  properties: {
    domain: defineSchema({
      required: false,
      title: '源站域名',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        }),
        description: defineSchema({
          default: '',
          required: false,
          title: '描述说明',
          kind: SchemaKind.String
        }),
        singleSourceHosts: defineSchema({
          required: false,
          title: '单线路回源配置',
          kind: SchemaKind.Object,
          properties: {
            flowOut: defineSchema({
              default: '',
              required: false,
              title: '流出流量',
              kind: SchemaKind.String
            })
          }
        }),
        allowPort: defineSchema({
          required: false,
          title: '允许输入端口',
          kind: SchemaKind.Object,
          properties: {
            enable: defineSchema({
              default: false,
              required: false,
              title: '是否开启',
              kind: SchemaKind.Boolean
            })
          }
        }),
        apiScopeName: defineSchema({
          default: '七牛原生接口',
          required: false,
          title: '源站域名默认协议名称',
          kind: SchemaKind.String
        }),
        sourceHosts: defineSchema({
          required: false,
          title: '源站 host',
          kind: SchemaKind.Array,
          items: defineSchema({
            default: '',
            required: false,
            title: '单个 host',
            kind: SchemaKind.String
          })
        }),
        awsS3: defineSchema({
          required: false,
          title: 'AWS S3 协议',
          kind: SchemaKind.Object,
          properties: {
            enable: defineSchema({
              default: false,
              required: false,
              title: '是否开启',
              kind: SchemaKind.Boolean
            }),
            sourceHosts: defineSchema({
              required: false,
              title: '源站 host',
              kind: SchemaKind.Array,
              items: defineSchema({
                default: '',
                required: false,
                title: '单个 host',
                kind: SchemaKind.String
              })
            })
          }
        })
      }
    }),
    bucketRemark: defineSchema({
      required: false,
      title: '空间备注',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    bucketRoutingRule: defineSchema({
      required: false,
      title: '空间重定向',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    bucketLog: defineSchema({
      required: false,
      title: '空间日志',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    bucketShare: defineSchema({
      required: false,
      title: '空间分享',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    bucketEncryption: defineSchema({
      required: false,
      title: '空间加密',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    fileMultiVersion: defineSchema({
      required: false,
      title: '文件多版本',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    fileLifeCycle: defineSchema({
      required: false,
      title: '生命周期',
      kind: SchemaKind.Object,
      properties: {
        deleteAfterHours: defineSchema({
          required: false,
          title: 'deleteAfterHours',
          kind: SchemaKind.Object,
          properties: {
            enable: defineSchema({
              default: false,
              required: false,
              title: '功能是否开启',
              kind: SchemaKind.Boolean
            })
          }
        })
      }
    }),
    referrerVerification: defineSchema({
      required: false,
      title: '请求来源验证',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        }),
        description: defineSchema({
          default: '',
          required: false,
          title: '功能说明',
          kind: SchemaKind.String
        })
      }
    }),
    worm: defineSchema({
      required: false,
      title: '对象锁定 WORM',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    })
  }
})

const regionObjectStorageSchema = defineSchema({
  required: true,
  title: '区域对象存储配置',
  kind: SchemaKind.Object,
  properties: {
    ...baseObjectStorageSchema.properties,
    uploadUrls: defineSchema({
      required: true,
      title: '上传 host',
      kind: SchemaKind.Array,
      items: defineSchema({
        default: '',
        required: true,
        title: '单个 host',
        kind: SchemaKind.String
      })
    }),
    downloadUrls: defineSchema({
      required: false,
      title: '下载 host',
      kind: SchemaKind.Array,
      items: defineSchema({
        default: '',
        required: true,
        title: '单个 host',
        kind: SchemaKind.String
      })
    }),
    resourceProxy: defineSchema({
      required: false,
      title: '资源请求代理',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    })
  }
})

const globalObjectStorageSchema = defineSchema({
  required: true,
  title: '全局对象存储配置',
  kind: SchemaKind.Object,
  properties: {
    ...baseObjectStorageSchema.properties,
    // 资源管理
    resourceManage: defineSchema({
      required: false,
      title: '资源管理旧版配置',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean,
          preset: {
            Test: true,
            QiniuPublic: true,
            StandardPrivate: false
          }
        }),
        upload: defineSchema({
          required: false,
          title: '上传相关配置',
          kind: SchemaKind.Object,
          properties: {
            description: defineSchema({
              default: '',
              required: false,
              title: '上传的描述说明',
              kind: SchemaKind.String,
              preset: {
                Test: '七牛云存储严禁上传包括反动、暴力、色情、违法、及侵权内容的文件。七牛有义务配合有关部门将上传违规文件的用户信息保存，并保留因配合调查而冻结账号的权利。<br/>国家秘密受法律保护。一切国家机关、武装力量、政党、社会团体、企事业单位和公民都有保守国家秘密的义务。 任何危害国家秘密安全的行为，都必须受到法律追究。请严格遵守保密法律法规，严禁在互联网上存储、处理、传输、发布涉密信息。',
                QiniuPublic: '七牛云存储严禁上传包括反动、暴力、色情、违法、及侵权内容的文件。七牛有义务配合有关部门将上传违规文件的用户信息保存，并保留因配合调查而冻结账号的权利。<br/>国家秘密受法律保护。一切国家机关、武装力量、政党、社会团体、企事业单位和公民都有保守国家秘密的义务。 任何危害国家秘密安全的行为，都必须受到法律追究。请严格遵守保密法律法规，严禁在互联网上存储、处理、传输、发布涉密信息。',
                StandardPrivate: ''
              }
            })
          }
        })
      }
    }),
    resourceManageV2: defineSchema({
      required: false,
      title: '资源管理新版配置',
      kind: SchemaKind.Object,
      properties: {
        upload: defineSchema({
          required: false,
          title: '上传相关配置',
          kind: SchemaKind.Object,
          properties: {
            description: defineSchema({
              default: '',
              required: false,
              title: '上传的描述说明',
              kind: SchemaKind.String,
              preset: {
                Test: '严禁上传包含反动、暴力、色情、违法、及侵权内容的文件。<a href="https://developer.qiniu.com/kodo/8562/upload-a-file">查看完整上传须知</a>',
                QiniuPublic: '严禁上传包含反动、暴力、色情、违法、及侵权内容的文件。<a href="https://developer.qiniu.com/kodo/8562/upload-a-file">查看完整上传须知</a>',
                StandardPrivate: ''
              }
            })
          }
        })
      }
    }),
    storageType: defineSchema({
      required: true,
      title: '存储类型',
      kind: SchemaKind.Object,
      properties: {
        archive: defineSchema({
          required: true,
          title: '归档配置',
          kind: SchemaKind.Object,
          properties: {
            enable: defineSchema({
              default: false,
              required: true,
              title: '功能是否开启',
              kind: SchemaKind.Boolean
            })
          }
        }),
        lowFrequency: defineSchema({
          required: true,
          title: '低频配置',
          kind: SchemaKind.Object,
          properties: {
            enable: defineSchema({
              default: false,
              required: true,
              title: '功能是否开启',
              kind: SchemaKind.Boolean
            })
          }
        }),
        deepArchive: defineSchema({
          required: true,
          title: '深度归档',
          kind: SchemaKind.Object,
          properties: {
            enable: defineSchema({
              default: false,
              required: true,
              title: '功能是否开启',
              kind: SchemaKind.Boolean
            })
          }
        })
      }
    }),
    overview: defineSchema({
      required: false,
      title: '全局概览配置',
      kind: SchemaKind.Object,
      properties: {
        description: defineSchema({
          default: '',
          required: false,
          title: '功能说明',
          kind: SchemaKind.String
        })
      }
    }),
    deployMode: defineSchema({
      default: '',
      required: false,
      title: '全局概览配置',
      kind: SchemaKind.String
    }),
    bucketList: defineSchema({
      required: false,
      title: '空间列表',
      kind: SchemaKind.Object,
      properties: {
        description: defineSchema({
          default: '',
          required: false,
          title: '功能说明',
          kind: SchemaKind.String
        })
      }
    }),
    createBucket: defineSchema({
      required: false,
      title: '创建空间',
      kind: SchemaKind.Object,
      properties: {
        description: defineSchema({
          default: '',
          required: false,
          title: '功能说明',
          kind: SchemaKind.String
        })
      }
    }),
    transfer: defineSchema({
      required: false,
      title: '跨区域同步',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        }),
        description: defineSchema({
          default: '',
          required: false,
          title: '功能说明',
          kind: SchemaKind.String
        }),
        crossProduct: defineSchema({
          required: false,
          title: '跨产品',
          kind: SchemaKind.Object,
          properties: {
            enable: defineSchema({
              default: false,
              required: false,
              title: '功能是否开启',
              kind: SchemaKind.Boolean
            }),
            sourceProductSelect: defineSchema({
              required: false,
              title: '源产品选择',
              kind: SchemaKind.Object,
              properties: {
                enable: defineSchema({
                  default: false,
                  required: false,
                  title: '功能是否开启',
                  kind: SchemaKind.Boolean
                })
              }
            })
          }
        })
      }
    })

  }
})

export const regionApplySchema = defineSchema({
  required: false,
  title: '区域申请配置',
  kind: SchemaKind.Object,
  properties: {
    enable: defineSchema({
      default: false,
      required: true,
      title: '功能是否开启',
      kind: SchemaKind.Boolean
    }),
    notice: defineSchema({
      required: false,
      title: '区域申请通知',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: true,
          title: '开启',
          description: '开启后将会在站点上方显示区域上线开通申请的入口通知',
          kind: SchemaKind.Boolean
        })
      }
    }),
    description: defineSchema({
      default: '',
      required: true,
      title: '功能说明',
      kind: SchemaKind.String
    }),
    form: defineSchema({
      required: true,
      title: '申请表单配置',
      kind: SchemaKind.Object,
      properties: {
        description: defineSchema({
          default: '',
          required: true,
          title: '功能说明',
          kind: SchemaKind.String
        }),
        agreementUrl: defineSchema({
          default: '',
          required: true,
          title: '使用须知链接',
          kind: SchemaKind.String
        }),
        expectedUsage: defineSchema({
          required: true,
          title: '预期使用情况选择',
          kind: SchemaKind.Array,
          items: defineSchema({
            title: '单个配置',
            required: true,
            kind: SchemaKind.Object,
            properties: {
              key: defineSchema({
                default: '',
                required: true,
                title: 'key',
                kind: SchemaKind.String
              }),
              name: defineSchema({
                default: '',
                required: true,
                title: '名词',
                kind: SchemaKind.String
              })
            }
          })
        })
      }
    })
  }
})

export const regionSchema = defineSchema({
  required: true,
  title: '单个区域配置',
  kind: SchemaKind.Object,
  properties: {
    name: defineSchema({
      default: '',
      required: true,
      title: '区域的名字',
      kind: SchemaKind.String
    }),
    symbol: defineSchema({
      default: '',
      required: true,
      title: '区域的唯一 id',
      kind: SchemaKind.String
    }),
    description: defineSchema({
      default: '',
      required: false,
      title: '区域说明',
      kind: SchemaKind.String
    }),
    tag: defineSchema({
      default: '',
      required: false,
      title: '区域的标签',
      kind: SchemaKind.String
    }),
    invisible: defineSchema({
      default: false,
      required: false,
      title: '区域是否可见',
      kind: SchemaKind.Boolean
    }),
    overseas: defineSchema({
      default: false,
      required: false,
      title: '是否是海外区域',
      kind: SchemaKind.Boolean
    }),
    dora: doraConfigSchema,
    apply: regionApplySchema,
    objectStorage: regionObjectStorageSchema
  }
})

const baseSignInSchema = defineSchema({
  required: true,
  title: '登录/登出配置',
  kind: SchemaKind.Object,
  properties: {
    signInUrl: defineSchema({
      default: '',
      required: true,
      title: '登录地址',
      kind: SchemaKind.String
    }),
    signOutUrl: defineSchema({
      default: '',
      required: true,
      title: '登出地址',
      kind: SchemaKind.String
    })
  }
})

const productUrlSchema = defineSchema({
  required: false,
  title: '产品地址配置',
  kind: SchemaKind.Object,
  properties: {
    productUrl: defineSchema({
      required: true,
      title: '产品地址配置',
      type: Array<string>(),
      kind: SchemaKind.Array,
      normalize: (v: string[] | string) => (Array.isArray(v) ? v : [v]), // 兼容之前的允许配置单个字符串的情况
      items: defineSchema({
        default: `unavailable:${(Math.random() * 1e6).toString(16)}`, // 默认值使用随机数，确保不会命中
        required: true,
        title: '地址',
        description: '去除协议后的完整地址，应包含 rootPath',
        kind: SchemaKind.String
      })
    })
  }
})

export const kodoFogBaseConfigSchema = defineSchema({
  required: true,
  title: 'kodo Fog 基础配置',
  kind: SchemaKind.Object,
  properties: {
    ...devToolsConfigSchema.properties,
    ...productUrlSchema.properties,
    site: kodoFogSiteInfoSchema,
    signIn: baseSignInSchema,
    layout: defineSchema({
      required: true,
      title: 'kodo Fog 布局配置',
      kind: SchemaKind.Object,
      properties: {
        type: defineSchema({
          default: '',
          required: true,
          title: '布局类型',
          description: '可选 public built-in',
          kind: SchemaKind.String
        })
      }
    })
  }
})

export const helpDocumentSchema = defineSchema({
  required: true,
  title: '帮助文档配置',
  kind: SchemaKind.Object,
  properties: {
    sla: defineSchema({
      default: '',
      required: false,
      title: 'SLA 说明',
      kind: SchemaKind.String
    }),   // SLA 说明
    maxAge: defineSchema({
      default: '',
      required: false,
      title: '文件客户端缓存 maxAge',
      kind: SchemaKind.String
    }),   // 文件客户端缓存 maxAge
    event: defineSchema({
      default: '',
      required: false,
      title: '事件通知',
      kind: SchemaKind.String
    }),   // 事件通知
    access: defineSchema({
      default: '',
      required: false,
      title: '访问控制',
      kind: SchemaKind.String
    }),   // 访问控制
    source: defineSchema({
      default: '',
      required: false,
      title: '镜像回源',
      kind: SchemaKind.String
    }),   // 镜像回源
    crossOrigin: defineSchema({
      default: '',
      required: false,
      title: '跨域访问',
      kind: SchemaKind.String
    }),   // 跨域访问
    authorization: defineSchema({
      default: '',
      required: false,
      title: '空间授权',
      kind: SchemaKind.String
    }),   // 空间授权
    safetyReferrer: defineSchema({
      default: '',
      required: false,
      title: 'Referrer 防盗链',
      kind: SchemaKind.String
    }),   // Referrer 防盗链
    lifecycle: defineSchema({
      default: '',
      required: false,
      title: '生命周期',
      kind: SchemaKind.String
    }),   // 生命周期
    version: defineSchema({
      default: '',
      required: false,
      title: '版本控制',
      kind: SchemaKind.String
    }),   // 版本控制
    dataProtectionSSEncryption: defineSchema({
      default: '',
      required: false,
      title: '服务端加密',
      kind: SchemaKind.String
    }),   // 服务端加密
    downloadToken: defineSchema({
      default: '',
      required: false,
      title: '下载 token',
      kind: SchemaKind.String
    }),   // 下载 token
    transfer: defineSchema({
      default: '',
      required: false,
      title: '跨区域同步',
      kind: SchemaKind.String
    }),   // 跨区域同步
    resourceManage: defineSchema({
      default: '',
      required: false,
      title: '文件管理',
      kind: SchemaKind.String
    }),   // 文件管理
    batchDownload: defineSchema({
      default: '',
      required: false,
      title: '批量下载',
      kind: SchemaKind.String
    }),
    domain: defineSchema({
      default: '',
      required: false,
      title: '域名',
      kind: SchemaKind.String
    }),   // 域名
    log: defineSchema({
      default: '',
      required: false,
      title: '空间日志',
      kind: SchemaKind.String
    }),   // 空间日志
    censor: defineSchema({
      default: '',
      required: false,
      title: '内容审核',
      kind: SchemaKind.String
    }),   // 内容审核
    originalProtection: defineSchema({
      default: '',
      required: false,
      title: '原图保护',
      kind: SchemaKind.String
    }),   // 原图保护
    originalResourceProtection: defineSchema({
      default: '',
      required: false,
      title: '原始资源保护',
      kind: SchemaKind.String
    }),
    testDomainAccessRestrictionRules: defineSchema({
      default: '',
      required: false,
      title: '测试域名使用规范',
      kind: SchemaKind.String
    }),   // 测试域名使用规范
    configureCnameDomain: defineSchema({
      default: '',
      required: false,
      title: '域名 Cname 配置帮助文档',
      kind: SchemaKind.String
    }),   // 域名 Cname 配置帮助文档
    bucketTagManage: defineSchema({
      default: '',
      required: false,
      title: '标签管理',
      description: 'TODO: 标签管理 暂时没有文档',
      kind: SchemaKind.String
    }),   // TODO: 标签管理 暂时没有文档
    imageStyleIntro: defineSchema({
      default: '',
      required: false,
      title: '图片样式简介',
      kind: SchemaKind.String
    }),  // 图片样式简介
    imageStyle: defineSchema({
      default: '',
      required: false,
      title: '图片样式处理文档',
      kind: SchemaKind.String
    }),  // 图片样式处理文档
    mediaStyle: defineSchema({
      default: '',
      required: false,
      title: '多媒体样式处理说明',
      kind: SchemaKind.String
    }),
    imageProcess: defineSchema({
      default: '',
      required: false,
      title: '图片样式处理文档',
      kind: SchemaKind.String
    }),  // 图片样式处理文档
    videoProcess: defineSchema({
      default: '',
      required: false,
      title: '视频样式处理文档',
      kind: SchemaKind.String
    }),  // 视频样式处理文档
    styleSeparator: defineSchema({
      default: '',
      required: false,
      title: '样式分隔符',
      kind: SchemaKind.String
    }),   // 样式分隔符
    transcodeStyle: defineSchema({
      default: '',
      required: false,
      title: '转码样式',
      kind: SchemaKind.String
    }),   // 转码样式
    magicVars: defineSchema({
      default: '',
      required: false,
      title: '魔法变量',
      kind: SchemaKind.String
    }),   // 魔法变量
    chtype: defineSchema({
      default: '',
      required: false,
      title: '文件类型',
      kind: SchemaKind.String
    }),   // 文件类型
    category: defineSchema({
      default: '',
      required: false,
      title: '存储类型',
      kind: SchemaKind.String
    }),   // 存储类型
    testDomain: defineSchema({
      default: '',
      required: false,
      title: '测试域名的说明',
      kind: SchemaKind.String
    }),   // 测试域名的说明
    s3AWS: defineSchema({
      default: '',
      required: false,
      title: 's3 AWS 说明',
      kind: SchemaKind.String
    }),  // s3 AWS 说明
    multiPartUploadInterface: defineSchema({
      default: '',
      required: false,
      title: '分片上传接口',
      kind: SchemaKind.String
    }),
    modifyTheFileStatus: defineSchema({
      default: '',
      required: false,
      title: '修改文件状态',
      kind: SchemaKind.String
    }),  // 修改文件状态
    worm: defineSchema({
      default: '',
      required: false,
      title: '对象锁定',
      kind: SchemaKind.String
    }),  // 对象锁定
    wormSetting: defineSchema({
      default: '',
      required: false,
      title: '设置对象锁定',
      kind: SchemaKind.String
    }),  // 设置对象锁定
    bucketRemark: defineSchema({
      default: '',
      required: false,
      title: '空间备注',
      kind: SchemaKind.String
    }),  // 空间备注
    routingRuleSetting: defineSchema({
      default: '',
      required: false,
      title: '重定向规则管理(设置)',
      kind: SchemaKind.String
    }),
    staticPageDetail: defineSchema({
      default: '',
      required: false,
      title: '静态页面管理(详情)',
      kind: SchemaKind.String
    }),
    staticPageSetting: defineSchema({
      default: '',
      required: false,
      title: '静态页面管理(设置)',
      kind: SchemaKind.String
    }),
    routingRuleDetail: defineSchema({
      default: '',
      required: false,
      title: '重定向规则管理(详情)',
      kind: SchemaKind.String
    })
  }
})

export const kodoFogConfigSchema = defineSchema({
  required: false,
  title: 'kodo Fog 配置',
  kind: SchemaKind.Object,
  properties: {
    ...kodoFogBaseConfigSchema.properties,
    documentUrls: helpDocumentSchema,
    regions: defineSchema({
      required: true,
      title: '区域配置',
      kind: SchemaKind.Array,
      items: regionSchema
    }),
    dora: doraConfigSchema,
    pili: defineSchema({
      required: false,
      title: '直播',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    fusion: fusionConfigSchema,
    objectStorage: globalObjectStorageSchema,
    certificate: defineSchema({
      required: false,
      title: '证书',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: true,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        }),
        service: defineSchema({
          default: '',
          required: true,
          title: '证书所使用的服务',
          description: 'fusion | storage',
          kind: SchemaKind.String
        })
      }
    }),
    streamPush: defineSchema({
      required: false,
      title: '拉流转推',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: false,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    statistics: defineSchema({
      required: false,
      title: '统计分析配置',
      kind: SchemaKind.Object,
      properties: {
        bucketFlow: defineSchema({
          required: false,
          title: '空间流量',
          kind: SchemaKind.Object,
          properties: {
            singleOut: defineSchema({
              required: false,
              title: 'singleOut',
              kind: SchemaKind.Object,
              properties: {
                enable: defineSchema({
                  default: false,
                  required: false,
                  title: '功能是否开启',
                  kind: SchemaKind.Boolean
                })
              }
            })
          }
        })
      }
    })
  }
})

const userConfigSchema = defineSchema({
  required: true,
  title: '用户配置',
  kind: SchemaKind.Object,
  properties: {
    enable: defineSchema({
      default: false,
      required: true,
      title: '功能是否开启',
      kind: SchemaKind.Boolean
    }),
    key: defineSchema({
      required: true,
      title: '密钥管理',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: true,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    profile: defineSchema({
      required: true,
      title: '用户信息',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: true,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    oplog: defineSchema({
      required: true,
      title: '操作日志',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: true,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        })
      }
    }),
    security: defineSchema({
      required: true,
      title: '安全设置',
      kind: SchemaKind.Object,
      properties: {
        enable: defineSchema({
          default: false,
          required: true,
          title: '功能是否开启',
          kind: SchemaKind.Boolean
        }),
        password: defineSchema({
          required: true,
          title: '密码配置',
          kind: SchemaKind.Object,
          properties: {
            rule: defineSchema({
              required: false,
              title: '密码规则',
              kind: SchemaKind.Object,
              description: '不配置时使用服务端的规则',
              properties: {
                min_length: defineSchema({
                  default: 0,
                  required: true,
                  title: '最小长度',
                  kind: SchemaKind.Number
                }), // 最小长度
                expire_days: defineSchema({
                  default: 0,
                  required: true,
                  title: '过期时间',
                  description: '单位为天（为 0 时永不过期）',
                  kind: SchemaKind.Number
                }), // 过期时间、单位为天（为 0 时永不过期）
                min_type_num: defineSchema({
                  default: 0,
                  required: true,
                  title: '最少的所需的类型',
                  kind: SchemaKind.Number
                }), // 最少的所需的类型
                must_contain: defineSchema({
                  required: true,
                  title: '必含类型',
                  kind: SchemaKind.Array,
                  items: defineSchema({
                    default: '',
                    required: true,
                    title: '必含类型',
                    type: '' as PasswordCharset,
                    kind: SchemaKind.String
                  })
                })
              }
            })
          }
        })
      }
    })
  }
})

export const platformBaseConfigSchema = defineSchema({
  required: true,
  title: '登录/登出配置',
  kind: SchemaKind.Object,
  properties: {
    ...devToolsConfigSchema.properties,
    ...productUrlSchema.properties,
    signIn: defineSchema({
      required: true,
      title: '登录/登出配置',
      kind: SchemaKind.Object,
      properties: {
        ...baseSignInSchema.properties,
        type: defineSchema({
          default: '',
          required: true,
          title: '登录类型',
          description: '可选 local, external-sso',
          kind: SchemaKind.String
        })
      }
    }),
    site: defineSchema({
      required: true,
      title: '登录/登出配置',
      kind: SchemaKind.Object,
      properties: {
        ...baseSiteInfoSchema.properties,
        logo: defineSchema({
          default: '',
          required: true,
          title: 'logo 地址',
          kind: SchemaKind.String
        }),
        copyright: defineSchema({
          default: '',
          required: true,
          title: 'copyright 信息',
          kind: SchemaKind.String
        })
      }
    })
  }
})

export const platformConfigSchema = defineSchema({
  required: false,
  title: 'platform 配置',
  kind: SchemaKind.Object,
  properties: {
    ...platformBaseConfigSchema.properties,
    user: userConfigSchema,
    documentUrls: defineSchema({
      required: true,
      title: '帮助文档配置',
      kind: SchemaKind.Object,
      properties: {
        aksk: defineSchema({
          default: '',
          required: false,
          title: 'aksk 的文档链接',
          kind: SchemaKind.String
        })
      }
    })
  }
})

export const combinedConfig = defineSchema({
  required: true,
  title: '登陆后的完整配置',
  kind: SchemaKind.Object,
  properties: {
    [App.Kodo]: kodoFogConfigSchema,
    [App.Fog]: kodoFogConfigSchema,
    [App.Platform]: platformConfigSchema
  }
})

export const combinedBaseConfig = defineSchema({
  required: true,
  title: '未登陆前的完整配置',
  kind: SchemaKind.Object,
  properties: {
    [App.Kodo]: kodoFogBaseConfigSchema,
    [App.Fog]: kodoFogBaseConfigSchema,
    [App.Platform]: platformBaseConfigSchema
  }
})
