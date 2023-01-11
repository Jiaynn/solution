/**
 * @file component Security
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Spin } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { humanizePasswordRule, validatePassword, Security as BaseSecurity } from 'portal-base/user/account'

import { PasswordRuleStore } from 'kodo/stores/password-rule'
import { SignInStore } from 'kodo/stores/sign-in'

enum Loading {
  GetPasswordRule = 'GetPasswordRule'
}

interface IProps {
  passwordRuleStore: PasswordRuleStore
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalSecurity extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  loadings = Loadings.collectFrom(this, Loading)

  componentDidMount() {
    this.fetchPasswordRule()
  }

  componentWillUnmount() {
    this.props.passwordRuleStore.dispose()
  }

  @autobind
  @Toaster.handle()
  fetchPasswordRule() {
    return this.props.passwordRuleStore.fetchRule()
  }

  @computed
  get passwordRuleTip() {
    return humanizePasswordRule(this.props.passwordRuleStore.rule)
  }

  render() {
    return (
      <Spin spinning={this.loadings.isLoading(Loading.GetPasswordRule)}>
        <Inject render={({ inject }) => {
          const signInStore = inject(SignInStore)
          return (
            <BaseSecurity
              passwordRuleTip={this.passwordRuleTip}
              onPasswordChanged={() => { signInStore.gotoSignOut() }}
              passwordValidator={pwd => validatePassword(pwd, this.props.passwordRuleStore.rule)}
            />
          )
        }} />
      </Spin>
    )
  }
}

export default function Security() {
  const passwordRuleStore = useLocalStore(PasswordRuleStore)

  return (
    <Inject render={({ inject }) => (
      <InternalSecurity passwordRuleStore={passwordRuleStore} inject={inject} />
    )} />
  )
}
