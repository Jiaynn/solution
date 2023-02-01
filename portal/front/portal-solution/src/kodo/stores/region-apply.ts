/**
 * @file region apply store
 * @author yinxulai <me@yinxulai.com>
 */

import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'
import { Modal } from 'react-icecream'
import autobind from 'autobind-decorator'
import { action, observable, runInAction, makeObservable } from 'mobx'
import { FieldState } from 'formstate-x'

import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { RouterStore } from 'portal-base/common/router'

import { ConfigStore } from 'kodo/stores/config'

import { getPublicIdentityChoicePath } from 'kodo/routes/identity'

import { RegionSymbol } from 'kodo/constants/region'

import { RegionApis, ApplyStatus, IRegionApplyRecord } from 'kodo/apis/region'

import { RegionApply } from './config/types'

@injectable()
export class RegionApplyStore extends Store {
  constructor(
    private toasterStore: Toaster,
    private regionApis: RegionApis,
    private configStore: ConfigStore,
    private userInfoStore: UserInfo,
    private routerStore: RouterStore
  ) {
    super()
    makeObservable(this)
    Toaster.bindTo(this, this.toasterStore)
    this.addDisposer(this.estimatedCapacity.dispose)
    this.addDisposer(this.agreeUserAgreement.dispose)
  }

  @observable.ref visible = false
  @observable.ref region: RegionSymbol | undefined = undefined
  @observable.ref applyOptions: RegionApply | undefined = undefined

  estimatedCapacity = new FieldState('')
  agreeUserAgreement = new FieldState(false)

  @observable.ref private applyRecordList: IRegionApplyRecord[]

  @autobind
  async open(region: RegionSymbol) {
    await this.fetchApplyRecordList()

    if (this.isApproved(region)) {
      Modal.success({ title: '已通过', content: '申请已通过，无需重复申请。' })
      return
    }

    if (this.hasAuditing(region)) {
      Modal.info({ title: '正在审核', content: '尚有申请正在审核中，无需重复申请。' })
      return
    }

    if (!this.userInfoStore.isCertified) {
      Modal.confirm({
        title: '未认证！',
        content: '未实名认证用户，禁止申请使用新区域。',
        okText: '前去认证',
        onOk: () => (this.routerStore.push(getPublicIdentityChoicePath()))
      })
      return
    }

    runInAction(() => {
      const regionInfo = this.configStore.getRegion({ region })
      this.applyOptions = regionInfo.apply
      this.agreeUserAgreement.set(false)
      this.estimatedCapacity.set(regionInfo.apply?.form?.expectedUsage[0]?.key || '')
      this.region = region
      this.visible = true
    })
  }

  @action.bound
  close() {
    this.visible = false
  }

  @autobind
  isApplyEnable(region: RegionSymbol): boolean {
    const regionInfo = this.configStore.getRegion({ region })
    if (regionInfo == null) {
      throw new Error('无效的 region')
    }

    return !!regionInfo.apply?.enable
  }

  @autobind
  isApplyDisabled(region: RegionSymbol): boolean {
    return this.isApplyEnable(region) && this.userInfoStore.isIamUser
  }

  @autobind
  hasAuditing(region: RegionSymbol): boolean {
    // 无需申请直接视为不在审核中
    if (!this.isApplyEnable(region)) {
      return false
    }

    if (!this.applyRecordList || this.applyRecordList.length === 0) {
      return false
    }

    return this.applyRecordList.some(record => (
      record.region === region
      && record.status === ApplyStatus.Auditing
    ))
  }

  @autobind
  isApproved(region: RegionSymbol): boolean {
    // 无需申请直接视为通过
    if (!this.isApplyEnable(region)) {
      return true
    }

    if (!this.applyRecordList || this.applyRecordList.length === 0) {
      return false
    }

    // 含有任意一条通过记录即为通过申请
    return this.applyRecordList.some(record => (
      record.region === region
      && record.status === ApplyStatus.Approved
    ))
  }

  @autobind
  @Toaster.handle('提交成功')
  async submit() {
    if (!this.agreeUserAgreement.value) {
      throw new Error('请勾选我已阅读使用限制。')
    }

    await this.regionApis.applyRegion({
      region: this.region!,
      capacity: this.estimatedCapacity.value
    })

    this.close()
  }

  @autobind
  @Toaster.handle()
  async fetchApplyRecordList() {
    const records = await this.regionApis.getRegionApply()
    runInAction(() => {
      this.applyRecordList = records
    })
  }
}
