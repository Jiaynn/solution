/**
 * @file 对配置文件进行 normalize 处理的工具
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { isPlainObject, forEach, merge, cloneDeep } from 'lodash'

import { IConfigResponse } from 'kodo/apis/config'

import { IKodoFogConfig } from './types'
import * as configT from './schema'

export function normalizeEnable<T extends object>(data: T): T {
  const config = cloneDeep(data)

  function initEnable(target: any, parentEnable = true) {
    let currentEnable = parentEnable

    if (isPlainObject(target) && Object.prototype.hasOwnProperty.call(target, 'enable')) {
      target.enable = parentEnable && target.enable
      currentEnable = target.enable
    }

    if (isPlainObject(target) || Array.isArray(target)) {
      forEach(target, item => initEnable(item, currentEnable))
    }
  }

  initEnable(config)
  return config
}

// 没想到什么好办法把这一步迁移到通用的 normalize 去
// 将第一层结构的 objectStorage, dora (默认)配置 merge 到 region 里
export function normalizeConfigResponse(data: IConfigResponse): IConfigResponse {
  const normalizeRegion = (appConfig?: IKodoFogConfig): IKodoFogConfig | undefined => {
    if (appConfig == null) return
    const { objectStorage, dora, regions } = appConfig
    const normalizedRegions = regions.map(
      region => merge({}, { objectStorage, dora }, region)
    )
    return { ...appConfig, regions: normalizedRegions }
  }

  const normalizedResponse = {
    ...data,
    fog: normalizeRegion(data.fog),
    kodo: normalizeRegion(data.kodo)
  }

  return normalizedResponse
}

export function normalize<S extends configT.TypedSchema>(
  schema: S,
  config: Partial<configT.ComputedJsonType<configT.TypedSchema>>
): configT.ComputedJsonType<S> {
  // 读取配置中设置的默认值
  type DefaultValue<T extends configT.DefaultValue<any>> = T extends configT.DefaultValue<infer R> ? R : unknown
  function getDefaultValue<T extends configT.DefaultValue<any>>(target: T, data: any): DefaultValue<T> {
    if (typeof target.default === 'function') return target.default(data)
    return target.default
  }

  // 执行配置中的预处理逻辑
  type NormalizeValue<T extends configT.Normalize<any>> = T extends configT.Normalize<infer R> ? R : unknown
  function preNormalize<T extends configT.Normalize<any>>(target: T, rawValue: any): NormalizeValue<T> {
    if (target.normalize !== null && typeof target.normalize === 'function') {
      return target.normalize(rawValue)
    }
    return rawValue
  }

  if (schema.kind === configT.SchemaKind.Object) {
    const newObject = {}
    // ts 4.1 不够智能
    const objectSchema = schema as configT.ObjectSchema
    const preNormalized = preNormalize(objectSchema, config)

    // 分别取计算所有的 properties
    for (const key in objectSchema.properties) {
      if (Object.prototype.hasOwnProperty.call(objectSchema.properties, key)) {
        const normalizeValue = normalize(
          objectSchema.properties[key],
          preNormalized?.[key] as any
        )

        newObject[key] = normalizeValue
      }
    }

    return newObject as any
  }

  if (schema.kind === configT.SchemaKind.String) {
    const stringSchema = schema as configT.StringSchema
    const finalValue = preNormalize(stringSchema, config)
      || getDefaultValue(stringSchema, config)
    return finalValue as any // ts 4.1 类型不够妙
  }

  if (schema.kind === configT.SchemaKind.Number) {
    const numberSchema = schema as configT.NumberSchema
    const finalValue = preNormalize(numberSchema, config)
      || getDefaultValue(numberSchema, config)
    return finalValue as any // ts 4.1 类型不够妙
  }

  if (schema.kind === configT.SchemaKind.Boolean) {
    const booleanSchema = schema as configT.BooleanSchema
    const finalValue = preNormalize(booleanSchema, config)
      || getDefaultValue(booleanSchema, config)
    return finalValue as any // ts 4.1 类型不够妙
  }

  if (schema.kind === configT.SchemaKind.Array) {
    const newArray: unknown[] = []
    // ts 4.1 不够智能
    const arraySchema = schema as configT.ArraySchema
    const preNormalized = preNormalize(schema, config)

    if (Array.isArray(preNormalized) && preNormalized.length > 0) {
      for (let index = 0; index < preNormalized.length; index++) {
        newArray[index] = normalize(
          arraySchema.items as any,
          preNormalized[index]
        )
      }
    }

    return newArray as any
  }

  return config as any
}

export function convertToStandard<S extends configT.TypedSchema>(schema: S): any {
  if (schema.kind === configT.SchemaKind.Object) {
    const newObject = {
      type: schema.kind,
      title: schema.title,
      properties: {},
      description: schema.description,
      additionalProperties: false, // 不允许出现未定义的属性
      required: new Array<string>()
    }

    // ts 4.1 不够智能
    const objectSchema = schema as configT.ObjectSchema

    for (const key in objectSchema.properties) {
      if (Object.prototype.hasOwnProperty.call(objectSchema.properties, key)) {
        const propertySchema = objectSchema.properties[key]
        newObject.properties[key] = convertToStandard(propertySchema)
        if (propertySchema && 'required' in propertySchema) {
          if (propertySchema.required) {
            newObject.required.push(key)
          }
        }
      }
    }

    return newObject
  }

  if (schema.kind === configT.SchemaKind.Array) {
    const arraySchema = schema as configT.ArraySchema

    return {
      type: schema.kind,
      title: schema.title,
      description: schema.description,
      items: convertToStandard(arraySchema.items as configT.TypedSchema)
    }
  }

  const newSchema = {
    type: schema.kind,
    title: schema.title,
    description: schema.description
  }

  return newSchema
}
