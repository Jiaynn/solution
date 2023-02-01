/**
 * @author: corol
 * @github: github.com/huangbinjie
 * @description: 规则编辑器的控制器(store)
 * @created: Mon Jul 08 2019
 *
 * Copyright (c) 2019 Qiniu
 */

import { observable, action, computed, makeObservable } from 'mobx'
import { FormState, FieldState } from 'formstate'
import { injectProps } from 'qn-fe-core/local-store'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'
import { StorageType } from 'kodo-base/lib/constants'

import { getValuesFromFormState, ValidatableObject } from 'kodo/utils/formstate'

import { ConfigStore } from 'kodo/stores/config'

import { LifecycleRule } from 'kodo/apis/bucket/setting/lifecycle-rules'

export enum PrefixType {
  Global = 'global',
  Prefix = 'prefix'
}

export enum EditType {
  Update = 'update',
  Add = 'add'
}

function positiveNumberValidator(value: string) {
  if (!value || !/^[0-9]+$/.test(value) || +value <= 0) {
    return '请输入大于 0 的正整数'
  }

  if (!value || !/^[0-9]+$/.test(value) || +value > 999999999) {
    return '请输入小于或等于 999999999 的正整数'
  }
}

export interface IFromState {
  name: string
  prefixType: PrefixType
  prefix: string
  showToLineAfterDays: boolean
  showToArchiveAfterDays: boolean
  showToDeepArchiveAfterDays: boolean
  showDeleteAfterDays: boolean
  showHistoryDeleteAfterDays: boolean
  showHistoryToLineAfterDays: boolean
  toLineAfterDays: string
  toArchiveAfterDays: string
  toDeepArchiveAfterDays: string
  historyToLineAfterDays: string
  deleteAfterDays: string
  historyDeleteAfterDays: string
}

export type RuleEditorFormState = ValidatableObject<IFromState>

@injectable()
export default class RuleEditorStore extends Store {
  constructor(
    private configStore: ConfigStore,
    @injectProps() public props: { getBucketRules: () => LifecycleRule[]}
  ) {
    super()
    makeObservable(this)
  }

  type = EditType.Add

  @observable region: string
  @observable visible = false
  @observable hasSetDaysError = false

  defaultRule: LifecycleRule = {
    name: '',
    prefix: '',
    expiration: {
      days: 0
    },
    transition: [],
    noncurrent_version_expiration: {
      noncurrent_days: 0
    },
    noncurrent_version_transition: []
  }

  @observable.ref form = this.createFormState(this.defaultRule)

  @computed
  get regionConfig() {
    return this.configStore.getRegion({ region: this.region })
  }

  @computed
  get globalConfig() {
    return this.configStore.getFull()
  }

