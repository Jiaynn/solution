/**
 * @file 私有云登录
 * @author JinXM
 * @author Surmon <i@surmon.com>
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { action, computed, observable, runInAction, reaction, when, makeObservable } from 'mobx'
import { FormState, FieldState } from 'formstate-x'
import autobind from 'autobind-decorator'
import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { GaeaApiException } from 'portal-base/user/gaea-client'
import { AuthApis, ICaptchaInfo, validatePassword, UserInfoStore, mailReg } from 'portal-base/user/account'
import { RouterStore } from 'portal-base/common/router'

import { makeCancelled } from 'qn-fe-core/exception'

import { getBooleanQuery, updateQueryString } from 'kodo/utils/route'

import { getFirstQuery } from 'kodo/utils/url'

import { ConfigStore } from 'kodo/stores/config'
import { PasswordRuleStore } from 'kodo/stores/password-rule'

import { App } from 'kodo/constants/app'

export enum Loading {
  SignIn = 'SignIn',
  GetCaptcha = 'GetCaptcha',
  GetPasswordRule = 'GetPasswordRule',
  ResetPassword = 'ResetPassword'
}

type ResetPasswordForm = FormState<{
  email: FieldState<string>
  oldPassword: FieldState<string>
  newPassword: FieldState<string>
  verificationPassword: FieldState<string>
}>

@injectable()
export class LocalSignInStore extends Store {

  constructor(
    private routerStore: RouterStore,
    private userInfoStore: UserInfoStore,
    private toasterStore: Toaster,
    private configStore: ConfigStore,
    private authApis: AuthApis
  ) {
    super()
    makeObservable(this)
    Toaster.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, Loading)
  passwordRuleStore = new PasswordRuleStore(
    this.configStore,
    this.authApis
  )

  @observable.ref captcha: ICaptchaInfo | null = null

  @observable.ref resetPasswordFormState: ResetPasswordForm
  @observable.ref signInFormState = this.createSignInFormState()

  @computed
  get queryInfo() {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {
      local,
      email,
      redirect,
      isPasswordExpired
    } = this.routerStore.query

    return {
      email: getFirstQuery(email),
      redirect: getFirstQuery(redirect),
      local: getBooleanQuery(getFirstQuery(local)),
      isPasswordExpired: getBooleanQuery(getFirstQuery(isPasswordExpired))
    }
  }

  @action.bound
  setPasswordExpired(isExpired: boolean) {
    updateQueryString(this.routerStore, { isPasswordExpired: isExpired })
  }

  @autobind
  createSignInFormState() {
    const state = new FormState({
      user: new FieldState(this.queryInfo.email || '').validators(user => !mailReg.test(user) && '请输入正确的邮箱'),
      pwd: new FieldState('').validators(pwd => !pwd && '密码不可为空'),
      captcha: new FieldState('')
        .validators(captcha => !captcha && '请输入验证码')
        .disableValidationWhen(() => !this.shouldInputCaptcha)
    })

    this.addDisposer(state.dispose)

    return state
  }

  @autobind
  createResetPasswordFormState(email?: string) {
    const state = new FormState({
      email: new FieldState(email || '').validators(e => !mailReg.test(e) && '请输入正确的邮箱'),
      oldPassword: new FieldState('').validators(pwd => !pwd && '密码不可为空'),
      newPassword: new FieldState(''),
      verificationPassword: new FieldState('')
    })

    state.$.newPassword.validators(
      pwd => validatePassword(pwd, this.passwordRuleStore.rule),
      pwd => pwd === state.value.oldPassword && '新密码不能与旧密码相同'
    )

    state.$.verificationPassword.validators(pwd => pwd !== state.value.newPassword && '两次密码输入不一致，请检查输入')
    this.addDisposer(state.dispose)
    return state
  }

  @computed get platformConfig() {
    return this.configStore.getBase(App.Platform)
  }

  @computed get shouldInputCaptcha() {
    return this.captcha && this.captcha.enabled
  }

  @computed get captchaImageSrc() {
    if (this.shouldInputCaptcha) return this.captcha!.data
  }

  @computed get isFetchingCaptcha() {
    return this.loadings.isLoading(Loading.GetCaptcha)
  }

  @computed get isResettingPassword() {
    return this.loadings.isLoading(Loading.ResetPassword)
  }

  @computed get isSigning() {
    return this.loadings.isLoading(Loading.SignIn)
  }

  @computed get shouldForbidSignInSubmit() {
    return this.isFetchingCaptcha
      || this.isSigning
      || this.signInFormState.hasError
  }

  @computed get shouldForbidResetPasswordSubmit() {
    return !this.queryInfo.isPasswordExpired
      || this.isResettingPassword
      || this.resetPasswordFormState.hasError
  }

  @action.bound updateCaptcha(captcha: ICaptchaInfo) {
    this.captcha = captcha
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.GetPasswordRule)
  fetchPasswordRule() {
    return this.passwordRuleStore.fetchRule()
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.GetCaptcha)
  async refreshCaptcha(wrongCaptchaErrorText?: string) {
    const user = this.signInFormState.$.user
    const res = await user.validate()
    if (res.hasError) {
      throw makeCancelled()
    }

    const captcha = await this.authApis.getCaptcha(user.value)
    // 在任何一次验证码请求得到 enabled: true 之后，今后的一切验证码都将是存在的
    // 所以在验证码 enabled: false 时，应什么都不做
    if (!captcha.enabled) {
      throw makeCancelled()
    }

    runInAction(() => {
      this.updateCaptcha(captcha)
      // 拿到新的验证码之后，需重置本地验证码，并校验给出对应提示
      // set 本身会保持对应 field 原有的校验状态；即：
      // - 若此字段曾被校验过，set 后会被继续校验
      // - 若此字段刚被启用（shouldInputCaptcha），则不会校验
      this.signInFormState.$.captcha.set('')
    })
    // setError 与 validate 都可以起到 “输出错误” 的目的
    // setError 在当外部有文案定制需求时使用，否则使用 validate 输出默认校验文案
    // 但 “验证码从无到有” 这件事是不可预期的，故上面 set 存在不校验字段的可能
    // 也就是说 set 执行后有两种可能：
    // 1. 不校验
    //   - 第一次验证码输入框出现时，用户从未有过输入，所以 set 不会引发 validate
    //   - 如果同时 wrongCaptchaErrorText 不存在，前端是需要提示出默认的校验错误，而不是什么都不做
    // 2. 校验
    //   - 由于校验是异步的，故同步执行 setError 产生的结果会被异步的校验结果覆盖（达不到预期的效果）
    //   - 如果要保持 setError 一定有效果，则必须保证 setError 在 validate.done 之后执行
    // 综上两点，此处无论如何都需要主动校验，并等待校验完成再选择性地追加（覆盖）文案
    await this.signInFormState.$.captcha.validate()
    if (wrongCaptchaErrorText) {
      this.signInFormState.$.captcha.setError(wrongCaptchaErrorText)
    }
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.SignIn)
  async doSignIn(e) {
    e.preventDefault()

    const data = await this.signInFormState.validate()
    if (data.hasError) {
      throw makeCancelled()
    }

    try {
      await this.userInfoStore.signIn(
        this.signInFormState.$.user.value,
        this.signInFormState.$.pwd.value,
        this.shouldInputCaptcha ? this.signInFormState.$.captcha.value : undefined
      )

      // TODO: 未登录处理优化（祖传代码，勿删；欲知详情，请 @zhangheng）
      if (this.userInfoStore.isGuest) {
        throw new Error('登录失败，请重试')
      }
    } catch (error) {
      this.setPasswordExpired(error instanceof GaeaApiException && error.code === 71001)
      const isWrongCaptchaError = error instanceof GaeaApiException && error.code === 7210

      // 若登录失败，无论因为什么原因，都需要重新拉取验证码结果
      this.refreshCaptcha(isWrongCaptchaError ? '验证码错误，请重新输入' : '')
      // 如果是验证码错误引起的接口错误，应该将此错误吞掉，防止传递到 toasterStore
      if (isWrongCaptchaError) {
        throw makeCancelled()
      }

      throw error
    }
  }

  @autobind
  @Toaster.handle('修改成功, 请重新登录')
  @Loadings.handle(Loading.ResetPassword)
  async doResetPassword(e) {
    e.preventDefault()

    const data = await this.resetPasswordFormState.validate()
    if (data.hasError) {
      throw makeCancelled()
    }

    const { email, oldPassword, newPassword } = this.resetPasswordFormState.value
    await this.authApis.resetPasswordByOldPassword(email, oldPassword, newPassword)
    this.setPasswordExpired(false)
  }

  @autobind handleRedirect() {
    // 默认跳转去用户中心
    if (!this.queryInfo.redirect) {
      window.location.href = `${this.configStore.rootPath}/user`
      return
    }

    window.location.replace(this.queryInfo.redirect)
  }

  async init() {
    this.addDisposer(
      this.passwordRuleStore.dispose
    )

    this.addDisposer(when(
      () => !this.userInfoStore.isGuest,
      () => this.handleRedirect()
    ))

    this.addDisposer(reaction(
      () => this.queryInfo.isPasswordExpired,
      isPasswordExpired => {
        if (isPasswordExpired) {
          this.passwordRuleStore.fetchRule()
          const { user } = this.signInFormState.value
          this.resetPasswordFormState = this.createResetPasswordFormState(user)
          this.signInFormState.reset()
        }
      },
      { fireImmediately: true }
    ))
  }
}
