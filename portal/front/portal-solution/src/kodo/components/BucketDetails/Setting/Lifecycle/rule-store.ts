/**
 * @author: corol
 * @github: github.com/huangbinjie
 * @created: Thu Jun 20 2019
 * @description: 规则 store
 *
 * Copyright (c) 2019 Qiniu
 */

import { observable, action, makeObservable } from 'mobx'
import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import { injectProps } from 'qn-fe-core/local-store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import { BucketStore } from 'kodo/stores/bucket'

import { LifecycleRuleApi, LifecycleRule } from 'kodo/apis/bucket/setting/lifecycle-rules'

export enum Loading {
  Rules = 'Rules',
  AddRule = 'AddRule',
  UpdateRule = 'UpdateRule'
}

@injectable()
export default class RuleStore extends Store {
  constructor(
    @injectProps() private props: { bucketName: string },
    toasterStore: Toaster,
    private bucketStore: BucketStore,
    private lifecycleApis: LifecycleRuleApi
  ) {
    super()
    makeObservable(this)
    Toaster.bindTo(this, toasterStore)
  }

  loadings = Loadings.collectFrom(this, ...Object.values(Loading))

  @observable.ref rules: LifecycleRule[] = []

  isLoading(key?: Loading) {
    return key ? this.loadings.isLoading(key) : !this.loadings.isAllFinished()
  }

  @Toaster.handle()
  fetchBucketInfo() {
    return this.bucketStore.fetchDetailsByName(this.props.bucketName)
  }

  @action.bound
  private updateRules(rules: LifecycleRule[]) {
    this.rules = rules
  }

  @Toaster.handle(undefined, '获取规则失败')
  @Loadings.handle(Loading.Rules)
  getRules() {
    return this.lifecycleApis.fetchRules(this.props.bucketName).then(p => p.rules || []).then(r => {
      this.updateRules(r)
    })
  }

  @Toaster.handle('新建规则成功')
  @Loadings.handle(Loading.AddRule)
  addRule(rule: LifecycleRule) {
    return this.lifecycleApis.putRule(this.props.bucketName, [...this.rules, rule])
  }

  @Toaster.handle('修改规则成功')
  @Loadings.handle(Loading.UpdateRule)
  updateRule(rule: LifecycleRule) {
    const otherRules = this.rules.filter(originalRule => !(originalRule.name === rule.name))
    return this.lifecycleApis.putRule(this.props.bucketName, [...otherRules, rule])
  }

  @Toaster.handle('删除规则成功')
  deleteRule(ruleName: string) {
    return this.lifecycleApis.deleteRule(this.props.bucketName, ruleName)
  }
}
