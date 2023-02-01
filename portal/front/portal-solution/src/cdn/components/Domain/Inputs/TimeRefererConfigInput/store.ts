/**
 * @file Domain Time Referer Config Store
 * @author linchen <gakiclin@gmail.com>
 */

import { FieldState, FormState } from 'formstate-x'
import { action } from 'mobx'
import copy from 'copy-text-to-clipboard'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { genRandomKey } from 'cdn/utils/domain/time-referer'

import { validateTimeACLKey, validateDuplicateTimeACLKey, validateCheckUrl } from 'cdn/transforms/domain/time-referer'

import { IProps, ITimeRefererConfig, getDefaultTimeRefererConfig } from '.'

export type State = FormState<{
  timeACL: FieldState<boolean>
  timeACLKey1: FieldState<string>
  timeACLKey2: FieldState<string>
  checkUrl: FieldState<string>
}>

export type Value = ITimeRefererConfig

export function createState(arg?: Value): State {
  const value: Value = { ...getDefaultTimeRefererConfig(), ...arg }
  const form = new FormState({
    timeACL: new FieldState(value.timeACL),
    timeACLKey1: new FieldState(value.timeACLKeys[0]).validators(validateTimeACLKey),
    timeACLKey2: new FieldState(value.timeACLKeys[1]).validators(validateTimeACLKey),
    checkUrl: new FieldState(value.checkUrl)
  })

  form.disableValidationWhen(() => form.$.timeACL.value === false)

  form.$.checkUrl.validators(
    v => validateCheckUrl([form.$.timeACLKey1.value, form.$.timeACLKey2.value])(v)
  )

  form.$.timeACLKey2.validators(
    v => validateDuplicateTimeACLKey(form.$.timeACLKey1.value, v)
  )

  return form
}

export function getValue(state: State): Value {
  return {
    timeACL: state.$.timeACL.value,
    checkUrl: state.$.checkUrl.value,
    timeACLKeys: [
      state.$.timeACLKey1.value || '',
      state.$.timeACLKey2.value || ''
    ]
  }
}

@injectable()
export default class LocalStore extends Store {

  constructor(
    @injectProps() public props: IProps,
    private toasterStore: Toaster
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @action.bound
  generateKeys() {
    this.props.state.$.timeACLKey1.set(genRandomKey())
    this.props.state.$.timeACLKey2.set(genRandomKey())
  }

  copyKey(key: string) {
    if (copy(key) === true) {
      this.toasterStore.success('复制防盗链 KEY 值成功，请妥善保管')
    } else {
      this.toasterStore.error('复制失败，请手动选中复制')
    }
  }
}