  createFormState(rule: LifecycleRule) {
    const formData = this.getFormDataFromRule(rule)

    const nameFormField = new FieldState<string>(formData.name).validators(value => {
      if (value === '') {
        return '规则名不能为空'
      }

      if (value.length > 50) {
        return '规则名长度不能超过 50 个字符'
      }

      if (!/^[0-9a-zA-Z_]+$/.test(value)) {
        return '规则名称仅支持由字母、数字、下划线组成'
      }

      if (this.type === EditType.Add) {
        if (this.props.getBucketRules().find(item => item.name === value)) {
          return '该名称已存在'
        }
      }
    })

    const prefixTypeFormField = new FieldState<PrefixType>(formData.prefixType)

    const prefixFormField = new FieldState<string>(formData.prefix)
      .validators(value => {
        // 如果 "规则策略" 选中的是 "对整个空间生效", 无需校验
        if (prefixTypeFormField.value === PrefixType.Global) {
          return
        }

        if (value === '') {
          return '前缀不能为空'
        }

        // 如果编辑之后的前缀名和原前缀名一致，无需处理
        if (formData.prefix === value) {
          return
        }

        if (this.props.getBucketRules().find(item => item.prefix === value)) {
          return '该策略已存在'
        }
      })

    // 是否开启 "转为低频存储" -- 当前文件
    const showToLineAfterDaysFormField = new FieldState<boolean>(formData.showToLineAfterDays)

    // 是否开启 "转为归档存储" -- 当前文件
    const showToArchiveAfterDaysFormField = new FieldState<boolean>(formData.showToArchiveAfterDays)

    // 是否开启 "转为深度归档存储" -- 当前文件
    const showToDeepArchiveAfterDaysFormField = new FieldState<boolean>(formData.showToDeepArchiveAfterDays)

    // 是否开启 "删除策略" -- 当前文件
    const showDeleteAfterDaysFormField = new FieldState<boolean>(formData.showDeleteAfterDays)

    // 是否开启 "删除策略" -- 历史文件
    const showHistoryDeleteAfterDaysFormField = new FieldState<boolean>(formData.showHistoryDeleteAfterDays)

    // 是否开启 "转为低频存储" -- 历史文件
    const showHistoryToLineAfterDaysFormField = new FieldState<boolean>(formData.showHistoryToLineAfterDays)

    const toLineAfterDaysFormField = new FieldState<string>(formData.toLineAfterDays)
    const toArchiveAfterDaysFormField = new FieldState<string>(formData.toArchiveAfterDays)
    const toDeepArchiveAfterDaysFormField = new FieldState<string>(formData.toDeepArchiveAfterDays)
    const deleteAfterDaysFormField = new FieldState<string>(formData.deleteAfterDays)

    // "转为低频存储" -- 当前文件
    toLineAfterDaysFormField
      .validators(value => {
        if (showToLineAfterDaysFormField.value === false) {
          return
        }

        const result = positiveNumberValidator(value)
        if (result) {
          return result
        }

      })

    // "转为归档存储" -- 当前文件
    toArchiveAfterDaysFormField
      .validators(value => {
        if (showToArchiveAfterDaysFormField.value === false) {
          return
        }

        const result = positiveNumberValidator(value)
        if (result) {
          return result
        }

      })

    // "转为深度归档存储" -- 当前文件
    toDeepArchiveAfterDaysFormField
      .validators(value => showToDeepArchiveAfterDaysFormField.value && positiveNumberValidator(value))

    // "转为低频存储" -- 历史文件
    const historyToLineAfterDaysFormField = new FieldState<string>(formData.historyToLineAfterDays)
      .validators(value => showHistoryToLineAfterDaysFormField.value && positiveNumberValidator(value))

    // "删除策略" -- 当前文件
    deleteAfterDaysFormField.validators(value => {
      if (showDeleteAfterDaysFormField.value === false) {
        return
      }

      const result = positiveNumberValidator(value)
      if (result) {
        return result
      }

    })

    // "删除策略" -- 历史文件
    const historyDeleteAfterDaysFormField = new FieldState<string>(formData.historyDeleteAfterDays)
      .validators(value => {
        if (showHistoryDeleteAfterDaysFormField.value === false) {
          return
        }

        const result = positiveNumberValidator(value)
        if (result) {
          return result
        }

      })

    return new FormState({
      name: nameFormField,
      prefixType: prefixTypeFormField,
      prefix: prefixFormField,
      showToLineAfterDays: showToLineAfterDaysFormField,
      showToArchiveAfterDays: showToArchiveAfterDaysFormField,
      showToDeepArchiveAfterDays: showToDeepArchiveAfterDaysFormField,
      showDeleteAfterDays: showDeleteAfterDaysFormField,
      showHistoryDeleteAfterDays: showHistoryDeleteAfterDaysFormField,
      showHistoryToLineAfterDays: showHistoryToLineAfterDaysFormField,
      toLineAfterDays: toLineAfterDaysFormField,
      toArchiveAfterDays: toArchiveAfterDaysFormField,
      toDeepArchiveAfterDays: toDeepArchiveAfterDaysFormField,
      historyToLineAfterDays: historyToLineAfterDaysFormField,
      deleteAfterDays: deleteAfterDaysFormField,
      historyDeleteAfterDays: historyDeleteAfterDaysFormField
    })
  }

  @action.bound
  validateSetDaysError() {
    const {
      toLineAfterDays,
      toArchiveAfterDays,
      toDeepArchiveAfterDays,
      deleteAfterDays,
      showDeleteAfterDays,
      showToArchiveAfterDays,
      showToDeepArchiveAfterDays,
      showToLineAfterDays,
      showHistoryToLineAfterDays,
      showHistoryDeleteAfterDays,
      historyToLineAfterDays,
      historyDeleteAfterDays
    } = this.form.$

    /**
     * 按 转低频间隔天数、转归档间隔天数、转深度归档间隔天数、删除间隔天数 的顺序，依次将用户设置的天数 push 进数组；
     * 然后遍历数组，检查是否是按从小到大的顺序排列，且不存在重复数值；
     * 如果不是，则表示当前设置不满足：转低频天数 < 转归档天数 < 转深度归档天数 < 删除天数
     */
    const dayIntervals: number[] = []

    const toLineAfterDaysVal = showToLineAfterDays.value ? +toLineAfterDays.value : 0
    const toArchiveAfterDaysVal = showToArchiveAfterDays.value ? +toArchiveAfterDays.value : 0
    const toDeepArchiveAfterDaysVal = showToDeepArchiveAfterDays.value ? +toDeepArchiveAfterDays.value : 0
    const deleteAfterDaysVal = showDeleteAfterDays.value ? +deleteAfterDays.value : 0

    if (toLineAfterDaysVal) { dayIntervals.push(toLineAfterDaysVal) }
    if (toArchiveAfterDaysVal) { dayIntervals.push(toArchiveAfterDaysVal) }
    if (toDeepArchiveAfterDaysVal) { dayIntervals.push(toDeepArchiveAfterDaysVal) }
    if (deleteAfterDaysVal) { dayIntervals.push(deleteAfterDaysVal) }

    for (let i = 1; i < dayIntervals.length; i += 1) {
      const prev = dayIntervals[i - 1]
      const current = dayIntervals[i]
      if (current == null) { return }
      if (prev >= current) {
        this.hasSetDaysError = true
        return
      }
    }

    const historyToLineAfterDaysVal = showHistoryToLineAfterDays.value ? +historyToLineAfterDays.value : 0
    const historyDeleteAfterDaysVal = showHistoryDeleteAfterDays.value ? +historyDeleteAfterDays.value : 0

    if (
      historyToLineAfterDaysVal
      && historyDeleteAfterDaysVal
      && historyToLineAfterDaysVal >= historyDeleteAfterDaysVal
    ) {
      this.hasSetDaysError = true
      return
    }

    this.hasSetDaysError = false
  }

