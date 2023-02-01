/**
 * @file 质量保障服务状态管理
 * @author linchen <linchen@qiniu.com>
 */

import moment from 'moment'
import { observable, action, computed } from 'mobx'
import autobind from 'autobind-decorator'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import { getFirstDayOfNextMonth } from 'cdn/transforms/datetime'

import { PrimeLevel, PrimeStatus } from 'cdn/constants/qas'

import QasApis, { IQasInfo } from 'cdn/apis/qas'

enum LoadingType {
  GetQasInfo = 'getQasInfo',
  CancelPrime = 'cancelPrime',
  OpenPrime = 'openPrime'
}

export function humanizeCancelPrime(level: PrimeLevel, qasInfo: IQasInfo) {
  const target = qasInfo.levelstates.find(item => item.level === level)
  switch (target?.state) {
    case PrimeStatus.Actived: {
      return `已申请关闭，将于 ${getFirstDayOfNextMonth(moment())}起生效`
    }
    default: {
      return '取消成功'
    }
  }
}

export function humanizeOpenPrime(level: PrimeLevel, qasInfo: IQasInfo) {
  const target = qasInfo.levelstates.find(item => item.level === level)
  switch (target?.state) {
    case PrimeStatus.Original: {
      return `已申请开通，将于 ${getFirstDayOfNextMonth(moment())}起生效`
    }
    default: {
      return '开通成功'
    }
  }
}

@injectable()
export default class LocalStore extends Store {

  loadings = Loadings.collectFrom(this, LoadingType)

  @observable targetLevel!: PrimeLevel
  @observable isPrimeCheckVisible = false
  @observable.shallow qasInfo: IQasInfo = { levelstates: [] }

  constructor(
    private toasterStore: ToasterStore,
    private qasApis: QasApis
  ) {
    super()
    ToasterStore.bindTo(this, this.toasterStore)
  }

  @computed get activePrimeLevel() {
    const items = this.qasInfo.levelstates.filter(
      item => item.state === PrimeStatus.Actived
    )
    return items.length > 0 ? items[0].level : undefined
  }

  @computed get toonPrimeLevel() {
    const item = this.qasInfo.levelstates.find(it => it.state === PrimeStatus.Toon)
    return item ? item.level : undefined
  }

  @computed get isLoading() {
    return this.loadings.isLoading(LoadingType.GetQasInfo)
  }

  @action.bound updateCheckPrimeVisible(visible: boolean) {
    this.isPrimeCheckVisible = visible
  }

  @action.bound updateTargetLevel(level: PrimeLevel) {
    this.targetLevel = level
  }

  @action.bound updateQasInfo(info: IQasInfo) {
    this.qasInfo = info
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetQasInfo)
  getQasInfo() {
    return this.qasApis.getQasInfo().then(this.updateQasInfo)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.CancelPrime)
  cancelPrime(level: PrimeLevel) {
    return this.qasApis.cancelPrime(level).then(() => {
      this.toasterStore.success(humanizeCancelPrime(level, this.qasInfo))
      this.getQasInfo()
    })
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.OpenPrime)
  openPrime() {
    return this.qasApis.openPrime(this.targetLevel).then(() => {
      this.toasterStore.success(humanizeOpenPrime(this.targetLevel, this.qasInfo))
      this.getQasInfo()
    })
  }

  init() {
    this.getQasInfo()
  }
}
