/**
 * @file 私有云登录
 * @author JinXM
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'
import { Tooltip, Form, Button, Input, Icon, Spin, Alert } from 'react-icecream'
import { bindFormItem, bindTextInput } from 'portal-base/common/form'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { RouterStore } from 'portal-base/common/router'

import { humanizePasswordRule } from 'portal-base/user/account'

import { upsertUrlQuery } from 'kodo/utils/url'

import { ConfigStore } from 'kodo/stores/config'

import { App } from 'kodo/constants/app'

import { GuestLayout } from 'kodo/components/common/Layout/GuestLayout'

import { SignInApis } from 'kodo/apis/sign-in'

import { LocalSignInStore } from './store'

import styles from './style.m.less'

// TODO: 抽取到 portal-base 然后集成到 portal-platform
// TODO: 重构。。。 = =！！
// https://github.com/qbox/rmb-web/blob/master/portal-platform/src/components/Signin/index.tsx

const formItemLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 }
}

const SignInForm = observer(function _SignInForm(props: { store: LocalSignInStore }) {
  const { store } = props
  const formFields = store.signInFormState.$

  return (
    <div className={styles.formWrap}>
      <Form className={styles.form}>
        <Form.Item
          {...formItemLayout}
          {...bindFormItem(formFields.user)}
          className={styles.formGroup}
        >
          <Input
            placeholder="注册邮箱"
            prefix={<Icon type="mail" className={styles.icon} />}
            {...bindTextInput(formFields.user)}
          />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          {...bindFormItem(formFields.pwd)}
          className={styles.formGroup}
        >
          <Input.Password
            placeholder="登录密码"
            prefix={<Icon type="lock" className={styles.icon} />}
            {...bindTextInput(formFields.pwd)}
          />
        </Form.Item>
        {store.shouldInputCaptcha && (
          <Form.Item
            className={styles.formGroup}
            {...formItemLayout}
            {...bindFormItem(formFields.captcha)}
          >
            <div className={styles.captcha}>
              <Input
                type="text"
                className={styles.input}
                readOnly={store.isFetchingCaptcha}
                {...bindTextInput(formFields.captcha)}
                placeholder="请输入验证码"
                autoComplete="off"
              />
              <Spin spinning={store.isFetchingCaptcha}>
                <img
                  alt="captcha"
                  className={styles.image}
                  src={store.captchaImageSrc}
                  onClick={() => store.refreshCaptcha()}
                />
              </Spin>
            </div>
          </Form.Item>
        )}
        <Form.Item
          className={styles.formGroup}
          {...formItemLayout}
        >
          <Button
            type="primary"
            htmlType="submit"
            onClick={store.doSignIn}
            loading={store.isSigning}
            disabled={store.shouldForbidSignInSubmit}
            className={styles.formButton}
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
})

const ResetPasswordForm = observer(function _ResetPasswordForm(props: { store: LocalSignInStore }) {
  const { store } = props

  if (store.resetPasswordFormState == null) {
    return null
  }

  const formFields = store.resetPasswordFormState.$

  return (
    <div className={styles.formWrap}>
      <Alert
        type="warning"
        className={styles.alert}
        message="管理员开启了定期修改密码功能，请重置密码"
      />
      <Form className={styles.form}>
        <Form.Item
          className={styles.formGroup}
          {...formItemLayout}
          {...bindFormItem(formFields.email)}
        >
          <Input
            placeholder="邮箱"
            prefix={<Icon type="mail" className={styles.icon} />}
            {...bindTextInput(formFields.email)}
          />
        </Form.Item>
        <Form.Item
          className={styles.formGroup}
          {...formItemLayout}
          {...bindFormItem(formFields.oldPassword)}
        >
          <Input.Password
            placeholder="旧密码"
            prefix={<Icon type="lock" className={styles.icon} />}
            {...bindTextInput(formFields.oldPassword)}
          />
        </Form.Item>
        <Form.Item
          className={styles.formGroup}
          {...formItemLayout}
          {...bindFormItem(formFields.newPassword)}
        >
          <Input.Password
            placeholder="新密码"
            prefix={
              <Tooltip title={humanizePasswordRule(store.passwordRuleStore.rule)}>
                <Icon type="question-circle" />
              </Tooltip>
            }
            {...bindTextInput(formFields.newPassword)}
          />
        </Form.Item>
        <Form.Item
          className={styles.formGroup}
          {...formItemLayout}
          {...bindFormItem(formFields.verificationPassword)}
        >
          <Input.Password
            placeholder="重新输入密码"
            prefix={<Icon type="lock" className={styles.icon} />}
            {...bindTextInput(formFields.verificationPassword)}
          />
        </Form.Item>
        <Form.Item
          className={styles.formGroup}
          {...formItemLayout}
        >
          <Button
            type="primary"
            htmlType="submit"
            className={styles.formButton}
            onClick={store.doResetPassword}
            loading={store.isResettingPassword}
            disabled={store.shouldForbidResetPasswordSubmit}
          >
            重置密码
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
})

const SignInHeader = observer(() => {
  const configStore = useInjection(ConfigStore)
  const baseConfig = configStore.getBase(App.Platform)

  return (
    <header className={styles.header}>
      {baseConfig.site.logo && (
        <img
          src={baseConfig.site.logo}
          className={styles.logo}
          alt="logo"
        />
      )}
    </header>
  )
})

const SignInFooter = observer(() => {
  const configStore = useInjection(ConfigStore)

  const copyright = React.useMemo(() => {
    const baseConfig = configStore.getBase(App.Platform)
    return baseConfig.site.copyright
  }, [configStore])

  return (
    <footer className={styles.footer}>
      {copyright && (
        <p className={styles.copyright}>
          {copyright}
        </p>
      )}
    </footer>
  )
})

export default observer(function LocalSignIn() {
  const signInApis = useInjection(SignInApis)
  const toasterStore = useInjection(Toaster)
  const configStore = useInjection(ConfigStore)
  const platformConfig = configStore.getBase(App.Platform)

  const routerStore = useInjection(RouterStore)
  const localSignInStore = useLocalStore(LocalSignInStore)

  const signInType = platformConfig.signIn.type
  const { redirect = window.location.href } = routerStore.query
  const shouldUseLocal = signInType === 'local' || localSignInStore.queryInfo.local

  // 根据配置执行对应的登录逻辑
  // 完整流程参考文档：https://cf.qiniu.io/pages/viewpage.action?pageId=87503622
  const handleSignIn = React.useCallback(async () => {
    let ssoSignInUrl = ''
    const locationOrigin = window.location.origin
    const rootPath = platformConfig.site.rootPath || ''

    // external-sso 登录实现
    if (signInType === 'external-sso') {
      // sso 的登录回跳地址（用于友好展示错误信息，非 token 实际消费者）
      const frontBackUrl = encodeURIComponent(formatURL(
        `${locationOrigin}${rootPath}/sso-signin-back`,
        { redirect }
      ))

      const gaeaUrl = `${locationOrigin}/api/gaea/private/external/sso/signin?redirect=${frontBackUrl}`
      const ssoInfo = await signInApis.getExternalSsoInfo()
      if (ssoInfo.signin_url) {
        ssoSignInUrl = upsertUrlQuery(ssoInfo.signin_url, {
          redirect: gaeaUrl
        })
      }
    }

    if (ssoSignInUrl) return window.location.replace(ssoSignInUrl)
    throw new Error('Invalid sso signin url configure')
  }, [platformConfig.site.rootPath, signInApis, redirect, signInType])

  React.useEffect(() => {
    if (shouldUseLocal) return
    toasterStore.promise(handleSignIn())
  }, [handleSignIn, shouldUseLocal, signInType, toasterStore])

  return (
    <GuestLayout>
      {shouldUseLocal && (
        <div className={styles.container}>
          <SignInHeader />
          {
            localSignInStore.queryInfo.isPasswordExpired
              ? (<ResetPasswordForm store={localSignInStore} />)
              : (<SignInForm store={localSignInStore} />)
          }
          <SignInFooter />
        </div>
      )}
    </GuestLayout>
  )
})
