/*
 * @file component Company Drawer of SSLOverview Info
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observable, computed, reaction, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import Drawer from 'react-icecream/lib/drawer'

import { ICompany } from '../../../../apis/ssl'
import DrawerStore from '../../../../stores/drawer'
import CompanyForm, { IState, createState, getValue } from './Form'

export interface ICompanyDrawerProps {
  store: CompanyDrawerStore
}

export const CompanyDrawer = observer(function _CompanyDrawer(props: ICompanyDrawerProps) {
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
      <CompanyForm state={store.formState} />
    </Drawer>
  )
})

export class CompanyDrawerStore extends DrawerStore<ICompany, ICompany> {
  constructor() {
    super()
    makeObservable(this)
  }

  @observable.ref formState: IState = createState()

  @action updateFormState(company?: ICompany) {
    this.formState = createState(company)
  }

  @computed get title() {
    return this.drawerState.isModify ? '编辑公司信息' : '创建公司信息'
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
      company => {
        this.updateFormState(company)
      }
    ))
  }
}
