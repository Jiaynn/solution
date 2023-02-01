/*
 * @file component Contact Drawer of SSLOverview Info
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observable, computed, reaction, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import Drawer from 'react-icecream/lib/drawer'

import { IContact } from '../../../../apis/ssl'
import DrawerStore from '../../../../stores/drawer'
import ContactForm, { IState, createState, getValue } from './Form'

export interface IContactDrawerProps {
  store: ContactDrawerStore
}

export const ContactDrawer = observer(function _ContactDrawer(props: IContactDrawerProps) {
  const { store } = props
  return (
    <Drawer
      title={store.title}
      width="640px"
      closable={false}
      onClose={() => store.cancel()}
      onOk={() => store.confirm()}
      visible={store.visible}
    >
      <ContactForm state={store.formState} />
    </Drawer>
  )
})

export class ContactDrawerStore extends DrawerStore<IContact, IContact> {
  constructor() {
    super()
    makeObservable(this)
  }

  @observable.ref formState: IState = createState()

  @action updateFormState(contact?: IContact) {
    this.formState = createState(contact)
  }

  @computed get title() {
    return this.drawerState.isModify ? '编辑用户信息' : '创建用户信息'
  }

  confirm() {
    this.formState.validate()
      .then(res => {
        if (res.hasError) {
          return
        }
        this.submit({ ...this.extra, ...getValue(this.formState) })
      })
  }

  init() {
    this.addDisposer(reaction(
      () => this.extra,
      contact => {
        this.updateFormState(contact)
      }
    ))
  }
}