  @action.bound open(region: string, rule?: LifecycleRule) {
    this.type = rule ? EditType.Update : EditType.Add
    this.form = this.createFormState(rule || this.defaultRule)
    this.hasSetDaysError = false
    this.region = region
    this.visible = true
  }

  @action.bound close() {
    this.visible = false
  }

  getRuleFromFormData(formData: IFromState): LifecycleRule {
    const rule: LifecycleRule = {
      name: formData.name,
      prefix: formData.prefixType === PrefixType.Prefix ? formData.prefix : '',
      expiration: {
        days: formData.showDeleteAfterDays ? Number(formData.deleteAfterDays) : 0
      },
      transition: [],
      noncurrent_version_expiration: {
        noncurrent_days: 0
      },
      noncurrent_version_transition: []
    }

    // 如果低频启用则可设置转自动转低频
    if (this.globalConfig.objectStorage.storageType.lowFrequency.enable) {
      if (formData.showToLineAfterDays) {
        rule.transition.push({ days: Number(formData.toLineAfterDays), storage_class: StorageType.LowFrequency })
      }
    }

    // 如果归档启用则可设置转自动转归档
    if (this.globalConfig.objectStorage.storageType.archive.enable) {
      if (formData.showToArchiveAfterDays) {
        rule.transition.push({ days: Number(formData.toArchiveAfterDays), storage_class: StorageType.Archive })
      }
    }

    if (this.globalConfig.objectStorage.storageType.deepArchive.enable) {
      if (formData.showToDeepArchiveAfterDays) {
        rule.transition.push({ days: Number(formData.toDeepArchiveAfterDays), storage_class: StorageType.DeepArchive })
      }
    }

    if (this.regionConfig.objectStorage.fileMultiVersion.enable) {
      // 当文件多版本启用，并且低频存储启动，则历史版本转低频可用
      if (this.globalConfig.objectStorage.storageType.lowFrequency.enable) {
        if (formData.showHistoryToLineAfterDays) {
          rule.noncurrent_version_transition.push(
            { noncurrent_days: Number(formData.historyToLineAfterDays), storage_class: StorageType.LowFrequency }
          )
        }
      }

      // 当文件多版本启用则历史版本删除可用
      if (formData.showHistoryDeleteAfterDays) {
        rule.noncurrent_version_expiration.noncurrent_days = Number(formData.historyDeleteAfterDays)
      }
    }

    return rule
  }

  getFormDataFromRule(rule: LifecycleRule): IFromState {
    const current = new Map<StorageType, number>()
    const history = new Map<StorageType, number>()
    const types = [StorageType.LowFrequency, StorageType.Archive, StorageType.DeepArchive]

    for (const key of types) {
      current.set(key, 0)
      history.set(key, 0)
    }

    if (rule.transition) {
      rule.transition.forEach(trans => {
        current.set(trans.storage_class, trans.days)
      })
    }
    if (rule.noncurrent_version_transition) {
      rule.noncurrent_version_transition.forEach(trans => {
        history.set(trans.storage_class, trans.noncurrent_days)
      })
    }

    return {
      name: rule.name,
      prefixType: rule.prefix ? PrefixType.Prefix : PrefixType.Global,
      prefix: rule.prefix,
      showToLineAfterDays: current.get(StorageType.LowFrequency)! > 0,
      showToArchiveAfterDays: current.get(StorageType.Archive)! > 0,
      showToDeepArchiveAfterDays: current.get(StorageType.DeepArchive)! > 0,
      showDeleteAfterDays: rule.expiration.days > 0,
      showHistoryDeleteAfterDays: rule.noncurrent_version_expiration.noncurrent_days > 0,
      showHistoryToLineAfterDays: history.get(StorageType.LowFrequency)! > 0,
      toLineAfterDays: current.get(StorageType.LowFrequency)! > 0 ? String(current.get(StorageType.LowFrequency)) : '60',
      historyToLineAfterDays: history.get(StorageType.LowFrequency)! > 0 ? String(history.get(StorageType.LowFrequency)) : '60',
      deleteAfterDays: rule.expiration.days! > 0 ? String(rule.expiration.days) : '360',
      historyDeleteAfterDays: rule.noncurrent_version_expiration.noncurrent_days > 0 ? String(rule.noncurrent_version_expiration.noncurrent_days) : '360',
      toArchiveAfterDays: current.get(StorageType.Archive)! > 0 ? String(current.get(StorageType.Archive)) : '90',
      toDeepArchiveAfterDays: current.get(StorageType.DeepArchive)! > 0 ? String(current.get(StorageType.DeepArchive)) : '180'
    }
  }

  getRuleData() {
    const formData = getValuesFromFormState(this.form)
    return this.getRuleFromFormData(formData)
  }
}
