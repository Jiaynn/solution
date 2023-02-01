/**
 * @file alarm store
 * @author  zhouhang <zhouhang@qiniu.com>
 */

import { observable, action, computed } from 'mobx'
import autobind from 'autobind-decorator'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { FieldState, FormState } from 'formstate-x'

import Cluster from 'cdn/utils/async/cluster'

import { ModalStore } from 'cdn/stores/modal'

import { AlarmRuleSearchType, defaultAlarmRuleSearchType } from 'cdn/constants/alarm'

import AlarmRuleApis, { AlarmConfigForEdit, GetAlarmConfigResp } from 'cdn/apis/alarm/rule'
import { AlarmConfigForDisplay } from './List'
import { ExtraProps as AlarmModalExtraProps, Value as AlarmModalValue } from './Modal/AlarmModal'

export interface AlarmConfigQueryOptions {
  domain?: string
  name?: string
}

enum LoadingType {
  GetConfigList = 'getConfigList'
}

export type SearchFormState = FormState<{
  searchType: FieldState<AlarmRuleSearchType.Rule | AlarmRuleSearchType.Domain>
  domain: FieldState<string>
  rule: FieldState<string>
}>

export const initialSearchOptions = {
  searchType: defaultAlarmRuleSearchType,
  domain: '',
  rule: ''
}

export function createSearchFormState(): SearchFormState {
  return new FormState({
    searchType: new FieldState(initialSearchOptions.searchType),
    domain: new FieldState(initialSearchOptions.domain),
    rule: new FieldState(initialSearchOptions.rule)
  })
}

export function getSearchFormValue(state: SearchFormState): AlarmConfigQueryOptions {
  if (state.$.searchType.value === AlarmRuleSearchType.Rule) {
    return {
      name: state.$.rule.value
    }
  }
  return {
    domain: state.$.domain.value
  }
}

@injectable()
export default class LocalStore extends Store {

  searchFormState = createSearchFormState()

  loadings = Loadings.collectFrom(this, LoadingType)

  alarmModalStore = new ModalStore<AlarmModalExtraProps, AlarmModalValue>()

  @observable.ref displayConfigList: AlarmConfigForDisplay[] = []

  @observable.ref selectedIds: string[] = []

  constructor(
    private alarmRuleApis: AlarmRuleApis,
    private toasterStore: ToasterStore
  ) {
    super()
    ToasterStore.bindTo(this, this.toasterStore)
  }

  @computed get isLoading() {
    return this.loadings.isLoading(LoadingType.GetConfigList)
  }

  @computed get queryOptions(): AlarmConfigQueryOptions {
    return getSearchFormValue(this.searchFormState)
  }

  @action.bound updateSelectedIds(ids: string[]) {
    this.selectedIds = ids
  }

  @action.bound updateConfigResp(config: GetAlarmConfigResp) {
    this.displayConfigList = (config.result || []).map(it => ({
      domains: it.domains,
      ...it.rule
    })).sort((a, b) => (b.modified < a.modified ? -1 : 1))
  }

  @computed get filterConfigList() {
    let filteredConfigList = this.displayConfigList
    const name = this.queryOptions.name
    if (name) {
      filteredConfigList = filteredConfigList.filter(it => it.name.includes(name))
    }
    const domain = this.queryOptions.domain
    if (domain) {
      filteredConfigList = filteredConfigList.filter(config => (config.domains || []).some(
        it => it.includes(domain)
      ))
    }
    return filteredConfigList
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetConfigList)
  getConfigList() {
    return this.alarmRuleApis.getConfigList().then(this.updateConfigResp)
  }

  @ToasterStore.handle('更新成功！')
  upsertConfig(config: AlarmConfigForEdit) {
    return this.alarmRuleApis.upsertConfig(
      {
        ...config,
        isEnable: true
      }
    ).then(() => { this.getConfigList() })
  }

  @ToasterStore.handle('更新状态成功！')
  updateStatus(config: AlarmConfigForDisplay, isEnable: boolean) {
    return this.alarmRuleApis.upsertConfig({
      ...config,
      isEnable
    }).then(() => { this.getConfigList() })
  }

  @ToasterStore.handle('删除成功！')
  deleteConfig(ruleId: string) {
    return this.alarmRuleApis.deleteConfig(ruleId).then(() => { this.getConfigList() })
  }

  batchDeleteConfigs() {
    const deleteLog: string[] = []
    const deleteFailedLog: string[] = []
    const requestTask = (ruleId: string) => this.alarmRuleApis.deleteConfig(ruleId).then(
      () => { deleteLog.push(ruleId) },
      () => { deleteFailedLog.push(ruleId) }
    )
    const clusterTaskWorkerNum = 5
    const cluster = new Cluster(requestTask, clusterTaskWorkerNum)
    return cluster.start(this.selectedIds).then(() => {
      if (deleteLog.length === this.selectedIds.length) {
        this.toasterStore.success('批量删除成功！')
      } else {
        this.toasterStore.error(` ${(deleteFailedLog || []).length} 个删除失败 `)
      }
    }).then(() => { this.getConfigList() })
  }

  init() {
    this.getConfigList()
    this.addDisposer(this.searchFormState.dispose)
  }
}
