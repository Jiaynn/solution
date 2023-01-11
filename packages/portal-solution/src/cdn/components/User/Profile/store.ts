/*
 * @file 基本信息页面
 * @author zhuhao <zhuhao@qiniu.com>
 */

import { computed } from 'mobx'
import { FieldState, FormState } from 'formstate-x'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import autobind from 'autobind-decorator'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { UserInfoApis, IUserProfile } from 'portal-base/user/account'
import { I18nStore } from 'portal-base/common/i18n'

enum LoadingType {
  FetchProfile = 'fetchProfile',
  UpdateProfile = 'updateProfile'
}

const messages = {
  validateIm: {
    cn: '请输入正确的 QQ 号',
    en: 'Please enter a valid QQ.'
  },
  updateCompleted: {
    cn: '更新成功',
    en: 'Update completed.'
  }
}

export type IState = FormState<{
  address: FieldState<string>
  im: FieldState<string>
  nickname: FieldState<string>
}>

export function createState(i18n: I18nStore): IState {
  return new FormState({
    address: new FieldState(''),
    nickname: new FieldState(''),
    im: new FieldState('').validators(val => /[^0-9]+/.test(val) && i18n.t(messages.validateIm))
  })
}

export function getValue(state: IState) {
  return {
    contact_address: state.$.address.value,
    nickname: state.$.nickname.value,
    im: state.$.im.value
  }
}

@injectable()
export default class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  userState = createState(this.i18n)

  website = ''

  constructor(private userInfoApis: UserInfoApis, public i18n: I18nStore) {
    super()
  }

  @computed get isLoadingProfile(): boolean {
    return !this.loadings.isAllFinished()
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.FetchProfile)
  fetchProfile() {
    return this.userInfoApis.getProfile().then((profile: IUserProfile) => {
      this.website = profile.website
      this.userState.$.address.onChange(profile.contact_address)
      this.userState.$.nickname.onChange(profile.nickname)
      this.userState.$.im.onChange(profile.im)
    })
  }

  @autobind
  @ToasterStore.handle(messages.updateCompleted)
  @Loadings.handle(LoadingType.UpdateProfile)
  updateProfile() {
    const params = {
      ...getValue(this.userState),
      website: this.website
    }
    return this.userInfoApis.setProfile(params).then(this.fetchProfile)
  }

  init() {
    this.addDisposer(this.userState.dispose)
    return this.fetchProfile()
  }
}
